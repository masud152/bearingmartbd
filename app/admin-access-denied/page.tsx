export const dynamic = "force-dynamic";

export default function AccessDenied() {
  return <main className="admin-message">
    <p className="eyebrow">ADMIN ACCESS</p>
    <h1>Access is not configured</h1>
    <p>Your account does not have the required administrator permission.</p>
    <p>Ask a super administrator to review your role assignment.</p>
    <div>
      <a className="button primary" href="https://bearingmartbd.com/">Return to website</a>
      <a className="button secondary" href="/admin-login">Admin sign in</a>
    </div>
  </main>;
}
