"use client";

import { FormEvent } from "react";

export default function ContactForm() {
  function sendToWhatsApp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = [
      "Hello Bearing Mart BD, I would like to make an enquiry.",
      "",
      `Name: ${form.get("name")}`,
      `Phone: ${form.get("phone")}`,
      `Email: ${form.get("email") || "Not provided"}`,
      `Product / bearing number: ${form.get("product") || "Not specified"}`,
      "",
      `Message: ${form.get("message")}`,
    ].join("\n");

    window.open(`https://wa.me/8801914528336?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  return <form className="contact-form" onSubmit={sendToWhatsApp}>
    <p className="contact-label">Send an enquiry</p>
    <div className="form-row">
      <label>Name<input name="name" required placeholder="Your full name" /></label>
      <label>Phone number<input name="phone" required type="tel" placeholder="01XXXXXXXXX" /></label>
    </div>
    <div className="form-row">
      <label>Email address <span>(optional)</span><input name="email" type="email" placeholder="you@example.com" /></label>
      <label>Bearing number / product <span>(optional)</span><input name="product" placeholder="e.g. 6205, UCP 205" /></label>
    </div>
    <label>How can we help?<textarea name="message" required rows={5} placeholder="Tell us the bearing type, quantity, brand, size, or other requirement." /></label>
    <button className="form-submit" type="submit">Send enquiry on WhatsApp →</button>
    <p className="form-note">Submitting opens WhatsApp with your enquiry prepared for our team.</p>
  </form>;
}
