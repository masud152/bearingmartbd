import { dashboardStats } from "./_lib/data";
import Link from "next/link";

export default async function AdminDashboard() {
  const stats=await dashboardStats();
  return <div className="admin-page"><div className="admin-heading"><div><p className="admin-kicker">OVERVIEW</p><h1>Dashboard</h1><p>Catalogue and administration status for Bearing Mart BD.</p></div><Link className="admin-primary" href="/admin/products/new">Add Product</Link></div>
    <section className="admin-stats" aria-label="Catalogue summary"><article><span>Products</span><strong>{stats.products}</strong></article><article><span>Published</span><strong>{stats.published}</strong></article><article><span>Drafts</span><strong>{stats.draft}</strong></article><article><span>Active admins</span><strong>{stats.users}</strong></article></section>
    <section className="admin-panel"><div className="admin-panel-title"><h2>Recent activity</h2><a href="/admin/audit">View audit log</a></div>{stats.audit.length ? <div className="admin-activity">{stats.audit.map((event,index)=><article key={`${event.createdAt}-${index}`}><strong>{event.action}</strong><span>{event.resourceType}</span><small>{event.actorEmail} · {new Date(event.createdAt).toLocaleString()}</small></article>)}</div> : <p className="admin-empty">No administrative activity has been recorded yet.</p>}</section>
  </div>;
}
