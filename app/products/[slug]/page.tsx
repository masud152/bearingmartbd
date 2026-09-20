import { notFound } from "next/navigation";
import { categories, getCategory } from "../../product-data";
import CatalogBrowser from "../../catalog-browser";
import { getManagedBallBearingProducts } from "../../managed-product-data";
import CategoryCatalogBrowser from "../../category-catalog-browser";
import { categoryCatalogues } from "../../category-catalogue-data";

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

  const products = categoryCatalogues[category.slug] ?? [];
  return <main className="catalog-page shop-page">
    <header className="nav"><a className="brand" href="/" aria-label="Bearing Mart BD home">Bearing <span>Mart BD</span></a><nav aria-label="Main navigation"><a href="/#about">About</a><a href="/#products">Products</a><a href="/#contact">Contact</a></nav><a className="nav-call" href="https://wa.me/8801914528336" target="_blank" rel="noreferrer">WhatsApp Now</a></header>
    <section className="catalog-hero shop-hero"><p className="eyebrow">{category.name.toUpperCase()}</p><h1>Find the right<br /><em>product faster.</em></h1><p>{category.description}</p></section>
    <CategoryCatalogBrowser products={products} categorySlug={category.slug}/>
  </main>;
}
