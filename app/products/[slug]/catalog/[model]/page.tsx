import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategory } from "../../../../product-data";
import { getCategoryProduct } from "../../../../category-catalogue-data";

const SITE_URL = "https://bearingmartbd.com";
const WHATSAPP = "8801914528336";
const PHONE = "+8801730015018";

type ProductDetailProps = { params: Promise<{ slug:string; model:string }> };

export async function generateMetadata({params}:ProductDetailProps):Promise<Metadata> {
  const {slug,model} = await params;
  const category = getCategory(slug);
  const product = getCategoryProduct(slug,model);
  if (!category || !product) return {};
  const title = `${product.brand} ${product.model} ${product.type} | Bearing Mart BD`;
  const description = `Request a quotation for the ${product.brand} ${product.model} ${product.type} from Bearing Mart BD.`;
  const url = `${SITE_URL}/products/${slug}/catalog/${product.slug}`;
  return {title,description,alternates:{canonical:url},openGraph:{title,description,url,type:"website",images:[`${SITE_URL}${product.image}`]}};
}

export default async function CategoryProductDetail({params}:ProductDetailProps) {
  const {slug,model} = await params;
  const category = getCategory(slug);
  const product = getCategoryProduct(slug,model);
  if (!category || !product || category.slug === "ball-bearings") notFound();

  const productName = `${product.brand} ${product.model} ${product.type}`;
  const quoteUrl = `/contact?product=${encodeURIComponent(productName)}&bearing=${encodeURIComponent(product.model)}`;
  const whatsappMessage = encodeURIComponent(`Hello Bearing Mart BD, I would like a quotation for ${productName}. Please confirm the current price, exact specification, stock and delivery.`);
  const specs = [["Product number",product.model],["Category",category.name],["Product type",product.type],["Brand",product.brand],["Availability",product.availability],["Price","On request"],["Exact dimensions","Confirm at quotation"],["Country of origin","Confirmed at quotation / supply"],["SKU",`${product.brand.replaceAll("/","")}-${product.slug.toUpperCase()}`]];
  const productSchema = {"@context":"https://schema.org","@type":"Product",name:productName,image:`${SITE_URL}${product.image}`,sku:`${product.brand.replaceAll("/","")}-${product.slug.toUpperCase()}`,mpn:product.model,brand:{"@type":"Brand",name:product.brand},category:category.name,description:`${product.type} from Bearing Mart BD. Exact specification is confirmed at quotation.`,url:`${SITE_URL}/products/${slug}/catalog/${product.slug}`};

  return <main className="detail-page"><header className="nav"><a className="brand" href="/">Bearing <span>Mart BD</span></a><a className="nav-call" href={`https://wa.me/${WHATSAPP}?text=${whatsappMessage}`}>WhatsApp Enquiry</a></header><section className="product-detail-wrap"><nav className="product-breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href={`/products/${slug}`}>{category.name}</a></li><li aria-current="page">{product.model}</li></ol></nav><section className="product-hero-detail"><div className="product-gallery"><div className="product-uploaded-image category-detail-image"><img src={product.image} alt={`Representative ${product.type} product photograph`}/></div><p>Official manufacturer / supplier reference photo</p><section className="image-overview"><h2>Product Overview</h2><p>The {product.brand} {product.model} is listed as a {product.type.toLowerCase()} in our {category.name.toLowerCase()} range. Please confirm the exact model, dimensions, configuration and application requirement before ordering.</p></section></div><div className="product-info"><p className="eyebrow">{category.name.toUpperCase()} · {product.brand}</p><h1>{product.brand} {product.model} {product.type}</h1><p className="product-identifiers"><span><b>Product number:</b> {product.model}</span><span><b>Brand:</b> {product.brand}</span></p><p className="product-summary">Reliable industrial product support with quotation, sourcing and delivery assistance across Bangladesh.</p><div className="quick-dimensions"><div><span>Product type</span><strong>{product.type}</strong></div><div><span>Brand</span><strong>{product.brand}</strong></div><div><span>Availability</span><strong>{product.availability}</strong></div></div><div className="commerce-state"><strong>Price on Request</strong><span>{product.availability}</span></div><div className="product-actions product-actions-detail"><a className="button primary" href={quoteUrl}>Request Quotation</a><a className="button whatsapp" href={`https://wa.me/${WHATSAPP}?text=${whatsappMessage}`}>WhatsApp Us</a><a className="button secondary" href={`tel:${PHONE}`}>Call Now</a></div><ul className="trust-notes"><li>Please confirm critical specifications before ordering.</li><li>Product photo is representative; exact model may vary.</li><li>Delivery is available across Bangladesh; timing depends on stock and location.</li></ul></div></section><section className="detail-section"><h2>Product Specifications</h2><div className="technical-table-wrap"><table className="technical-table"><caption>Product data for {productName}</caption><tbody>{specs.map(([label,value])=><tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody></table></div></section><section className="detail-section"><h2>Availability and Delivery</h2><p>{product.availability}. Current stock, exact specification and delivery time are confirmed when we prepare your quotation.</p></section></section><div className="mobile-product-actions"><a href={quoteUrl}>Request Quote</a><a href={`https://wa.me/${WHATSAPP}?text=${whatsappMessage}`}>WhatsApp</a></div><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(productSchema)}}/></main>;
}
