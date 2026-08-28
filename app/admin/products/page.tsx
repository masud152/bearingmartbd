import { can, requireAdmin } from "../_lib/auth";
import { listProducts } from "../_lib/data";
import Link from "next/link";
import ProductVisibilityButton from "./product-visibility-button";
import ProductOrderControl from "./product-order-control";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user=await requireAdmin("products.view","/admin/products"); const {q=""}=await searchParams; const products=await listProducts(q);
  return <div className="admin-page"><div className="admin-heading"><div><p className="admin-kicker">CATALOGUE</p><h1>Products</h1><p>Create, review and publish catalogue records.</p></div>{can(user,"products.create")&&<Link className="admin-primary" href="/admin/products/new">Add Product</Link>}</div>
    <form className="admin-filter"><label htmlFor="product-search">Search products</label><div><input id="product-search" name="q" defaultValue={q} placeholder="Name, bearing number or SKU"/><button>Search</button>{q&&<Link href="/admin/products">Clear</Link>}</div></form>
    <div className="admin-table-wrap"><table className="admin-table"><caption>{products.length} product{products.length===1?"":"s"}</caption><thead><tr><th>Product</th><th>Category / Brand</th><th>Dimensions</th><th>Availability</th><th>Website Order</th><th>Status</th><th>Actions</th></tr></thead><tbody>{products.map(p=><tr key={p.id}><td><strong>{p.name}</strong><small>{p.bearingNumber}{p.sku?` · ${p.sku}`:""}</small></td><td>{p.categoryName}<small>{p.brandName??"Brand not specified"}</small></td><td>{p.boreDiameter!=null&&p.outsideDiameter!=null&&p.width!=null?`${p.boreDiameter} × ${p.outsideDiameter} × ${p.width} mm`:"Not specified"}</td><td>{p.stockStatus.replaceAll("_"," ")}</td><td>{can(user,"products.update")?<ProductOrderControl id={p.id} sortOrder={p.sortOrder} version={p.version}/>:p.sortOrder}</td><td><span className={`admin-status ${p.status}`}>{p.status}</span></td><td><div className="admin-row-actions"><a href={`/admin/products/${p.id}`}>Edit</a>{can(user,"products.update")&&<ProductVisibilityButton id={p.id} status={p.status} version={p.version}/>}</div></td></tr>)}</tbody></table>{!products.length&&<p className="admin-empty">No products match this view.</p>}</div>
  </div>;
}
