import bcrypt from "bcryptjs";
import { createPool } from "mysql2/promise";
import { randomUUID } from "node:crypto";

const required = (name) => {
  if (!process.env[name]) throw new Error(`${name} is required`);
  return process.env[name];
};

const email = required("ADMIN_BOOTSTRAP_EMAIL").trim().toLowerCase();
const password = required("ADMIN_BOOTSTRAP_PASSWORD");
if (password.length < 12) throw new Error("ADMIN_BOOTSTRAP_PASSWORD must be at least 12 characters");

const pool = createPool({
  host: required("DB_HOST"),
  port: Number(process.env.DB_PORT || 3306),
  user: required("DB_USER"),
  password: required("DB_PASSWORD"),
  database: required("DB_NAME"),
  charset: "utf8mb4",
});

const connection = await pool.getConnection();
try {
  await connection.beginTransaction();
  const now = new Date().toISOString();
  const [existing] = await connection.execute("SELECT id FROM admin_users WHERE email = ? LIMIT 1", [email]);
  const userId = existing[0]?.id || randomUUID();
  const passwordHash = await bcrypt.hash(password, 12);
  if (existing.length) {
    await connection.execute("UPDATE admin_users SET password_hash = ?, status = 'active', updated_at = ? WHERE id = ?", [passwordHash, now, userId]);
  } else {
    await connection.execute("INSERT INTO admin_users (id, email, display_name, password_hash, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'active', ?, ?)", [userId, email, "Administrator", passwordHash, now, now]);
  }
  const roleId = "super-admin";
  await connection.execute("INSERT IGNORE INTO roles (id, name, description, is_system, created_at, updated_at) VALUES (?, 'Super administrator', 'Full administrative access', TRUE, ?, ?)", [roleId, now, now]);
  const permissions = ["admin.access", "products.read", "products.create", "products.update", "products.delete", "customers.read", "customers.update", "users.read", "users.create", "users.update", "roles.read", "roles.update", "audit.read"];
  for (const key of permissions) {
    await connection.execute("INSERT IGNORE INTO permissions (`key`, description) VALUES (?, ?)", [key, `Bootstrap permission: ${key}`]);
    await connection.execute("INSERT IGNORE INTO role_permissions (role_id, permission_key) VALUES (?, ?)", [roleId, key]);
  }
  await connection.execute("INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)", [userId, roleId]);
  await connection.commit();
  console.log(`Bootstrap administrator ready for ${email}`);
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
  await pool.end();
}
