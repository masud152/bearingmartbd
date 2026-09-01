import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getManagedBallBearingProduct, getManagedBallBearingProducts } from "../../../../managed-product-data";
import { PRODUCT_IMAGE_NOTE, productImageUrl } from "../../../../bearing-product-images";
import { bearingDesignation, bearingOption, brandBearingOptions, catalogueBrand } from "../../../../brand-bearing-options";

export const dynamic = "force-dynamic";

const SITE_URL = "https://bearingmartbd.com";
const WHATSAPP = "8801914528336";
const PHONE = "+8801730015018";

function titleType(type: string) {
  return type.endsWith("s") ? type.slice(0, -1) : type;
}

function sealDescription(suffix: string) {
  if (suffix.includes("2RS1") || suffix.includes("LLU")) return "Contact seals on both sides";
  if (suffix.includes("2RZ") || suffix.includes("LLB")) return "Non-contact seals on both sides";
  if (suffix.includes("LLH")) return "Low-torque seals on both sides";
  if (suffix.includes("2Z")) return "Metal shields on both sides";
  if (suffix === "RS1") return "Contact seal on one side";
  if (suffix.includes("DDU")) return "Rubber contact seals on both sides (DDU)";
  if (suffix.includes("DDW")) return "Low-torque seals on both sides (DDW)";
  if (suffix.includes("VV")) return "Rubber non-contact seals on both sides (VV)";
  if (suffix.includes("ZZ")) return "Metal shields on both sides (ZZ)";
  if (suffix === "DU") return "Rubber contact seal on one side (DU)";
  if (suffix === "V") return "Rubber non-contact seal on one side (V)";
  if (suffix === "Z") return "Metal shield on one side (Z)";
  return "Open bearing";
}

function clearanceDescription(suffix: string) {
  if (suffix.includes("CM")) return "CM — electric-motor internal clearance";
  if (suffix.includes("C4")) return "C4 — greater than C3";
  if (suffix.includes("C3")) return "C3 — greater than CN";
  return "CN — normal internal clearance";
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ number: string }>; searchParams: Promise<{ brand?: string }> }): Promise<Metadata> {
  const { number } = await params;
  const { brand: requestedBrand } = await searchParams;
  const brand = catalogueBrand(requestedBrand);
  const product = await getManagedBallBearingProduct(number);
  if (!product) return {};
  const [bearingNumber, type, bore, outer, width, imageKey] = product;
  const productType = titleType(type);
  const title = `${brand} ${bearingNumber} Bearing (${bore}×${outer}×${width} mm) | Bearing Mart BD`;
  const description = `Request a quotation for the ${brand} ${bearingNumber} ${productType.toLowerCase()}, size ${bore}×${outer}×${width} mm. Confirm current price, availability and delivery across Bangladesh.`;
  const url = `${SITE_URL}/products/ball-bearings/catalog/${bearingNumber}?brand=${brand}`;
  const images = [`${SITE_URL}${productImageUrl(bearingNumber, imageKey)}`];
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: "website", images }, twitter: { card: "summary", title, description, images } };
}

