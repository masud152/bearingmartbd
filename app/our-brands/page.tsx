const brands = {
  stocked: ["SKF", "NSK", "NTN", "KOYO/JTEKT", "TIMKEN", "NACHI"],
  onOrder: ["SKF", "FAG", "INA", "NSK", "NTN", "KOYO/JTEKT", "TIMKEN", "NACHI", "IKO"],
  unavailable: ["FYH", "ASAHI", "THK", "HIWIN", "NMB", "ZWZ", "HRB", "C&U"],
};

export const metadata = {
  title: "Our Brands | Bearing Mart BD",
  description: "Check bearing brands available now, available to import on request, and not currently sold by Bearing Mart BD.",
};

export default function OurBrandsPage() {
  return <main className="category-page">
    <header className="nav"><a className="brand" href="/">Bearing <span>Mart BD</span></a><nav aria-label="Main navigation"><a href="/about">About</a><a href="/#products">Products</a><a href="/our-brands" aria-current="page">Our Brands</a><a href="/customer-registration">Register</a><a href="/customer-account">Customer Login</a><a href="/contact">Contact</a></nav><a className="nav-call" href="https://wa.me/8801914528336" target="_blank" rel="noreferrer">WhatsApp Now</a></header>
    <section className="category-hero"><p className="eyebrow">OUR BRANDS</p><h1>Brand availability,<br/>made clear.</h1><p>Check which bearing brands are available now, which can be imported on request, and which are outside our current supply range.</p></section>
    <section className="brands-section">
      <div><p className="eyebrow">BRAND AVAILABILITY</p><h2>Brands we supply</h2><p>Availability may vary by bearing type, size, and quantity. Please confirm before ordering.</p></div>
      <div className="brand-statuses">
        <div className="brand-status stocked"><h3>Available Now</h3><p>Normally stocked and available for immediate enquiry.</p><div className="brand-tags">{brands.stocked.map((brand) => <span key={brand}>{brand}</span>)}</div></div>
        <div className="brand-status order"><h3>Import on Request</h3><p>Can be sourced and imported for your requirements.</p><div className="brand-tags">{brands.onOrder.map((brand) => <span key={brand}>{brand}</span>)}</div></div>
        <div className="brand-status unavailable"><h3>Not Selling</h3><p>These brands are not in our current supply range.</p><div className="brand-tags">{brands.unavailable.map((brand) => <span key={brand}>{brand}</span>)}</div></div>
      </div>
    </section>
    <section className="category-cta"><p>Need help confirming a brand or model?</p><a href="https://wa.me/8801914528336" target="_blank" rel="noreferrer">Ask Bearing Mart BD on WhatsApp</a></section>
    <footer><span>© {new Date().getFullYear()} Bearing Mart BD</span><span>Quality Bearings, Smooth Solutions</span></footer>
  </main>;
}
