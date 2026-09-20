import { env } from "cloudflare:workers";
import { hashPassword, tokenHash, validatePassword } from "../../../../customer-auth";
import { customerPasswordResetEnabled } from "../../../../customer-password-reset/availability";

const invalid = () => Response.json({ error: "This password reset link is invalid, expired, or has already been used." }, { status: 400, headers: { "cache-control": "no-store" } });

export async function POST(request: Request) {
  if (!customerPasswordResetEnabled) return new Response(null, { status: 404 });
  let body: { token?: unknown; password?: unknown; confirmPassword?: unknown };
  try { body = await request.json(); } catch { return invalid(); }
  const token = typeof body.token === "string" ? body.token : "";
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";
  if (!token || !validatePassword(password) || password !== confirmPassword) return Response.json({ error: "Use a matching 10–128 character password with uppercase, lowercase, and a number." }, { status: 400, headers: { "cache-control": "no-store" } });
  const now = new Date().toISOString();
  const reset = await env.DB.prepare("SELECT id,customer_id AS customerId FROM customer_password_resets WHERE token_hash=? AND used_at IS NULL AND expires_at>? LIMIT 1").bind(await tokenHash(token), now).first<{ id: string; customerId: string }>();
  if (!reset) return invalid();
  const changed = await env.DB.prepare("UPDATE customer_password_resets SET used_at=? WHERE id=? AND used_at IS NULL AND expires_at>?").bind(now, reset.id, now).run();
  if (!changed.meta.changes) return invalid();
  await env.DB.batch([
    env.DB.prepare("UPDATE customers SET password_hash=?,failed_login_attempts=0,locked_until=NULL,updated_at=? WHERE id=?").bind(await hashPassword(password), now, reset.customerId),
    env.DB.prepare("DELETE FROM customer_sessions WHERE customer_id=?").bind(reset.customerId),
  ]);
  return Response.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
