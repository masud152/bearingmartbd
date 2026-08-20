import type { CSSProperties } from "react";

const products = [
  "Ball Bearings",
  "Roller Bearings",
  "Pillow Block Bearings",
  "Linear Bearings",
  "Bearing Housings",
  "Industrial Accessories",
];

export default function Home() {
  return (
    <main>
      <header className="nav">
        <a className="brand" href="#home" aria-label="Bearing Mart BD home">Bearing <span>Mart BD</span></a>
        <nav aria-label="Main navigation">
          <a href="#about">About</a><a href="#products">Products</a><a href="#contact">Contact</a>
        </nav>
        <a className="nav-call" href="https://wa.me/8801914528336" target="_blank" rel="noreferrer">WhatsApp Now</a>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <p className="eyebrow">ALL KINDS OF BEARING IMPORTER &amp; SUPPLIER</p>
          <h1>Quality Bearings.<br /><em>Smooth Solutions.</em></h1>
          <p className="lead">Reliable bearings and machinery solutions for workshops, factories, and industrial operations across Bangladesh.</p>
          <div className="actions"><a className="button primary" href="https://wa.me/8801914528336" target="_blank" rel="noreferrer">WhatsApp 01914-528336</a><a className="button secondary" href="#products">Explore Products</a></div>
        </div>
        <div className="hero-art">
          <div className="ring ring-one">{Array.from({ length: 12 }, (_, index) => <span className="ball" style={{ "--i": index } as CSSProperties} key={index} />)}</div>
          <div className="ring ring-two">{Array.from({ length: 8 }, (_, index) => <span className="ball" style={{ "--i": index } as CSSProperties} key={index} />)}</div>
          <div className="ring ring-three" />
          <img src="/bearing-mart-bd-logo.jpeg" alt="Bearing Mart BD" />
        </div>
      </section>

      <section className="statement" id="about"><p>Dependable industrial components, supplied with attention to quality and service.</p></section>

      <section className="products section" id="products">
        <div className="section-heading"><p className="eyebrow">OUR RANGE</p><h2>Industrial bearings for<br />every application.</h2><p>We source and supply essential bearing solutions for machinery and maintenance requirements.</p></div>
        <div className="product-grid">{products.map((product, index) => <article className="product" key={product}><span>0{index + 1}</span><h3>{product}</h3><div className="product-mark">◉</div></article>)}</div>
      </section>

      <section className="contact" id="contact">
        <div><p className="eyebrow">GET IN TOUCH</p><h2>Let&apos;s keep your<br /><em>machines moving.</em></h2></div>
        <div className="contact-card"><p className="contact-label">Visit our shop</p><address>Bearing Mart BD<br />10, Modonpal Lane<br />Siddique Machineries Market (2nd Floor)<br />Nawabpur, Dhaka-1100</address><a href="tel:+8801914528336">+880 1914-528336</a><p className="owner">Md. Shahidul Islam · Proprietor</p></div>
      </section>
      <footer><span>© {new Date().getFullYear()} Bearing Mart BD</span><span>Quality Bearings, Smooth Solutions</span></footer>
    </main>
  );
}
