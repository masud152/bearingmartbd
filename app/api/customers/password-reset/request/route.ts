import { env } from "cloudflare:workers";
import { canonicalEmail, createSecureToken, tokenHash } from "../../../../customer-auth";
import { passwordResetLink, sendPasswordResetEmail } from "../../../../password-reset-email";

const neutral = () => Response.json({ ok: true, message: "If an account matches that email address, password reset instructions will be sent shortly." }, { headers: { "cache-control": "no-store" } });

export async function POST(request: Request) {
  let body: { email?: unknown };
  try { body = await request.json(); } catch { return neutral(); }
  const email = canonicalEmail(body.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return neutral();
  const customer = await env.DB.prepare("SELECT id,email FROM customers WHERE lower(email)=? LIMIT 1").bind(email).first<{ id: string; email: string }>();
  if (!customer) return neutral();
  const now = new Date();
  const token = createSecureToken();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
  await env.DB.batch([
    env.DB.prepare("UPDATE customer_password_resets SET used_at=? WHERE customer_id=? AND used_at IS NULL").bind(now.toISOString(), customer.id),
    env.DB.prepare("INSERT INTO customer_password_resets (id,customer_id,token_hash,expires_at,used_at,created_at) VALUES (?,?,?,?,NULL,?)").bind(crypto.randomUUID(), customer.id, await tokenHash(token), expiresAt, now.toISOString()),
  ]);
  try { await sendPasswordResetEmail({ email: customer.email, resetLink: passwordResetLink(token) }); } catch { /* Keep the public response neutral; delivery is retried through the provider, not the browser. */ }
  return neutral();
}
