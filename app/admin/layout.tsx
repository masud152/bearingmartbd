import type { ReactNode } from "react";
import { chatGPTSignOutPath } from "../chatgpt-auth";
import { can, requireAdmin } from "./_lib/auth";
import "./admin.css";
import "./access.css";
import "./visibility.css";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin("dashboard.view", "/admin");
  const links = [
    ["Dashboard", "/admin", "dashboard.view"], ["Products", "/admin/products", "products.view"],
    ["Users", "/admin/users", "users.view"], ["Roles & Permissions", "/admin/roles", "roles.view"],
    ["Audit Log", "/admin/audit", "audit.view"],
  ];
  return <main className="admin-shell">
    <aside className="admin-sidebar"><a className="admin-logo" href="/admin">Bearing <span>Mart BD</span><small>Administration</small></a><nav aria-label="Admin navigation">{links.filter(([, , permission]) => can(user, permission)).map(([label,href]) => <a href={href} key={href}>{label}</a>)}</nav><div className="admin-account"><strong>{user.displayName}</strong><span>{user.email}</span>{user.bootstrap && <em>Bootstrap administrator</em>}<a href={chatGPTSignOutPath("/")}>Sign out</a></div></aside>
    <section className="admin-main"><header className="admin-topbar"><a href="/" target="_blank" rel="noreferrer">View website ↗</a></header>{children}</section>
  </main>;
}
