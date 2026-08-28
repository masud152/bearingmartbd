"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import ProductForm from "./product-form";

type FormOptions={categories:{slug:string;name:string}[];brands:{slug:string;name:string}[]};

export default function AddProductPanel({options}:{options:FormOptions}){
  const [open,setOpen]=useState(false);
  const pathname=usePathname();
  if(pathname!=="/admin/products")return null;
  return <div className="admin-add-product-controller">
    <button type="button" className="admin-primary" onClick={()=>setOpen(true)} aria-expanded={open} aria-controls="add-product-panel">Add Product</button>
    {open&&<section id="add-product-panel" className="admin-add-product-panel" aria-labelledby="add-product-title">
      <div className="admin-add-product-heading"><div><p className="admin-kicker">NEW CATALOGUE RECORD</p><h2 id="add-product-title">Add product</h2><p>Complete the required information, then save as Draft or Published.</p></div><button type="button" className="admin-close-panel" onClick={()=>setOpen(false)} aria-label="Close Add Product form">Close</button></div>
      <ProductForm options={options}/>
    </section>}
  </div>;
}
