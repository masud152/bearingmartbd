import Link from "next/link";
import PasswordResetRequestForm from "./request-form";
import "../customer-account/customer-account.css";

export const metadata = { title: "Reset Password | Bearing Mart BD", description: "Request a customer account password reset." };
export default function PasswordResetPage() { return <main className="customer-account-page"><header className="nav"><a className="brand" href="/">Bearing <span>Mart BD</span></a><Link href="/customer-account">Customer login</Link></header><section className="customer-account-wrap"><p className="eyebrow">CUSTOMER ACCOUNT</p><h1>Reset your password</h1><div className="account-card"><p>Enter your registered email address. If an account matches it, we will send password reset instructions.</p><PasswordResetRequestForm /></div></section></main>; }
