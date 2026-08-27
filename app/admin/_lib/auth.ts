import { env } from "cloudflare:workers";
import { redirect } from "next/navigation";
import { getChatGPTUser, type ChatGPTUser } from "../../chatgpt-auth";

export type AdminIdentity = ChatGPTUser & { permissions: Set<string>; bootstrap: boolean };

function bootstrapEmails() {
  const value = (env as unknown as { ADMIN_EMAILS?: string }).ADMIN_EMAILS ?? "";
  return new Set(value.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean));
}

export async function getAdminIdentity(): Promise<AdminIdentity | null> {
  const user = await getChatGPTUser();
  if (!user) return null;
  if (bootstrapEmails().has(user.email.toLowerCase())) {
    return { ...user, permissions: new Set(["*"]), bootstrap: true };
  }
  try {
    const record = await env.DB.prepare("SELECT id, status FROM admin_users WHERE lower(email) = lower(?)").bind(user.email).first<{ id: string; status: string }>();
    if (!record || record.status !== "active") return null;
    const result = await env.DB.prepare("SELECT rp.permission_key AS permissionKey FROM user_roles ur JOIN role_permissions rp ON rp.role_id = ur.role_id WHERE ur.user_id = ?").bind(record.id).all<{ permissionKey: string }>();
    return { ...user, userId: record.id, permissions: new Set(result.results.map((row) => row.permissionKey)), bootstrap: false };
  } catch {
    return null;
  }
}

export async function requireAdmin(permission: string, returnTo = "/admin") {
  const user = await getChatGPTUser();
  if (!user) redirect(`/signin-with-chatgpt?return_to=${encodeURIComponent(returnTo)}`);
  const identity = await getAdminIdentity();
  if (!identity) redirect("/admin-access-denied");
  if (!identity.permissions.has("*") && !identity.permissions.has(permission)) redirect("/admin-access-denied");
  return identity;
}

export async function authorizeApi(permission: string) {
  const identity = await getAdminIdentity();
  if (!identity) return { response: Response.json({ error: "Authentication or admin access required." }, { status: 401 }) } as const;
  if (!identity.permissions.has("*") && !identity.permissions.has(permission)) return { response: Response.json({ error: "You do not have permission for this action." }, { status: 403 }) } as const;
  return { identity } as const;
}

export function can(identity: AdminIdentity, permission: string) {
  return identity.permissions.has("*") || identity.permissions.has(permission);
}
