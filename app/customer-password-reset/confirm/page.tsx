import Link from "next/link";
import ResetPasswordForm from "./reset-form";
import { customerPasswordResetEnabled } from "../availability";
import "../../customer-account/customer-account.css";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Choose a New Password | Bearing Mart BD", robots: { index: false, follow: false } };
export default async function ConfirmPasswordResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) { if (!customerPasswordResetEnabled) notFound(); const { token = "" } = await searchParams; return <main className="customer-account-page"><header className="nav"><a className="brand" href="/">Bearing <span>Mart BD</span></a><Link href="/customer-account">Customer login</Link></header><section className="customer-account-wrap"><p className="eyebrow">CUSTOMER ACCOUNT</p><h1>Choose a new password</h1><div className="account-card">{token ? <ResetPasswordForm token={token} /> : <p className="account-error">This password reset link is invalid.</p>}</div></section></main>; }
