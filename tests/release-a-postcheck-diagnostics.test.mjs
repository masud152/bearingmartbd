import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { columnDiagnostics, indexDiagnostics, normalizeColumnMetadata, normalizeIndexMetadata } from "../scripts/release-a-schema-inspection.mjs";

const expectedColumns = [
  ["series", "varchar(120)", "YES", null],
  ["data_verification_status", "varchar(32)", "NO", "manual_review"],
];
const expectedIndexes = {
  products_brand_designation_unique: { unique: true, columns: ["brand_id", "normalized_manufacturer_designation"] },
  products_basic_model_idx: { unique: false, columns: ["basic_model"] },
};

const compatibleColumns = () => new Map([
  ["series", { type: "varchar(120)", nullable: "YES", defaultValue: null }],
  ["data_verification_status", { type: "varchar(32)", nullable: "NO", defaultValue: "manual_review" }],
]);
const compatibleIndexes = () => new Map([
  ["products_brand_designation_unique", { unique: true, columns: ["brand_id", "normalized_manufacturer_designation"] }],
  ["products_basic_model_idx", { unique: false, columns: ["basic_model"] }],
]);

test("column diagnostics report a complete MySQL schema and normalize NULL defaults", () => {
  const diagnostic = columnDiagnostics(compatibleColumns(), expectedColumns);
  assert.equal(diagnostic.state, "complete");
  assert.equal(diagnostic.items[0].actual.defaultValue, "");
  assert.deepEqual(diagnostic.items.map((item) => item.result), ["match", "match"]);
});

test("mysql2 INFORMATION_SCHEMA rows are normalized with uppercase or explicit lowercase keys", () => {
  assert.deepEqual(
    normalizeColumnMetadata({ COLUMN_NAME: "series", COLUMN_TYPE: "varchar(120)", IS_NULLABLE: "YES", COLUMN_DEFAULT: null }),
    ["series", { type: "varchar(120)", nullable: "YES", defaultValue: null }],
  );
  assert.deepEqual(
    normalizeColumnMetadata({ column_name: "source_document", column_type: "varchar(255)", is_nullable: "YES", column_default: null }),
    ["source_document", { type: "varchar(255)", nullable: "YES", defaultValue: null }],
  );
  assert.deepEqual(
    normalizeIndexMetadata({ INDEX_NAME: "products_brand_designation_unique", NON_UNIQUE: 0, SEQ_IN_INDEX: 2, COLUMN_NAME: "normalized_manufacturer_designation" }),
    { name: "products_brand_designation_unique", nonUnique: 0, sequence: 2, columnName: "normalized_manufacturer_designation" },
  );
  assert.deepEqual(
    normalizeIndexMetadata({ index_name: "products_basic_model_idx", non_unique: 1, seq_in_index: 1, column_name: "basic_model" }),
    { name: "products_basic_model_idx", nonUnique: 1, sequence: 1, columnName: "basic_model" },
  );
});

test("mysql2 metadata rows fail closed when a required field is absent", () => {
  assert.throws(
    () => normalizeColumnMetadata({ COLUMN_NAME: "series", COLUMN_TYPE: "varchar(120)", IS_NULLABLE: "YES" }),
    /column_default\/COLUMN_DEFAULT/,
  );
  assert.throws(
    () => normalizeIndexMetadata({ INDEX_NAME: "products_basic_model_idx", NON_UNIQUE: 1, SEQ_IN_INDEX: 1 }),
    /column_name\/COLUMN_NAME/,
  );
});

test("column diagnostics distinguish absent, partial, and incompatible metadata", () => {
  assert.equal(columnDiagnostics(new Map(), expectedColumns).state, "absent");
  assert.equal(columnDiagnostics(new Map([["series", compatibleColumns().get("series")]]), expectedColumns).state, "partial");
  const incompatible = compatibleColumns();
  incompatible.set("series", { type: "varchar(80)", nullable: "YES", defaultValue: null });
  const report = columnDiagnostics(incompatible, expectedColumns);
  assert.equal(report.state, "incompatible");
  assert.equal(report.items[0].result, "incompatible");
});

test("index diagnostics report complete, absent, partial, and incompatible ordered definitions", () => {
  assert.equal(indexDiagnostics(compatibleIndexes(), expectedIndexes).state, "complete");
  assert.equal(indexDiagnostics(new Map(), expectedIndexes).state, "absent");
  assert.equal(indexDiagnostics(new Map([["products_basic_model_idx", compatibleIndexes().get("products_basic_model_idx")]]), expectedIndexes).state, "partial");
  const incompatible = compatibleIndexes();
  incompatible.set("products_brand_designation_unique", { unique: false, columns: ["normalized_manufacturer_designation", "brand_id"] });
  const report = indexDiagnostics(incompatible, expectedIndexes);
  assert.equal(report.state, "incompatible");
  assert.equal(report.items[0].result, "incompatible");
});

test("diagnose-only mode bypasses fail-closed state enforcement but cannot combine with apply", async () => {
  const source = await readFile(new URL("../scripts/release-a-catalogue-migrate.mjs", import.meta.url), "utf8");
  assert.match(source, /state\(\{ enforce: !diagnoseOnly \}\)/);
  assert.match(source, /--apply and --diagnose-only cannot be combined/);
  assert.match(source, /--reconcile-ledger requires --apply without --diagnose-only/);
  assert.match(source, /COLUMN_NAME AS column_name/);
  assert.match(source, /INDEX_NAME AS index_name/);
});
