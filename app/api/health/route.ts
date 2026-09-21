import { env } from "@/lib/server/runtime";
export const dynamic = "force-dynamic";
export async function GET() { try { await env.DB.ping(); return Response.json({ status: "ok", database: "connected" }, { headers: { "cache-control": "no-store" } }); } catch { return Response.json({ status: "unavailable", database: "unavailable" }, { status: 503, headers: { "cache-control": "no-store" } }); } }
