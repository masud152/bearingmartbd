"use client";

import { useState } from "react";

export default function ProductOrderControl({ id, sortOrder, version }: { id: string; sortOrder: number; version: number }) {
  const [value, setValue] = useState(sortOrder);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setSaving(true); setMessage("");
    const response = await fetch(`/api/admin/products/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ sortOrder: value, version }) });
    const data = await response.json() as { error?: string; version?: number };
    setSaving(false);
    if (!response.ok) { setMessage(data.error ?? "Unable to save order."); return; }
    setMessage("Saved");
  }

  return <div className="admin-order-control"><input type="number" min="1" step="1" value={value} onChange={(event) => setValue(Number(event.target.value))} aria-label="Website display order"/><button type="button" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button>{message&&<small role="status">{message}</small>}</div>;
}
