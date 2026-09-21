import { readFile } from "node:fs/promises";
const sql = await readFile(new URL("../selfhost/mysql/0001_initial.sql", import.meta.url), "utf8");
const required = ["admin_users", "admin_sessions", "customers", "customer_sessions", "products", "categories", "brands", "product_specifications", "role_permissions", "customer_password_resets"];
for (const name of required) if (!sql.includes(` ${name}`)) throw new Error(`Missing ${name}`);
console.log(`MySQL schema check passed for ${required.length} required tables.`);
