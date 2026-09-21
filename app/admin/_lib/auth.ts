import "server-only";
import { createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/lib/server/runtime";

export type AdminIdentity = { userId: string; displayName: string; email: string; fullName: string | null; permissions: Set<string>; bootstrap: boolean };
export const ADMIN_SESSION_COOKIE = "bmb_admin_session";

function secret() { const value = process.env.SESSION_SECRET; if (!value) throw new Error("SESSION_SECRET is required for administrator sessions."); return value; }
export function adminSessionHash(raw: string) { return createHmac("sha256", secret()).update(raw).digest("hex"); }

export async function getAdminIdentity(): Promise<AdminIdentity | null> {
  const raw = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value; if (!raw) return null;
  const record = await env.DB.prepare(`SELECT u.id,u.email,u.display_name AS displayName FROM admin_sessions s JOIN admin_users u ON u.id=s.admin_user_id WHERE s.id=? AND s.expires_at>? AND u.status='active'`).bind(adminSessionHash(raw), new Date().toISOString()).first<{id:string;email:string;displayName:string|null}>();
  if (!record) return null;
  const permissions = await env.DB.prepare("SELECT rp.permission_key AS permissionKey FROM user_roles ur JOIN role_permissions rp ON rp.role_id=ur.role_id WHERE ur.user_id=?").bind(record.id).all<{permissionKey:string}>();
  return { userId: record.id, email: record.email, displayName: record.displayName ?? record.email, fullName: record.displayName, permissions: new Set(permissions.results.map((row) => row.permissionKey)), bootstrap: false };
}
export async function requireAdmin(permission: string, returnTo = "/admin") { const identity = await getAdminIdentity(); if (!identity) redirect(`/admin-login?return_to=${encodeURIComponent(returnTo)}`); if (!identity.permissions.has("*") && !identity.permissions.has(permission)) redirect("/admin-access-denied"); return identity; }
export async function authorizeApi(permission: string) { const identity = await getAdminIdentity(); if (!identity) return { response: Response.json({ error: "Authentication or admin access required." }, { status: 401 }) } as const; if (!identity.permissions.has("*") && !identity.permissions.has(permission)) return { response: Response.json({ error: "You do not have permission for this action." }, { status: 403 }) } as const; return { identity } as const; }
export function can(identity: AdminIdentity, permission: string) { return identity.permissions.has("*") || identity.permissions.has(permission); }
