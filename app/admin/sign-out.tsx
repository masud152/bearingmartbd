"use client";
export default function AdminSignOut() { return <button className="admin-sign-out" type="button" onClick={async () => { await fetch("/api/admin/auth/logout", { method: "POST" }); window.location.assign("/"); }}>Sign out</button>; }
