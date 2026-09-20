import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const database = new DatabaseSync(":memory:");
const migrationFiles = (await readdir("drizzle"))
  .filter((file) => /^\d{4}_.*\.sql$/.test(file))
  .sort();

for (const file of migrationFiles) {
  database.exec(await readFile(join("drizzle", file), "utf8"));
}

const tables = database
  .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
  .all()
  .map(({ name }) => name);
const resetIndexes = database
  .prepare("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='customer_password_resets' ORDER BY name")
  .all()
  .map(({ name }) => name)
  .filter((name) => !name.startsWith("sqlite_autoindex"));

assert.equal(migrationFiles.length, 11);
assert.ok(tables.includes("customer_password_resets"));
assert.deepEqual(resetIndexes, [
  "idx_customer_password_resets_customer",
  "idx_customer_password_resets_token",
]);

console.log(JSON.stringify({ migrationFiles, tables, resetIndexes }));
database.close();
