import ContactForm from "../contact-form";

export default function ContactPage() {
  return <main className="contact-page">
    <header className="nav"><a className="brand" href="/" aria-label="Bearing Mart BD home">Bearing <span>Mart BD</span></a><nav aria-label="Main navigation"><a href="/about">About</a><a href="/#products">Products</a><a href="/contact">Contact</a></nav><a className="nav-call" href="https://wa.me/8801914528336" target="_blank" rel="noreferrer">WhatsApp Now</a></header>
    <section className="contact-page-hero"><p className="eyebrow">CONTACT BEARING MART BD</p><h1>Let&apos;s keep your<br /><em>machines moving.</em></h1><p>Send us your requirement and our team will help you find the right bearing or industrial product.</p></section>
    <section className="contact-page-content"><div className="contact-details"><p className="eyebrow">VISIT OR CALL US</p><h2>Your reliable<br />bearing partner.</h2><div className="contact-card"><p className="contact-label">Visit our shop</p><address>Bearing Mart BD<br />10, Modonpal Lane<br />Siddique Machineries Market (2nd Floor)<br />Nawabpur, Dhaka-1100</address><a href="tel:+8801914528336">+880 1914-528336</a><a className="contact-email" href="mailto:contact@bearingmartbd.com">contact@bearingmartbd.com</a></div></div><ContactForm /></section>
    <footer><span>© {new Date().getFullYear()} Bearing Mart BD</span><span>Quality Bearings, Smooth Solutions</span></footer>
  </main>;
}
