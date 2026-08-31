import { notFound } from "next/navigation";
import { categories, getCategory } from "../../product-data";
import CatalogBrowser from "../../catalog-browser";
import { getManagedBallBearingProducts } from "../../managed-product-data";
import CategoryCatalogBrowser from "../../category-catalog-browser";
import { categoryCatalogue } from "../../category-catalog-data";

type ProductPageProps = { params: Promise<{ slug: string }> };

const brands = {
  stocked: ["SKF", "NSK", "NTN", "KOYO/JTEKT", "TIMKEN", "NACHI"],
  onOrder: ["SKF", "FAG", "INA", "NSK", "NTN", "KOYO/JTEKT", "TIMKEN", "NACHI", "IKO"],
  unavailable: ["FYH", "ASAHI", "THK", "HIWIN", "NMB", "ZWZ", "HRB", "C&U"],
};

function BrandAvailability() {
  return <section className="brands-section" id="brand-availability">
    <div><p className="eyebrow">BRAND AVAILABILITY</p><h2>Brands we supply</h2><p>Availability may vary by bearing type, size, and quantity. Please confirm before ordering.</p></div>
    <div className="brand-statuses">
      <div className="brand-status stocked"><h3>Available Now</h3><p>Normally stocked and available for immediate enquiry.</p><div className="brand-tags">{brands.stocked.map((brand) => <span key={brand}>{brand}</span>)}</div></div>
      <div className="brand-status order"><h3>Import on Request</h3><p>Can be sourced and imported for your requirements.</p><div className="brand-tags">{brands.onOrder.map((brand) => <span key={brand}>{brand}</span>)}</div></div>
      <div className="brand-status unavailable"><h3>Not Selling</h3><p>These brands are not in our current supply range.</p><div className="brand-tags">{brands.unavailable.map((brand) => <span key={brand}>{brand}</span>)}</div></div>
    </div>
  </section>;
}

export function generateStaticParams() {
  return categories.map(({ slug }) => ({ slug }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  if (category.slug === "ball-bearings") { const products=await getManagedBallBearingProducts(); return <main className="catalog-page shop-page"><header className="nav"><a className="brand" href="/">Bearing <span>Mart BD</span></a><nav><a href="/about">About</a><a href="/#products">Products</a><a href="/our-brands">Our Brands</a><a href="/contact">Contact</a></nav><a className="nav-call" href="https://wa.me/8801914528336">WhatsApp Now</a></header><section className="catalog-hero shop-hero"><p className="eyebrow">BALL BEARINGS</p><h1>Find the right<br />bearing <em>faster.</em></h1><p>Search by model number or brand, compare dimensions, and open a full product-details page.</p></section><CatalogBrowser products={products}/><BrandAvailability/><section className="category-cta"><p>Need help confirming a brand?</p><a href="https://wa.me/8801914528336" target="_blank" rel="noreferrer">Ask Bearing Mart BD on WhatsApp</a></section><footer><span>© {new Date().getFullYear()} Bearing Mart BD</span><span>Quality Bearings, Smooth Solutions</span></footer></main>; }

  const catalogue = categoryCatalogue(category.slug);
  return <main className="catalog-page shop-page">
    <header className="nav"><a className="brand" href="/" aria-label="Bearing Mart BD home">Bearing <span>Mart BD</span></a><nav aria-label="Main navigation"><a href="/#about">About</a><a href="/#products">Products</a><a href="/our-brands">Our Brands</a><a href="/#contact">Contact</a></nav><a className="nav-call" href="https://wa.me/8801914528336" target="_blank" rel="noreferrer">WhatsApp Now</a></header>
    <section className="catalog-hero shop-hero"><p className="eyebrow">{category.name.toUpperCase()}</p><a className="back-link" href="/#products">← Back to all categories</a><h1>Find the right<br />product <em>faster.</em></h1><p>{category.description} Search by brand, model and product type, then open the full details page.</p></section>
    <CategoryCatalogBrowser categorySlug={category.slug} items={catalogue}/>
    <BrandAvailability/>
    <section className="category-cta"><p>Need help finding the right item?</p><a href="https://wa.me/8801914528336" target="_blank" rel="noreferrer">Chat with Bearing Mart BD on WhatsApp</a></section>
    <footer><span>© {new Date().getFullYear()} Bearing Mart BD</span><span>Quality Bearings, Smooth Solutions</span></footer>
  </main>;
}
