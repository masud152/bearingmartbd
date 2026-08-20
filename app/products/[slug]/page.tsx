import { notFound } from "next/navigation";
import { categories, getCategory } from "../../product-data";

type ProductPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return categories.map(({ slug }) => ({ slug }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  return <main className="category-page">
    <header className="nav"><a className="brand" href="/" aria-label="Bearing Mart BD home">Bearing <span>Mart BD</span></a><nav aria-label="Main navigation"><a href="/#about">About</a><a href="/#products">Products</a><a href="/#contact">Contact</a></nav><a className="nav-call" href="https://wa.me/8801914528336" target="_blank" rel="noreferrer">WhatsApp Now</a></header>
    <section className="category-hero"><p className="eyebrow">PRODUCT CATEGORY</p><a className="back-link" href="/#products">← Back to all categories</a><h1>{category.name}</h1><p>{category.description}</p></section>
    <section className="category-content"><div><p className="eyebrow">OUR RANGE</p><h2>{category.subcategories ? "Available subcategories" : "Reliable industrial supply"}</h2></div>{category.subcategories ? <ol className="subcategory-list">{category.subcategories.map((subcategory, index) => <li key={subcategory}><span>0{index + 1}</span>{subcategory}</li>)}</ol> : <div className="category-note"><p>We can help you select the right {category.name.toLowerCase()} for your machinery and application.</p><a className="button primary" href="https://wa.me/8801914528336" target="_blank" rel="noreferrer">Ask on WhatsApp</a></div>}</section>
    <section className="category-cta"><p>Need help finding the right item?</p><a href="https://wa.me/8801914528336" target="_blank" rel="noreferrer">Chat with Bearing Mart BD on WhatsApp</a></section>
    <footer><span>© {new Date().getFullYear()} Bearing Mart BD</span><span>Quality Bearings, Smooth Solutions</span></footer>
  </main>;
}
