import { deleteCustomerSession,sessionCookie } from "../../../customer-auth";
export async function POST(request:Request){await deleteCustomerSession(request.headers.get("cookie"));const response=Response.json({ok:true});response.headers.set("set-cookie",sessionCookie("",0));response.headers.set("cache-control","no-store");return response}
