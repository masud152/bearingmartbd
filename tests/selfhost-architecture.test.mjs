import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("self-host runtime uses Next and no Worker-only package", async () => {
  const pkg = JSON.parse(await read("package.json"));
  assert.equal(pkg.scripts.build, "next build");
  assert.equal(pkg.scripts.start, "node app.cjs");
  assert.ok(pkg.dependencies.next);
  for (const removed of ["vinext", "wrangler", "vite", "@cloudflare/vite-plugin"]) assert.equal(pkg.dependencies[removed] ?? pkg.devDependencies[removed], undefined);
});

test("deployment environment lists names only and health endpoint checks the database", async () => {
  const env = await read(".env.example");
  for (const name of ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD", "MEDIA_ROOT", "SESSION_SECRET"]) assert.match(env, new RegExp(`^${name}=`, "m"));
  const health = await read("app/api/health/route.ts");
  assert.match(health, /env\.DB\.ping\(\)/);
  assert.doesNotMatch(env, /Contact@0123456|ZJB#|PASSWORD_RESET_EMAIL_WEBHOOK_URL/);
});

test("migration and import tools are non-destructive by default", async () => {
  const importer = await read("scripts/import-d1-json.mjs");
  const r2Importer = await read("scripts/import-r2-files.mjs");
  assert.match(importer, /Refusing to import into non-empty table/);
  assert.match(r2Importer, /Refusing to overwrite existing media/);
  const schema = await read("selfhost/mysql/0001_initial.sql");
  for (const table of ["customers", "products", "admin_users", "roles", "customer_sessions"]) assert.match(schema, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
});
