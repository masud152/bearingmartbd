import Link from "next/link";
import { can,requireAdmin } from "../_lib/auth";
import { listCustomers } from "../_lib/data";
import CustomerStatusControl from "./customer-status-control";
import CustomerPasswordReset from "./customer-password-reset";

export default async function CustomersPage({searchParams}:{searchParams:Promise<{q?:string}>}){
  const user=await requireAdmin("customers.view","/admin/customers");
  const {q=""}=await searchParams; const customers=await listCustomers(q);
  return <div className="admin-page"><div className="admin-heading"><div><p className="admin-kicker">CUSTOMER MANAGEMENT</p><h1>Customers</h1><p>Review customer registrations and securely manage verification status.</p></div></div>
    <form className="admin-filter"><label htmlFor="customer-search">Search customers</label><div><input id="customer-search" name="q" defaultValue={q} placeholder="Name, company, mobile or email"/><button>Search</button>{q&&<Link href="/admin/customers">Clear</Link>}</div></form>
    <div className="admin-table-wrap"><table className="admin-table customer-table"><caption>{customers.length} customer{customers.length===1?"":"s"}</caption><thead><tr><th>Customer</th><th>Contact</th><th>Verification files</th><th>Registered</th><th>Status</th><th>Password reset</th></tr></thead><tbody>{customers.map(customer=><tr key={customer.id}><td><strong>{customer.companyName||customer.fullName}</strong><small>{customer.customerType==="business"?`Business · ${customer.responsiblePersonName||customer.fullName}`:"General / Retail"}</small><small>{customer.address}</small></td><td><a href={`tel:${customer.mobile}`}>{customer.mobile}</a><small><a href={`mailto:${customer.email}`}>{customer.email}</a></small></td><td><div className="customer-files"><a href={`/api/admin/customers/${customer.id}/file/document`} target="_blank" rel="noreferrer">View {customer.documentType==="nid"?"NID":"Trade License"}</a>{Boolean(customer.hasPhoto)&&<a href={`/api/admin/customers/${customer.id}/file/photo`} target="_blank" rel="noreferrer">View photo</a>}</div></td><td>{new Date(customer.createdAt).toLocaleDateString("en-GB")}</td><td>{can(user,"customers.update")?<CustomerStatusControl id={customer.id} initialStatus={customer.status}/>:<span className={`admin-status ${customer.status}`}>{customer.status.replaceAll("_"," ")}</span>}</td><td>{can(user,"customers.update")?<CustomerPasswordReset id={customer.id} name={customer.companyName||customer.fullName}/>:"—"}</td></tr>)}</tbody></table>{!customers.length&&<p className="admin-empty">No customers match this view.</p>}</div>
  </div>;
}
