import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Release A does not expose an unsafe generic catalogue migration", async () => {
  const [generic, releaseA, rootMigrations] = await Promise.all([
    read("scripts/migrate-mysql.mjs"), read("scripts/release-a-catalogue-migrate.mjs"), read("selfhost/mysql/0001_initial.sql"),
  ]);
  assert.match(generic, /readdir/);
  assert.match(releaseA, /information_schema\.columns/);
  assert.match(releaseA, /partial or incompatible/);
  assert.match(releaseA, /RELEASE_A_PRODUCTION_CONFIRM/);
  assert.match(releaseA, /0002_ball_bearing_catalogue\.sql/);
  assert.match(releaseA, /0003_manufacturer_master_data\.sql/);
  assert.match(rootMigrations, /CREATE TABLE IF NOT EXISTS schema_migrations/);
});

test("Release A reference seed is explicit, idempotent, and never creates products", async () => {
  const source = await read("scripts/release-a-catalogue-seed.mjs");
  assert.match(source, /catalogue-ball-bearings/);
  assert.match(source, /catalogue-brand-nsk/);
  assert.match(source, /productRecords: 0/);
  assert.doesNotMatch(source, /INSERT INTO products/);
  assert.match(source, /beginTransaction/);
});

test("Only verified published database products can reach the public catalogue", async () => {
  const [data, browser, detail] = await Promise.all([
    read("app/managed-product-data.ts"), read("app/catalog-browser.tsx"), read("app/products/ball-bearings/catalog/[number]/page.tsx"),
  ]);
  assert.match(data, /p\.status='published' AND p\.data_verification_status='verified'/);
  assert.match(data, /staticProducts\.filter/);
  assert.match(browser, /normalizeDesignation/);
  assert.match(detail, /Full manufacturer designation/);
});
