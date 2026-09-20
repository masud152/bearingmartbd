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
assert.deepEqual(migrationFiles, [
  "0000_site_stats.sql",
  "0001_admin_panel.sql",
  "0002_product_sort_order.sql",
  "0003_product_image.sql",
  "0004_customers.sql",
  "0005_customer_auth.sql",
  "0006_available_brands.sql",
  "0008_ball_bearing_brands.sql",
  "0009_admin_all_category_catalogue.sql",
  "0010_super_admin_customer_permission.sql",
]);
assert.ok(!tables.includes("customer_password_resets"));

console.log(JSON.stringify({ migrationFiles, tables }));
database.close();
