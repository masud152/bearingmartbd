"use client";

import { useMemo, useState } from "react";
import { catalogueProductImageUrl } from "./bearing-product-images";
import { bearingDesignation, bearingOption, brandBearingOptions, catalogueBrand } from "./brand-bearing-options";

type Product = readonly [string, string, number, number, number, string?, string?];

const stockedBrands = ["SKF", "NSK", "NTN", "KOYO/JTEKT", "TIMKEN", "NACHI"];
const importBrands = ["FAG", "INA", "IKO"];

export default function CatalogBrowser({ products }: { products: readonly Product[] }) {
  const [brand, setBrand] = useState("NSK");
  const [model, setModel] = useState("");
  const [suffix, setSuffix] = useState("");
  const selectedBrand = catalogueBrand(brand);
  const options = brandBearingOptions[selectedBrand];
  const selectedSuffix = bearingOption(selectedBrand, suffix);
  const visible = useMemo(() => {
    const matchingBrand = products.filter(([, , , , , , productBrand = "NSK"]) => productBrand === brand);
    return matchingBrand.filter(([number, type]) => `${number} ${type}`.toLowerCase().includes(model.trim().toLowerCase()));
  }, [products, brand, model]);

  return <section className="shop-catalog">
    <aside className="catalog-filters">
      <p className="eyebrow">FIND PRODUCTS</p>
      <h2>Search bearing details.</h2>
      <label>1. Brand<select value={brand} onChange={(event) => { setBrand(event.target.value); setSuffix(""); }}><optgroup label="Available now">{stockedBrands.map((name) => <option value={name} key={name}>{name}</option>)}</optgroup><optgroup label="Import on request">{importBrands.map((name) => <option value={name} key={name}>{name}</option>)}</optgroup></select></label>
      <label>2. Model number<input value={model} onChange={(event) => setModel(event.target.value)} placeholder="e.g. 6200, 7000" /></label>
      <label>3. Type / suffix<select value={suffix} onChange={(event) => setSuffix(event.target.value)}>{options.map((option) => <option value={option.value} key={option.value || "open"}>{option.label}</option>)}</select></label>
      <div className="suffix-help" aria-live="polite"><strong>{selectedSuffix.label}</strong><span>{selectedSuffix.description}</span></div>
      <p className="filter-note">Suffix availability depends on the model. Please confirm the complete bearing designation before ordering.</p>
    </aside>
    <div className="catalog-results">
      <div className="catalog-results-head"><p><strong>{visible.length}</strong> products found</p><span>Configuration: {brand}{suffix ? ` · ${suffix}` : " · Open"}</span></div>
      <div className="shop-grid">{visible.map(([number, type, bore, outer, width, imageKey]) => {
        const designation = bearingDesignation(number, selectedBrand, suffix);
        const image = catalogueProductImageUrl(imageKey);
        return <article className="shop-card" key={number}>
          <div className="shop-bearing"><img src={image} alt={imageKey ? `Real ${brand} ${designation} ${type} product` : `Representative ${type} catalogue image`} loading="lazy" /></div>
          <p className="product-brand">{brand}</p><h3>{designation}</h3><p>{type}</p>
          <dl><div><dt>Size</dt><dd>{bore} × {outer} × {width} mm</dd></div><div><dt>Suffix</dt><dd>{suffix || "Open"}</dd></div><div><dt>Availability</dt><dd>Enquiry</dd></div></dl>
          <a className="details-button" href={`/products/ball-bearings/catalog/${number}?brand=${encodeURIComponent(brand)}${suffix ? `&suffix=${encodeURIComponent(suffix)}` : ""}`}>View full details →</a>
        </article>;
      })}</div>
      {visible.length === 0 && <div className="empty-results"><h3>No published {brand} model found.</h3><p>Try another model number, choose a different brand, or contact us to confirm stock and sourcing availability.</p><a className="details-button" href={`https://wa.me/8801914528336?text=${encodeURIComponent(`Hello Bearing Mart BD, please help me find a ${brand} bearing${model ? `, model ${model}` : ""}.`)}`}>Ask about {brand} →</a></div>}
    </div>
  </section>;
}
