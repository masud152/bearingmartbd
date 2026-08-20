import { env } from "cloudflare:workers";

const tableSql = `CREATE TABLE IF NOT EXISTS site_stats (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0
)`;

async function ensureCounter() {
  await env.DB.batch([
    env.DB.prepare(tableSql),
    env.DB.prepare("INSERT OR IGNORE INTO site_stats (key, value) VALUES ('global_hits', 0)"),
  ]);
}

export async function GET() {
  await ensureCounter();
  const result = await env.DB.prepare("SELECT value FROM site_stats WHERE key = 'global_hits'").first<{ value: number }>();
  return Response.json({ hits: result?.value ?? 0 });
}

export async function POST() {
  await ensureCounter();
  await env.DB.prepare("UPDATE site_stats SET value = value + 1 WHERE key = 'global_hits'").run();
  const result = await env.DB.prepare("SELECT value FROM site_stats WHERE key = 'global_hits'").first<{ value: number }>();
  return Response.json({ hits: result?.value ?? 0 });
}
