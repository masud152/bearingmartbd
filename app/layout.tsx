import type { Metadata } from "next";
import "./globals.css";
import "./product-images.css";
import HitCounter from "./hit-counter";

export const metadata: Metadata = {
  title: "Bearing Mart BD | Quality Bearings, Smooth Solutions",
  description: "Bearing Mart BD is an importer and supplier of quality industrial bearings in Dhaka.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <footer className="global-footer"><span>© {new Date().getFullYear()} Bearing Mart BD</span><span className="footer-links"><a href="/terms">Terms &amp; Conditions</a><a href="/privacy">Privacy Policy</a></span><span>Quality Bearings, Smooth Solutions</span></footer>
        <HitCounter />
      </body>
    </html>
  );
}
