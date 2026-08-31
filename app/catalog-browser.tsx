"use client";

import { useMemo, useState } from "react";
import { catalogueProductImageUrl } from "./bearing-product-images";
import { bearingSuffixes, getBearingSuffix } from "./bearing-suffixes";

type Product = readonly [string, string, number, number, number, string?, string?];

export default function CatalogBrowser({ products }: { products: readonly Product[] }) {
  const [brand, setBrand] = useState("NSK");
  const [model, setModel] = useState("");
  const [suffix, setSuffix] = useState("");
  const selectedSuffix = getBearingSuffix(suffix);
  const visible = useMemo(() => products.filter(([number, type]) => `${number} ${type}`.toLowerCase().includes(model.trim().toLowerCase())), [products, model]);
  const suffixQuery = suffix ? `?suffix=${encodeURIComponent(suffix)}` : "";

  return <section className="shop-catalog">
    <aside className="catalog-filters">
      <p className="eyebrow">FIND PRODUCTS</p>
      <h2>Search bearing details.</h2>
      <label>1. Brand<select value={brand} onChange={(event) => setBrand(event.target.value)}><option value="NSK">NSK</option></select></label>
      <label>2. Model number<input value={model} onChange={(event) => setModel(event.target.value)} placeholder="e.g. 6200, 7000" /></label>
      <label>3. Type / suffix<select value={suffix} onChange={(event) => setSuffix(event.target.value)}>{bearingSuffixes.map((option) => <option value={option.value} key={option.value || "open"}>{option.label}</option>)}</select></label>
      <div className="suffix-help" aria-live="polite"><strong>{selectedSuffix.label}</strong><span>{selectedSuffix.description}</span></div>
      <p className="filter-note">Suffix availability depends on the model. Please confirm the complete bearing designation before ordering.</p>
    </aside>
    <div className="catalog-results">
      <div className="catalog-results-head"><p><strong>{visible.length}</strong> products found</p><span>Configuration: {brand}{suffix ? ` · ${suffix}` : " · Open"}</span></div>
      <div className="shop-grid">{visible.map(([number, type, bore, outer, width, imageKey]) => {
        const designation = `${number}${suffix}`;
        return <article className="shop-card" key={number}>
          <div className="shop-bearing"><img src={catalogueProductImageUrl(imageKey)} alt={`Full view of ${brand} ${designation} ${type}`} loading="lazy" /></div>
          <p className="product-brand">{brand}</p><h3>{designation}</h3><p>{type}</p>
          <dl><div><dt>Size</dt><dd>{bore} × {outer} × {width} mm</dd></div><div><dt>Suffix</dt><dd>{suffix || "Open"}</dd></div><div><dt>Availability</dt><dd>Enquiry</dd></div></dl>
          <a className="details-button" href={`/products/ball-bearings/catalog/${number}${suffixQuery}`}>View full details →</a>
        </article>;
      })}</div>
      {visible.length === 0 && <div className="empty-results"><h3>No matching model found.</h3><p>Try another model number or contact us for sourcing support.</p></div>}
    </div>
  </section>;
}
