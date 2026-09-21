import { randomBytes } from "node:crypto";
import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { env } from "@/lib/server/runtime";
import { ADMIN_SESSION_COOKIE, adminSessionHash } from "@/app/admin/_lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null; const email = String(body?.email ?? "").trim().toLowerCase(); const password = String(body?.password ?? "");
  if (!email || !password) return Response.json({ error: "Enter your email address and password." }, { status: 400 });
  const user = await env.DB.prepare("SELECT id,email,password_hash AS passwordHash,status FROM admin_users WHERE lower(email)=? LIMIT 1").bind(email).first<{id:string;email:string;passwordHash:string|null;status:string}>();
  if (!user || user.status !== "active" || !user.passwordHash || !(await compare(password, user.passwordHash))) return Response.json({ error: "Email or password is incorrect." }, { status: 401 });
  const raw = randomBytes(32).toString("base64url"), id = adminSessionHash(raw), now = new Date(), expires = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  await env.DB.batch([env.DB.prepare("DELETE FROM admin_sessions WHERE admin_user_id=? OR expires_at<=?").bind(user.id, now.toISOString()), env.DB.prepare("INSERT INTO admin_sessions (id,admin_user_id,expires_at,created_at) VALUES (?,?,?,?)").bind(id, user.id, expires.toISOString(), now.toISOString())]);
  const response = Response.json({ ok: true }); (await cookies()).set(ADMIN_SESSION_COOKIE, raw, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 8 * 60 * 60 }); return response;
}
