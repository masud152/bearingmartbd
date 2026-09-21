import { createPool } from "mysql2/promise";
import { readFile } from "node:fs/promises";

const input = process.argv[2];
if (!input) throw new Error("Usage: node scripts/import-d1-json.mjs <approved-d1-export.json>");
const required = (name) => {
  if (!process.env[name]) throw new Error(`${name} is required`);
  return process.env[name];
};
const allowedTables = new Set(["site_stats", "admin_users", "roles", "permissions", "user_roles", "role_permissions", "categories", "brands", "products", "product_specifications", "site_settings", "customers", "customer_sessions", "customer_password_resets", "audit_events"]);
const exportData = JSON.parse(await readFile(input, "utf8"));
const tables = exportData.tables;
if (!tables || typeof tables !== "object") throw new Error("Expected export JSON with a tables object");
const pool = createPool({ host: required("DB_HOST"), port: Number(process.env.DB_PORT || 3306), user: required("DB_USER"), password: required("DB_PASSWORD"), database: required("DB_NAME"), charset: "utf8mb4" });
const connection = await pool.getConnection();
try {
  await connection.beginTransaction();
  for (const [table, rows] of Object.entries(tables)) {
    if (!allowedTables.has(table)) throw new Error(`Refusing unsupported table: ${table}`);
    if (!Array.isArray(rows)) throw new Error(`Rows for ${table} must be an array`);
    const [[count]] = await connection.query(`SELECT COUNT(*) AS count FROM \`${table}\``);
    if (Number(count.count) !== 0) throw new Error(`Refusing to import into non-empty table: ${table}`);
    for (const row of rows) {
      const columns = Object.keys(row);
      if (!columns.length) continue;
      const quoted = columns.map((column) => `\`${column.replaceAll("`", "``")}\``).join(", ");
      const placeholders = columns.map(() => "?").join(", ");
      await connection.execute(`INSERT INTO \`${table}\` (${quoted}) VALUES (${placeholders})`, columns.map((column) => row[column]));
    }
  }
  await connection.commit();
  console.log("D1 export import completed. Verify row counts before any cutover.");
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
  await pool.end();
}
