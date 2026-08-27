import { requireAdmin } from "../../_lib/auth";
import ProductForm from "../product-form";
export default async function NewProduct(){await requireAdmin("products.create","/admin/products/new");return <div className="admin-page"><div className="admin-heading"><div><p className="admin-kicker">CATALOGUE</p><h1>Add product</h1><p>Create a draft, verify the technical data, then publish it.</p></div></div><ProductForm/></div>}
