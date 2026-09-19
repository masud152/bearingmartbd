"use client";
import { useMemo, useState } from "react";
import { productImageUrl } from "./bearing-product-images";
import type { BallBearingRecord } from "./managed-product-data";

const brandOrder = ["SKF","NSK","NTN","KOYO/JTEKT","TIMKEN","NACHI","FAG","INA","IKO"];
const availabilityLabel = { in_stock:"Normally stocked",available_on_order:"Available on order",confirm_availability:"Enquiry" } as const;

export default function CatalogBrowser({ products }:{ products:readonly BallBearingRecord[] }) {
  const [query,setQuery] = useState("");
  const [brand,setBrand] = useState("NSK");
  const [type,setType] = useState("all");
  const brands = brandOrder.filter(item => products.some(product => product.brand === item));
  const types = [...new Set(products.filter(product=>product.brand===brand).map(product=>product.productType))];
  const visible = useMemo(() => products.filter(product => product.brand === brand && (type === "all" || product.productType === type) && `${product.bearingNumber} ${product.productType} ${product.brand}`.toLowerCase().includes(query.toLowerCase())),[products,brand,query,type]);
  return <section className="shop-catalog"><aside className="catalog-filters"><p className="eyebrow">FIND PRODUCTS</p><h2>Search by model<br />or brand.</h2><label>1. Brand<select value={brand} onChange={event => {setBrand(event.target.value);setType("all")}}>{brands.map(item => <option value={item} key={item}>{item}</option>)}</select></label><label>2. Model No.<input value={query} onChange={event => setQuery(event.target.value)} placeholder="e.g. 6200, 7000" /></label><label>3. Type<select value={type} onChange={event=>setType(event.target.value)}><option value="all">All types</option>{types.map(item=><option key={item}>{item}</option>)}</select></label><p className="filter-note">Normally stocked: SKF, NSK, NTN, KOYO/JTEKT, TIMKEN and NACHI.<br /><br />Available on order: FAG, INA and IKO.</p></aside><div className="catalog-results"><div className="catalog-results-head"><p><strong>{visible.length}</strong> products found</p><span>Brand: {brand}</span></div><div className="shop-grid">{visible.map(product => <article className="shop-card" key={product.slug}><div className="shop-bearing"><img src={productImageUrl(product.bearingNumber,product.imageKey)} alt={`${product.brand} ${product.bearingNumber} ${product.productType}`} loading="lazy" /></div><p className="product-brand">{product.brand}</p><h3>{product.bearingNumber}</h3><p>{product.productType}</p><dl><div><dt>Size</dt><dd>{product.bore} × {product.outerDiameter} × {product.width} mm</dd></div><div><dt>Availability</dt><dd>{availabilityLabel[product.stockStatus]}</dd></div></dl><a className="details-button" href={`/products/ball-bearings/catalog/${product.slug}`}>View details →</a></article>)}</div>{visible.length === 0 && <div className="empty-results"><h3>No published {brand} model found.</h3><p>Try another model number, type or brand, or contact us to confirm stock and sourcing availability.</p></div>}</div></section>;
}
