import RegistrationForm from "./registration-form";
import Link from "next/link";
import "./registration.css";
export const metadata={title:"Customer Registration | Bearing Mart BD",description:"Register as a Retail or Business customer with Bearing Mart BD."};
export default function CustomerRegistration(){return <main className="customer-registration-page"><header className="nav"><Link className="brand" href="/">Bearing <span>Mart BD</span></Link><Link href="/">Return to website</Link></header><section className="customer-registration-wrap"><p className="eyebrow">CUSTOMER REGISTRATION</p><h1>Register with Bearing Mart BD</h1><p className="customer-intro">Choose your customer type and submit the required information. Documents are reviewed manually and are not publicly accessible.</p><RegistrationForm/></section></main>}
