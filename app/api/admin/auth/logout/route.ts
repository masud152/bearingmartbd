import { cookies } from "next/headers";
import { env } from "@/lib/server/runtime";
import { ADMIN_SESSION_COOKIE, adminSessionHash } from "@/app/admin/_lib/auth";
export async function POST() { const store = await cookies(); const raw = store.get(ADMIN_SESSION_COOKIE)?.value; if (raw) await env.DB.prepare("DELETE FROM admin_sessions WHERE id=?").bind(adminSessionHash(raw)).run(); store.delete(ADMIN_SESSION_COOKIE); return Response.json({ ok: true }); }
