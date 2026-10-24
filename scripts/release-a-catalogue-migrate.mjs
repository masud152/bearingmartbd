import { createPool } from "mysql2/promise";

const apply = process.argv.includes("--apply");
const reconcileLedger = process.argv.includes("--reconcile-ledger");
const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
};

if (apply && process.env.APP_ENV === "production" && process.env.RELEASE_A_PRODUCTION_CONFIRM !== "apply-release-a-catalogue") {
  throw new Error("Production application requires RELEASE_A_PRODUCTION_CONFIRM=apply-release-a-catalogue.");
}
if (reconcileLedger && !apply) throw new Error("--reconcile-ledger requires --apply.");

const pool = createPool({ host: required("DB_HOST"), port: Number(process.env.DB_PORT || 3306), user: required("DB_USER"), password: required("DB_PASSWORD"), database: required("DB_NAME"), charset: "utf8mb4" });
const connection = await pool.getConnection();

const releaseA0002 = "0002_ball_bearing_catalogue.sql";
const releaseA0003 = "0003_manufacturer_master_data.sql";
const columns0002 = [
  ["series", "varchar(120)", "YES", null], ["basic_model", "varchar(120)", "YES", null], ["manufacturer_designation", "varchar(160)", "YES", null], ["normalized_manufacturer_designation", "varchar(160)", "YES", null], ["seal_shield", "varchar(255)", "YES", null], ["clearance", "varchar(120)", "YES", null], ["cage", "varchar(255)", "YES", null], ["dynamic_load_value", "decimal(14,3)", "YES", null], ["dynamic_load_unit", "varchar(12)", "YES", null], ["static_load_value", "decimal(14,3)", "YES", null], ["static_load_unit", "varchar(12)", "YES", null], ["speed_rpm", "int", "YES", null], ["speed_note", "varchar(255)", "YES", null], ["source_url", "varchar(2048)", "YES", null], ["source_title", "varchar(255)", "YES", null], ["source_verified_at", "varchar(40)", "YES", null],
];
const columns0003 = [["source_document", "varchar(255)", "YES", null], ["source_document_version", "varchar(120)", "YES", null], ["data_verification_status", "varchar(32)", "NO", "manual_review"]];
const indexes0002 = { products_brand_designation_unique: { unique: true, columns: ["brand_id", "normalized_manufacturer_designation"] }, products_basic_model_idx: { unique: false, columns: ["basic_model"] }, products_designation_search_idx: { unique: false, columns: ["normalized_manufacturer_designation"] } };
const indexes0003 = { products_verification_status_idx: { unique: false, columns: ["data_verification_status"] } };

