import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getManagedBallBearingProduct, getManagedBallBearingProducts } from "../../../../managed-product-data";

export const dynamic = "force-dynamic";

const SITE_URL = "https://bearingmartbd.com";
const WHATSAPP = "8801914528336";
const PHONE = "+8801730015018";

function titleType(type: string) {
  return type.endsWith("s") ? type.slice(0, -1) : type;
}

export async function generateMetadata({ params }: { params: Promise<{ number: string }> }): Promise<Metadata> {
  const { number } = await params;
  const product = await getManagedBallBearingProduct(number);
  if (!product) return {};
  const [bearingNumber, type, bore, outer, width] = product;
  const productType = titleType(type);
  const title = `NSK ${bearingNumber} Bearing (${bore}×${outer}×${width} mm) | Bearing Mart BD`;
  const description = `Request a quotation for the NSK ${bearingNumber} ${productType.toLowerCase()}, size ${bore}×${outer}×${width} mm. Confirm current price, availability and delivery across Bangladesh.`;
  const url = `${SITE_URL}/products/ball-bearings/catalog/${bearingNumber}`;
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: "website" }, twitter: { card: "summary", title, description } };
}

export default async function ProductDetail({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const product = await getManagedBallBearingProduct(number);
  if (!product) notFound();
  const [bearingNumber, type, bore, outer, width] = product;
  const productType = titleType(type);
  const productName = `NSK ${bearingNumber} ${productType}`;
  const dimensions = `${bore} × ${outer} × ${width} mm`;
  const canonical = `${SITE_URL}/products/ball-bearings/catalog/${bearingNumber}`;
  const whatsappMessage = encodeURIComponent(`Hello Bearing Mart BD, I would like a quotation for ${productName} (${dimensions}). Please confirm current price, stock and delivery.`);
  const photoMessage = encodeURIComponent(`Hello Bearing Mart BD, I would like help identifying a bearing. I will send a clear photo of the bearing number and both sides.`);
  const quoteUrl = `/contact?product=${encodeURIComponent(productName)}&bearing=${bearingNumber}`;
  const publishedProducts = await getManagedBallBearingProducts();
  const related = publishedProducts.filter(([itemNumber, itemType]) => itemNumber !== bearingNumber && itemType === type).slice(0, 4);
  const specs = [
    ["Bearing number", bearingNumber], ["Category", "Ball Bearings"], ["Bearing type", productType], ["Brand", "NSK"],
    ["Bore diameter (d)", `${bore} mm`], ["Outside diameter (D)", `${outer} mm`], ["Width (B)", `${width} mm`],
    ["Seal / shield", "Open"], ["Number of rows", "Single row"], ["Internal clearance", "Confirm before ordering"],
    ["Country of origin", "Confirmed at quotation / supply"], ["SKU", `NSK-${bearingNumber}`],
  ];
  const productSchema = { "@context": "https://schema.org", "@type": "Product", name: productName, sku: `NSK-${bearingNumber}`, mpn: bearingNumber, brand: { "@type": "Brand", name: "NSK" }, category: "Ball Bearings", description: `Single-row ${productType.toLowerCase()} with ${bore} mm bore, ${outer} mm outside diameter and ${width} mm width.`, url: canonical, additionalProperty: [{ "@type": "PropertyValue", name: "Bore diameter (d)", value: `${bore} mm` }, { "@type": "PropertyValue", name: "Outside diameter (D)", value: `${outer} mm` }, { "@type": "PropertyValue", name: "Width (B)", value: `${width} mm` }] };
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }, { "@type": "ListItem", position: 2, name: "Products", item: `${SITE_URL}/#products` }, { "@type": "ListItem", position: 3, name: "Ball Bearings", item: `${SITE_URL}/products/ball-bearings` }, { "@type": "ListItem", position: 4, name: bearingNumber, item: canonical }] };

  return <main className="detail-page">
    <header className="nav"><a className="brand" href="/">Bearing <span>Mart BD</span></a><a className="nav-call" href={`https://wa.me/${WHATSAPP}?text=${whatsappMessage}`}>WhatsApp Enquiry</a></header>
    <section className="product-detail-wrap">
      <nav className="product-breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/#products">Products</a></li><li><a href="/products/ball-bearings">Ball Bearings</a></li><li aria-current="page">{bearingNumber}</li></ol></nav>
      <section className="product-hero-detail">
        <div className="product-gallery" aria-label={`${productName} image unavailable`}><div className="product-placeholder" role="img" aria-label={`${productName}: product image unavailable`}><span className="bearing-drawing" /><strong>{bearingNumber}</strong><small>NSK</small></div><p>Product image available on request</p><section className="image-overview"><h2>Product Overview</h2><p>The NSK {bearingNumber} is a single-row {productType.toLowerCase()} designed for radial loads and moderate axial loads in both directions. Its compact {dimensions} dimensions make it suitable for small electric motors, pumps, fans, power tools, light machinery and general industrial equipment.</p></section></div>
        <div className="product-info">
          <p className="eyebrow">{productType.toUpperCase()}</p><h1>{productName}</h1>
          <p className="product-identifiers"><span><b>Bearing number:</b> {bearingNumber}</span><span><b>Brand:</b> NSK</span></p>
          <p className="product-summary">Single-row {productType.toLowerCase()} with {bore} mm bore, {outer} mm outside diameter and {width} mm width. Suitable for a wide range of electric motors, machinery and general industrial applications.</p>
          <div className="quick-dimensions" aria-label="Key dimensions"><div><span>Bore diameter <b>(d)</b></span><strong>{bore} mm</strong></div><div><span>Outside diameter <b>(D)</b></span><strong>{outer} mm</strong></div><div><span>Width <b>(B)</b></span><strong>{width} mm</strong></div></div>
          <div className="commerce-state"><strong>Price on Request</strong><span>Confirm Availability</span></div>
          <div className="product-actions product-actions-detail"><a className="button primary" href={quoteUrl}>Request Quotation</a><a className="button whatsapp" href={`https://wa.me/${WHATSAPP}?text=${whatsappMessage}`}>WhatsApp Us</a><a className="button secondary" href={`tel:${PHONE}`}>Call Now</a><a className="button text-action" href={`https://wa.me/${WHATSAPP}?text=${photoMessage}`}>Send Bearing Photo</a></div>
          <p className="action-help">Need help confirming the correct bearing? Share the bearing number, dimensions or a clear photo of the old bearing.</p>
          <ul className="trust-notes"><li>Please confirm critical specifications before ordering.</li><li>Brand and country of origin are confirmed at quotation where applicable.</li><li>Delivery is available across Bangladesh; timing depends on stock and location.</li></ul>
        </div>
      </section>
      <section className="detail-section product-overview-continuation"><p>This page describes the open {bearingNumber} bearing. Seals, shields, internal clearance, cage design, lubrication and country of origin may differ by variant or supply batch. Confirm all application-critical details with Bearing Mart BD before ordering.</p></section>
      <section className="detail-section"><h2>Technical Specifications</h2><div className="technical-table-wrap"><table className="technical-table"><caption>Technical data for {productName}</caption><tbody>{specs.map(([label, value]) => <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody></table></div></section>
      <section className="detail-section"><h2>Suffixes and Available Variants</h2><p className="section-intro">Suffixes can change seals, shields, internal clearance and other specifications. Confirm the exact NSK designation before ordering.</p><div className="variant-chips"><span>{bearingNumber} — Open bearing</span><span>{bearingNumber}ZZ — Ask about availability</span><span>{bearingNumber} C3 — Ask about availability</span></div></section>
      <section className="detail-columns"><section className="detail-section"><h2>Typical Applications</h2><ul><li>Small electric motors</li><li>Fans and blowers</li><li>Pumps and power tools</li><li>Light-duty gearboxes</li><li>Office, textile and general industrial machinery</li></ul><p className="section-intro">Application examples are general guidance only. Confirm load, speed, fit, clearance, sealing, lubrication and operating environment before installation.</p></section><section className="detail-section"><h2>Brand and Product Authenticity</h2><p>Bearing Mart BD supplies bearings through its available sourcing network and aims to provide products with clear brand, specification and supply information. Packaging, markings and country of origin can vary by manufacturer, product variant and supply batch. Where authenticity or origin is critical, request current product and packaging photos with your quotation before confirming the order.</p></section></section>
      <section className="detail-section"><h2>Availability and Delivery</h2><p>Current stock and delivery time must be confirmed at quotation. In-stock items may be dispatched according to the confirmed order and delivery location. Products that are not immediately available may be sourced on order; lead time can depend on brand, country of origin, quantity, import schedule and destination. Delivery support is available across Bangladesh.</p></section>
      {related.length > 0 && <section className="detail-section related-section"><h2>Related Bearings</h2><div className="related-grid">{related.map(([itemNumber, itemType, itemBore, itemOuter, itemWidth]) => <a href={`/products/ball-bearings/catalog/${itemNumber}`} className="related-card" key={itemNumber}><span>NSK · {itemType}</span><strong>{itemNumber}</strong><p>{itemBore} × {itemOuter} × {itemWidth} mm</p><em>View Details →</em></a>)}</div></section>}
    </section>
    <div className="mobile-product-actions" aria-label="Product actions"><a href={quoteUrl}>Request Quote</a><a href={`https://wa.me/${WHATSAPP}?text=${whatsappMessage}`}>WhatsApp</a></div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
  </main>;
}
