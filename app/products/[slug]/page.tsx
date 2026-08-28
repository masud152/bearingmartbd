import { notFound } from "next/navigation";
import { categories, getCategory } from "../../product-data";
import CatalogBrowser from "../../catalog-browser";
import { getManagedBallBearingProducts } from "../../managed-product-data";

type ProductPageProps = { params: Promise<{ slug: string }> };

const brands = {
  stocked: ["SKF", "NSK", "NTN", "KOYO/JTEKT", "TIMKEN", "NACHI"],
  onOrder: ["SKF", "FAG", "INA", "NSK", "NTN", "KOYO/JTEKT", "TIMKEN", "NACHI", "IKO"],
  unavailable: ["FYH", "ASAHI", "THK", "HIWIN", "NMB", "ZWZ", "HRB", "C&U"],
};

export function generateStaticParams() {
  return categories.map(({ slug }) => ({ slug }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  if (category.slug === "ball-bearings") { const products=await getManagedBallBearingProducts(); return <main className="catalog-page shop-page"><header className="nav"><a className="brand" href="/">Bearing <span>Mart BD</span></a><nav><a href="/about">About</a><a href="/#products">Products</a><a href="/contact">Contact</a></nav><a className="nav-call" href="https://wa.me/8801914528336">WhatsApp Now</a></header><section className="catalog-hero shop-hero"><p className="eyebrow">BALL BEARINGS</p><h1>Find the right<br />bearing <em>faster.</em></h1><p>Search by model number or brand, compare dimensions, and open a full product-details page.</p></section><CatalogBrowser products={products}/></main>; }

  return <main className="category-page">
    <header className="nav"><a className="brand" href="/" aria-label="Bearing Mart BD home">Bearing <span>Mart BD</span></a><nav aria-label="Main navigation"><a href="/#about">About</a><a href="/#products">Products</a><a href="/#contact">Contact</a></nav><a className="nav-call" href="https://wa.me/8801914528336" target="_blank" rel="noreferrer">WhatsApp Now</a></header>
    <section className="category-hero"><p className="eyebrow">PRODUCT CATEGORY</p><a className="back-link" href="/#products">← Back to all categories</a><h1>{category.name}</h1><p>{category.description}</p></section>
    <section className="category-content"><div><p className="eyebrow">OUR RANGE</p><h2>{category.subcategories ? "Available subcategories" : "Reliable industrial supply"}</h2></div>{category.subcategories ? <ol className="subcategory-list">{category.subcategories.map((subcategory, index) => <li key={subcategory}><span>0{index + 1}</span>{subcategory}</li>)}</ol> : <div className="category-note"><p>We can help you select the right {category.name.toLowerCase()} for your machinery and application.</p><a className="button primary" href="https://wa.me/8801914528336" target="_blank" rel="noreferrer">Ask on WhatsApp</a></div>}</section>
    <section className="brands-section"><div><p className="eyebrow">BRAND AVAILABILITY</p><h2>Brands we supply</h2><p>Availability may vary by bearing type, size, and quantity. Please confirm before ordering.</p></div><div className="brand-statuses"><div className="brand-status stocked"><h3>Normally stock</h3><p>Usually available for immediate enquiry.</p><div className="brand-tags">{brands.stocked.map((brand) => <span key={brand}>{brand}</span>)}</div></div><div className="brand-status order"><h3>Available on order</h3><p>Can be sourced for your requirements.</p><div className="brand-tags">{brands.onOrder.map((brand) => <span key={brand}>{brand}</span>)}</div></div><div className="brand-status unavailable"><h3>Not currently supplied</h3><p>These brands are not in our current supply range.</p><div className="brand-tags">{brands.unavailable.map((brand) => <span key={brand}>{brand}</span>)}</div></div></div></section>
    {category.slug === "ball-bearings" && <section className="catalog-link"><p className="eyebrow">PRODUCT CATALOGUE</p><h2>Browse Ball Bearing models</h2><p>View the 24 base products prepared from our catalogue file.</p><a className="button primary" href="/products/ball-bearings/catalog">Open Ball Bearings Catalogue</a></section>}
    <section className="category-cta"><p>Need help finding the right item?</p><a href="https://wa.me/8801914528336" target="_blank" rel="noreferrer">Chat with Bearing Mart BD on WhatsApp</a></section>
    <footer><span>© {new Date().getFullYear()} Bearing Mart BD</span><span>Quality Bearings, Smooth Solutions</span></footer>
  </main>;
}
