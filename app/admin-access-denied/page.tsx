import { getChatGPTUser, chatGPTSignOutPath } from "../chatgpt-auth";

export const dynamic = "force-dynamic";

export default async function AccessDenied() {
  const user = await getChatGPTUser();
  return <main className="admin-message">
    <p className="eyebrow">ADMIN ACCESS</p>
    <h1>Access is not configured</h1>
    <p>{user ? <>The signed-in account <strong>{user.email}</strong> is not an active administrator.</> : <>Sign in is required.</>}</p>
    <p>Set the protected <code>ADMIN_EMAILS</code> environment value for the first administrator, apply the admin database migration, then use Users and Roles to grant ongoing access.</p>
    <div>
      <a className="button primary" href="https://bearingmartbd.com/">Return to website</a>
      {user && <a className="button secondary" href={chatGPTSignOutPath("/")}>Sign out</a>}
    </div>
  </main>;
}
