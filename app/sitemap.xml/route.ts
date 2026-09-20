import { env } from "cloudflare:workers";

const origin = "https://bearingmartbd.com";
const escape = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const page = (path: string, lastmod?: string) => `<url><loc>${origin}${path}</loc>${lastmod ? `<lastmod>${escape(lastmod.slice(0, 10))}</lastmod>` : ""}</url>`;

export async function GET() {
  const staticPaths = ["/", "/about", "/contact", "/terms", "/privacy", "/products/ball-bearings/catalog", "/products/ball-bearings", "/products/roller-bearings", "/products/pillow-block-bearings", "/products/linear-bearings", "/products/bearing-housings", "/products/industrial-accessories"];
  const products = await env.DB.prepare("SELECT c.slug AS categorySlug,p.slug,p.updated_at AS updatedAt FROM products p JOIN categories c ON c.id=p.category_id WHERE p.status='published' AND c.status='active'").all<{ categorySlug: string; slug: string; updatedAt: string }>();
  const urls = [...staticPaths.map((path) => page(path)), ...products.results.map((product) => page(`/products/${encodeURIComponent(product.categorySlug)}/catalog/${encodeURIComponent(product.slug)}`, product.updatedAt))];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