export default async function ProductDetail({ params, searchParams }: { params: Promise<{ number: string }>; searchParams: Promise<{ brand?: string; suffix?: string }> }) {
  const { number } = await params;
  const { brand: requestedBrand, suffix: requestedSuffix } = await searchParams;
  const brand = catalogueBrand(requestedBrand);
  const suffix = bearingOption(brand, requestedSuffix);
  const product = await getManagedBallBearingProduct(number);
  if (!product) notFound();
  const [bearingNumber, type, bore, outer, width, imageKey] = product;
  const productType = titleType(type);
  const designation = bearingDesignation(bearingNumber, brand, suffix.value);
  const productName = `${brand} ${designation} ${productType}`;
  const dimensions = `${bore} × ${outer} × ${width} mm`;
  const canonical = `${SITE_URL}/products/ball-bearings/catalog/${bearingNumber}?brand=${brand}`;
  const imageUrl = `${productImageUrl(bearingNumber, imageKey)}?brand=${encodeURIComponent(brand)}`;
  const whatsappMessage = encodeURIComponent(`Hello Bearing Mart BD, I would like a quotation for ${productName} (${dimensions}). Please confirm current price, stock and delivery.`);
  const photoMessage = encodeURIComponent(`Hello Bearing Mart BD, I would like help identifying a bearing. I will send a clear photo of the bearing number and both sides.`);
  const quoteUrl = `/contact?product=${encodeURIComponent(productName)}&bearing=${designation}`;
  const publishedProducts = await getManagedBallBearingProducts();
  const related = publishedProducts.filter(([itemNumber, itemType]) => itemNumber !== bearingNumber && itemType === type).slice(0, 4);
  const specs = [
    ["Bearing designation", designation], ["Category", "Ball Bearings"], ["Bearing type", productType], ["Brand", brand],
    ["Bore diameter (d)", `${bore} mm`], ["Outside diameter (D)", `${outer} mm`], ["Width (B)", `${width} mm`],
    ["Selected suffix / variant", suffix.label], ["Seal / shield", sealDescription(suffix.value)], ["Number of rows", "Single row"], ["Internal clearance", clearanceDescription(suffix.value)],
    ["Country of origin", "Confirmed at quotation / supply"], ["SKU", `${brand}-${designation}`],
  ];
  const productSchema = { "@context": "https://schema.org", "@type": "Product", name: productName, image: `${SITE_URL}${imageUrl}`, sku: `${brand}-${designation}`, mpn: designation, brand: { "@type": "Brand", name: brand }, category: "Ball Bearings", description: `Single-row ${productType.toLowerCase()} with ${bore} mm bore, ${outer} mm outside diameter and ${width} mm width. Selected configuration: ${suffix.label}.`, url: canonical, additionalProperty: [{ "@type": "PropertyValue", name: "Bore diameter (d)", value: `${bore} mm` }, { "@type": "PropertyValue", name: "Outside diameter (D)", value: `${outer} mm` }, { "@type": "PropertyValue", name: "Width (B)", value: `${width} mm` }, { "@type": "PropertyValue", name: "Suffix / variant", value: suffix.label }] };
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }, { "@type": "ListItem", position: 2, name: "Products", item: `${SITE_URL}/#products` }, { "@type": "ListItem", position: 3, name: "Ball Bearings", item: `${SITE_URL}/products/ball-bearings` }, { "@type": "ListItem", position: 4, name: bearingNumber, item: canonical }] };

  return <main className="detail-page">
    <header className="nav"><a className="brand" href="/">Bearing <span>Mart BD</span></a><a className="nav-call" href={`https://wa.me/${WHATSAPP}?text=${whatsappMessage}`}>WhatsApp Enquiry</a></header>
    <section className="product-detail-wrap">
      <nav className="product-breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/#products">Products</a></li><li><a href="/products/ball-bearings">Ball Bearings</a></li><li aria-current="page">{bearingNumber}</li></ol></nav>
      <section className="product-hero-detail">
        <div className="product-gallery"><div className="product-uploaded-image brand-aware-image" data-brand={brand}><img src={imageUrl} alt={`${productName} reference product view`} /><span className="image-brand-badge">{brand}</span></div><p>{imageKey ? `Selected ${brand} catalogue reference image` : PRODUCT_IMAGE_NOTE}</p><section className="image-overview"><h2>Product Overview</h2><p>The {brand} {bearingNumber} is a single-row {productType.toLowerCase()} designed for radial loads and moderate axial loads in both directions. Its compact {dimensions} dimensions make it suitable for small electric motors, pumps, fans, power tools, light machinery and general industrial equipment.</p></section></div>
        <div className="product-info">
          <p className="eyebrow">{productType.toUpperCase()}</p><h1>{productName}</h1>
          <p className="product-identifiers"><span><b>Bearing designation:</b> {designation}</span><span><b>Brand:</b> {brand}</span><span><b>Configuration:</b> {suffix.label}</span></p>
          <p className="product-summary">Single-row {productType.toLowerCase()} with {bore} mm bore, {outer} mm outside diameter and {width} mm width. Suitable for a wide range of electric motors, machinery and general industrial applications.</p>
          <div className="quick-dimensions" aria-label="Key dimensions"><div><span>Bore diameter <b>(d)</b></span><strong>{bore} mm</strong></div><div><span>Outside diameter <b>(D)</b></span><strong>{outer} mm</strong></div><div><span>Width <b>(B)</b></span><strong>{width} mm</strong></div></div>
          <div className="commerce-state"><strong>Price on Request</strong><span>Confirm Availability</span></div>
          <div className="product-actions product-actions-detail"><a className="button primary" href={quoteUrl}>Request Quotation</a><a className="button whatsapp" href={`https://wa.me/${WHATSAPP}?text=${whatsappMessage}`}>WhatsApp Us</a><a className="button secondary" href={`tel:${PHONE}`}>Call Now</a><a className="button text-action" href={`https://wa.me/${WHATSAPP}?text=${photoMessage}`}>Send Bearing Photo</a></div>
          <p className="action-help">Need help confirming the correct bearing? Share the bearing number, dimensions or a clear photo of the old bearing.</p>
          <ul className="trust-notes"><li>Please confirm critical specifications before ordering.</li><li>Brand and country of origin are confirmed at quotation where applicable.</li><li>Delivery is available across Bangladesh; timing depends on stock and location.</li></ul>
        </div>
      </section>
      <section className="detail-section product-overview-continuation"><p>This page shows the selected <strong>{designation}</strong> configuration: {suffix.description}. Availability, cage design, lubrication and country of origin may differ by supply batch. Confirm the complete designation and all application-critical details with Bearing Mart BD before ordering.</p></section>
      <section className="detail-section"><h2>Technical Specifications</h2><div className="technical-table-wrap"><table className="technical-table"><caption>Technical data for {productName}</caption><tbody>{specs.map(([label, value]) => <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody></table></div></section>
      <section className="detail-section"><h2>Suffixes and Available Variants</h2><p className="section-intro">Suffixes can change seals, shields, internal clearance and other specifications. The selected option does not guarantee stock; confirm the exact {brand} designation before ordering.</p><div className="variant-chips">{brandBearingOptions[brand].map((option) => <a className={option.value === suffix.value ? "active" : ""} href={`${canonical}${option.value ? `&suffix=${encodeURIComponent(option.value)}` : ""}`} key={option.value || "open"}>{bearingDesignation(bearingNumber, brand, option.value)} — {option.description}</a>)}</div></section>
      <section className="detail-columns"><section className="detail-section"><h2>Typical Applications</h2><ul><li>Small electric motors</li><li>Fans and blowers</li><li>Pumps and power tools</li><li>Light-duty gearboxes</li><li>Office, textile and general industrial machinery</li></ul><p className="section-intro">Application examples are general guidance only. Confirm load, speed, fit, clearance, sealing, lubrication and operating environment before installation.</p></section><section className="detail-section"><h2>Brand and Product Authenticity</h2><p>Bearing Mart BD supplies bearings through its available sourcing network and aims to provide products with clear brand, specification and supply information. Packaging, markings and country of origin can vary by manufacturer, product variant and supply batch. Where authenticity or origin is critical, request current product and packaging photos with your quotation before confirming the order.</p></section></section>
      <section className="detail-section"><h2>Availability and Delivery</h2><p>Current stock and delivery time must be confirmed at quotation. In-stock items may be dispatched according to the confirmed order and delivery location. Products that are not immediately available may be sourced on order; lead time can depend on brand, country of origin, quantity, import schedule and destination. Delivery support is available across Bangladesh.</p></section>
      {related.length > 0 && <section className="detail-section related-section"><h2>Related Bearings</h2><div className="related-grid">{related.map(([itemNumber, itemType, itemBore, itemOuter, itemWidth]) => <a href={`/products/ball-bearings/catalog/${itemNumber}?brand=${brand}`} className="related-card" key={itemNumber}><span>{brand} · {itemType}</span><strong>{itemNumber}</strong><p>{itemBore} × {itemOuter} × {itemWidth} mm</p><em>View Details →</em></a>)}</div></section>}
    </section>
    <div className="mobile-product-actions" aria-label="Product actions"><a href={quoteUrl}>Request Quote</a><a href={`https://wa.me/${WHATSAPP}?text=${whatsappMessage}`}>WhatsApp</a></div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
  </main>;
}
