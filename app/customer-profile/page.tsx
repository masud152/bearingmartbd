import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCustomerFromSession } from "../customer-auth";
import LogoutButton from "../customer-account/logout-button";
import "../customer-account/customer-account.css";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "My Profile | Bearing Mart BD",
  description: "Customer profile for Bearing Mart BD.",
};

export default async function CustomerProfilePage() {
  const requestHeaders = await headers();
  const customer = await getCustomerFromSession(requestHeaders.get("cookie"));

  if (!customer) redirect("/customer-account");

  return <main className="customer-account-page">
    <header className="nav">
      <a className="brand" href="https://bearingmartbd.com/">Bearing <span>Mart BD</span></a>
      <a href="https://bearingmartbd.com/products/ball-bearings/catalog">Browse products</a>
    </header>
    <section className="customer-account-wrap">
      <p className="eyebrow">CUSTOMER PROFILE</p>
      <h1>Welcome, {customer.fullName}</h1>
      <div className="account-dashboard">
        <div className="account-summary">
          <div><span>Access level</span><strong>{customer.customerType === "business" ? "Business Customer" : "General / Retail Customer"}</strong></div>
          <div><span>Account status</span><strong>{customer.status === "verified" ? "Verified" : customer.status.replaceAll("_", " ")}</strong></div>
          <div><span>Mobile</span><strong>{customer.mobile}</strong></div>
        </div>
        <div className="account-card">
          <h2>Your customer profile</h2>
          <p>Your account information and access status are shown here.</p>
          <div className="account-actions">
            <a className="button primary" href="https://bearingmartbd.com/products/ball-bearings/catalog">Browse products</a>
            <LogoutButton />
          </div>
        </div>
      </div>
    </section>
  </main>;
}
