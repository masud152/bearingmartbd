"use client";

import { useMemo, useState } from "react";
import { categoryCatalogueImage, type CatalogueItem } from "./category-catalog-data";

const stockedBrands = ["SKF", "NSK", "NTN", "KOYO/JTEKT", "TIMKEN", "NACHI"];
const importBrands = ["FAG", "INA", "IKO"];

export default function CategoryCatalogBrowser({ categorySlug, items }: { categorySlug: string; items: readonly CatalogueItem[] }) {
  const [brand, setBrand] = useState("SKF");
  const [model, setModel] = useState("");
  const [type, setType] = useState("");
  const types = [...new Set(items.map((item) => item.type))];
  const visible = useMemo(() => items.filter((item) => (!type || item.type === type) && `${item.model} ${item.type}`.toLowerCase().includes(model.trim().toLowerCase())), [items, model, type]);

  return <section className="shop-catalog">
    <aside className="catalog-filters"><p className="eyebrow">FIND PRODUCTS</p><h2>Search catalogue.</h2>
      <label>1. Brand<select value={brand} onChange={(event) => setBrand(event.target.value)}><optgroup label="Available now">{stockedBrands.map((name) => <option value={name} key={name}>{name}</option>)}</optgroup><optgroup label="Import on request">{importBrands.map((name) => <option value={name} key={name}>{name}</option>)}</optgroup></select></label>
      <label>2. Model number<input value={model} onChange={(event) => setModel(event.target.value)} placeholder="Enter model or series" /></label>
      <label>3. Product type<select value={type} onChange={(event) => setType(event.target.value)}><option value="">All product types</option>{types.map((name) => <option value={name} key={name}>{name}</option>)}</select></label>
      <p className="filter-note">Catalogue references support product identification. Confirm the complete designation, dimensions, specification and current availability before ordering.</p>
    </aside>
    <div className="catalog-results"><div className="catalog-results-head"><p><strong>{visible.length}</strong> products found</p><span>Brand: {brand}</span></div><div className="shop-grid">{visible.map((item) => <article className="shop-card" key={item.model}><div className="shop-bearing"><img src={categoryCatalogueImage(categorySlug, item)} alt={`${item.model} ${item.type} reference product`} loading="lazy" /></div><p className="product-brand">{brand}</p><h3>{item.model}</h3><p>{item.type}</p><p>{item.summary}</p><dl><div><dt>Specification</dt><dd>Confirm</dd></div><div><dt>Availability</dt><dd>Enquiry</dd></div></dl><a className="details-button" href={`/products/${categorySlug}/catalog/${encodeURIComponent(item.model)}?brand=${encodeURIComponent(brand)}`}>View full details →</a></article>)}</div>{visible.length === 0 && <div className="empty-results"><h3>No matching product found.</h3><p>Try another model or type, or contact us for sourcing support.</p></div>}</div>
  </section>;
}
