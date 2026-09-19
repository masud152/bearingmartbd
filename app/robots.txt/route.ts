export function GET() {
  return new Response(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /customer-account\nDisallow: /customer-profile\nDisallow: /customer-registration\nDisallow: /customer-password-reset\nDisallow: /api/\n\nSitemap: https://bearingmartbd.com/sitemap.xml\n`, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
