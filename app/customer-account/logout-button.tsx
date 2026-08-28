"use client";
export default function LogoutButton(){async function logout(){await fetch("/api/customers/logout",{method:"POST"});window.location.reload()}return <button className="button secondary account-logout" type="button" onClick={logout}>Sign out</button>}
