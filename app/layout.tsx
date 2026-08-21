import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HitCounter from "./hit-counter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <footer className="global-footer"><span>© {new Date().getFullYear()} Bearing Mart BD</span><a href="/terms">Terms &amp; Conditions</a><span>Quality Bearings, Smooth Solutions</span></footer>
        <HitCounter />
      </body>
    </html>
  );
}
