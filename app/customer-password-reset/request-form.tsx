"use client";
import { useState, type FormEvent } from "react";

export default function PasswordResetRequestForm() {
  const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); const form = new FormData(event.currentTarget); const response = await fetch("/api/customers/password-reset/request", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: form.get("email") }) }); const data = await response.json() as { message?: string }; setMessage(data.message ?? "If an account matches that email address, password reset instructions will be sent shortly."); setBusy(false); }
  return <form className="customer-login-form" onSubmit={submit}><label>Registered email address<input name="email" type="email" required autoComplete="email" /></label>{message && <p className="account-notice" role="status">{message}</p>}<button className="button primary" disabled={busy}>{busy ? "Sending…" : "Send reset link"}</button></form>;
}
