"use client";
import { useState, type FormEvent } from "react";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setMessage(""); const form = new FormData(event.currentTarget); const response = await fetch("/api/customers/password-reset/confirm", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, password: form.get("password"), confirmPassword: form.get("confirmPassword") }) }); const data = await response.json() as { error?: string }; setBusy(false); if (!response.ok) { setMessage(data.error ?? "Password reset could not be completed."); return; } window.location.assign("/customer-account?reset=complete"); }
  return <form className="customer-login-form" onSubmit={submit}><label>New password <small>10–128 characters with uppercase, lowercase, and a number</small><input name="password" type="password" autoComplete="new-password" required /></label><label>Confirm new password<input name="confirmPassword" type="password" autoComplete="new-password" required /></label>{message && <p className="account-error" role="alert">{message}</p>}<button className="button primary" disabled={busy}>{busy ? "Updating…" : "Set new password"}</button></form>;
}
