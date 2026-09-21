import { createPool } from "mysql2/promise";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
const required = (name) => { if (!process.env[name]) throw new Error(`${name} is required`); return process.env[name]; };
const pool = createPool({ host: required("DB_HOST"), port: Number(process.env.DB_PORT || 3306), user: required("DB_USER"), password: required("DB_PASSWORD"), database: required("DB_NAME"), multipleStatements: true, charset: "utf8mb4" });
await pool.query("CREATE TABLE IF NOT EXISTS schema_migrations (filename VARCHAR(255) PRIMARY KEY, applied_at VARCHAR(40) NOT NULL)");
const [applied] = await pool.query("SELECT filename FROM schema_migrations"); const done = new Set(applied.map((row) => row.filename));
const directory = join(process.cwd(), "selfhost", "mysql");
for (const filename of (await readdir(directory)).filter((file) => file.endsWith(".sql")).sort()) { if (done.has(filename)) continue; const sql = await readFile(join(directory, filename), "utf8"); const connection = await pool.getConnection(); try { await connection.beginTransaction(); await connection.query(sql); await connection.execute("INSERT INTO schema_migrations (filename,applied_at) VALUES (?,?)", [filename, new Date().toISOString()]); await connection.commit(); console.log(`Applied ${filename}`); } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); } }
await pool.end();
