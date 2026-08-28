"use client";

import { useState } from "react";

export default function ProductVisibilityButton({ id, status, version }: { id: string; status: string; version: number }) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentVersion, setCurrentVersion] = useState(version);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const visible = currentStatus === "published";

  async function toggleVisibility() {
    setSaving(true); setMessage("");
    const response = await fetch(`/api/admin/products/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: visible ? "draft" : "published", version: currentVersion }) });
    const data = await response.json() as { error?: string; status?: string; version?: number };
    setSaving(false);
    if (!response.ok) { setMessage(data.error ?? "Unable to change product visibility."); return; }
    setCurrentStatus(data.status ?? (visible ? "draft" : "published")); setCurrentVersion(data.version ?? currentVersion + 1); setMessage(visible ? "Product hidden" : "Product visible");
  }

  return <div className="admin-visibility-action"><button type="button" className={visible ? "admin-hide-button" : "admin-show-button"} onClick={toggleVisibility} disabled={saving} aria-label={`${visible ? "Hide" : "Unhide"} product from website`}>{saving ? "Updating…" : visible ? "Hide" : "Unhide"}</button>{message && <small role="status">{message}</small>}</div>;
}
