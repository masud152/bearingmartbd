import { env } from "cloudflare:workers";
import { getCustomerFromSession } from "../../../customer-auth";

const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

export async function PATCH(request: Request) {
  const customer = await getCustomerFromSession(request.headers.get("cookie"));
  if (!customer) return Response.json({ error: "Customer authentication is required." }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid profile update." }, { status: 400 }); }
  const fullName = text(body.fullName, 150), mobile = text(body.mobile, 30).replace(/[\s-]/g, ""), companyName = text(body.companyName, 180), responsiblePersonName = text(body.responsiblePersonName, 150), address = text(body.address, 600);
  if (!fullName || !/^\+?[0-9]{10,15}$/.test(mobile) || !address) return Response.json({ error: "Provide a valid name, mobile number, and address." }, { status: 400 });
  try {
    await env.DB.prepare("UPDATE customers SET full_name=?,mobile=?,company_name=?,responsible_person_name=?,address=?,updated_at=? WHERE id=?").bind(fullName, mobile, companyName || null, responsiblePersonName || null, address, new Date().toISOString(), customer.id).run();
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE")) return Response.json({ error: "That mobile number is already registered." }, { status: 409 });
    return Response.json({ error: "Profile update could not be saved." }, { status: 500 });
  }
}