async function migrationLedger() {
  const [rows] = await connection.query("SELECT filename FROM schema_migrations");
  return new Set(rows.map((row) => row.filename));
}
async function productColumns() {
  const [rows] = await connection.query("SELECT column_name,column_type,is_nullable,column_default FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='products'");
  return new Map(rows.map((row) => [row.column_name, { type: String(row.column_type).toLowerCase(), nullable: row.is_nullable, defaultValue: row.column_default }]));
}
async function productIndexes() {
  const [rows] = await connection.query("SELECT index_name,non_unique,seq_in_index,column_name FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='products' ORDER BY index_name,seq_in_index");
  const indexes = new Map();
  for (const row of rows) {
    const value = indexes.get(row.index_name) ?? { unique: Number(row.non_unique) === 0, columns: [] };
    value.columns.push(row.column_name);
    indexes.set(row.index_name, value);
  }
  return indexes;
}
function inspectColumns(columns, expected) {
  const present = expected.filter(([name]) => columns.has(name));
  if (present.length === 0) return "absent";
  if (present.length !== expected.length) return "partial";
  return present.every(([name, type, nullable, defaultValue]) => {
    const actual = columns.get(name);
    return actual.type === type && actual.nullable === nullable && String(actual.defaultValue ?? "") === String(defaultValue ?? "");
  }) ? "complete" : "incompatible";
}
function inspectIndexes(indexes, expected) {
  const names = Object.keys(expected), present = names.filter((name) => indexes.has(name));
  if (present.length === 0) return "absent";
  if (present.length !== names.length) return "partial";
  return names.every((name) => indexes.get(name).unique === expected[name].unique && indexes.get(name).columns.join(",") === expected[name].columns.join(",")) ? "complete" : "incompatible";
}
function assertSafeState(label, columnState, indexState, ledgerPresent) {
  if ([columnState, indexState].some((state) => state === "partial" || state === "incompatible")) throw new Error(`${label} is partial or incompatible (columns=${columnState}, indexes=${indexState}). Stop and inspect production; no automatic repair is permitted.`);
  if (ledgerPresent && (columnState !== "complete" || indexState !== "complete")) throw new Error(`${label} is recorded in schema_migrations but its schema definition does not match.`);
  if (!ledgerPresent && (columnState === "complete" || indexState === "complete") && !reconcileLedger) throw new Error(`${label} schema exists without its migration-ledger entry. Re-run only after manual review with --apply --reconcile-ledger.`);
}
async function state() {
  const [columns, indexes, ledger] = await Promise.all([productColumns(), productIndexes(), migrationLedger()]);
  const first = { columns: inspectColumns(columns, columns0002), indexes: inspectIndexes(indexes, indexes0002), ledger: ledger.has(releaseA0002) };
  const second = { columns: inspectColumns(columns, columns0003), indexes: inspectIndexes(indexes, indexes0003), ledger: ledger.has(releaseA0003) };
  assertSafeState(releaseA0002, first.columns, first.indexes, first.ledger);
  assertSafeState(releaseA0003, second.columns, second.indexes, second.ledger);
  if ((second.columns !== "absent" || second.indexes !== "absent") && first.columns !== "complete") throw new Error("0003 schema cannot exist before a complete 0002 schema.");
  return { first, second };
}
async function mark(filename) { await connection.execute("INSERT INTO schema_migrations (filename,applied_at) VALUES (?,?)", [filename, new Date().toISOString()]); }
async function verifyComplete() {
  const current = await state();
  if (current.first.columns !== "complete" || current.first.indexes !== "complete" || current.second.columns !== "complete" || current.second.indexes !== "complete") throw new Error("Post-migration verification failed.");
}
try {
  const before = await state();
  console.log(JSON.stringify({ database: process.env.DB_NAME, apply, before }, null, 2));
  if (!apply) process.exitCode = 0;
  else {
    if (!before.first.ledger) {
      if (before.first.columns !== "absent" || before.first.indexes !== "absent") {
        if (!reconcileLedger) throw new Error("0002 requires reconciliation review.");
        await mark(releaseA0002);
      } else {
        await connection.query(`ALTER TABLE products ${columns0002.map(([name, type, nullable, defaultValue]) => `ADD COLUMN \`${name}\` ${type.toUpperCase()} ${nullable === "NO" ? "NOT NULL" : "NULL"}${defaultValue == null ? "" : ` DEFAULT '${defaultValue}'`}`).join(", ")}`);
        await connection.query("CREATE UNIQUE INDEX products_brand_designation_unique ON products (brand_id, normalized_manufacturer_designation)");
        await connection.query("CREATE INDEX products_basic_model_idx ON products (basic_model)");
        await connection.query("CREATE INDEX products_designation_search_idx ON products (normalized_manufacturer_designation)");
        const checkedColumns = inspectColumns(await productColumns(), columns0002);
        const checkedIndexes = inspectIndexes(await productIndexes(), indexes0002);
        if (checkedColumns !== "complete" || checkedIndexes !== "complete") throw new Error("0002 post-check failed; do not retry automatically.");
        await mark(releaseA0002);
      }
    }
    const afterFirst = await state();
    if (!afterFirst.second.ledger) {
      if (afterFirst.second.columns !== "absent" || afterFirst.second.indexes !== "absent") {
        if (!reconcileLedger) throw new Error("0003 requires reconciliation review.");
        await mark(releaseA0003);
      } else {
        await connection.query(`ALTER TABLE products ${columns0003.map(([name, type, nullable, defaultValue]) => `ADD COLUMN \`${name}\` ${type.toUpperCase()} ${nullable === "NO" ? "NOT NULL" : "NULL"}${defaultValue == null ? "" : ` DEFAULT '${defaultValue}'`}`).join(", ")}`);
        await connection.query("CREATE INDEX products_verification_status_idx ON products (data_verification_status)");
        const checkedColumns = inspectColumns(await productColumns(), columns0003);
        const checkedIndexes = inspectIndexes(await productIndexes(), indexes0003);
        if (checkedColumns !== "complete" || checkedIndexes !== "complete") throw new Error("0003 post-check failed; do not retry automatically.");
        await mark(releaseA0003);
      }
    }
    await verifyComplete();
    console.log("Release A catalogue schema is verified.");
  }
} finally { connection.release(); await pool.end(); }
