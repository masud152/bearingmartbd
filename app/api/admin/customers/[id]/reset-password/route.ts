import { env } from "cloudflare:workers";
import { authorizeApi } from "../../../../../admin/_lib/auth";
import { hashPassword } from "../../../../../customer-auth";

const ADMIN_RESET_PASSWORD="Abcd@1234";

export async function POST(_request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const auth=await authorizeApi("customers.update");
    if("response" in auth)return auth.response;
    const {id}=await params;
    const customer=await env.DB.prepare("SELECT full_name AS fullName,email FROM customers WHERE id=?").bind(id).first<{fullName:string;email:string}>();
    if(!customer)return Response.json({error:"Customer not found."},{status:404});
    const now=new Date().toISOString();
    const passwordHash=await hashPassword(ADMIN_RESET_PASSWORD);
    await env.DB.prepare("UPDATE customers SET password_hash=?,failed_login_attempts=0,locked_until=NULL,updated_at=? WHERE id=?").bind(passwordHash,now,id).run();
    try{
      await env.DB.batch([
      env.DB.prepare("DELETE FROM customer_sessions WHERE customer_id=?").bind(id),
      env.DB.prepare("INSERT INTO audit_events (id,actor_id,actor_email,action,resource_type,resource_id,details,created_at) VALUES (?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(),auth.identity.userId,auth.identity.email,"customer.password.reset","customer",id,JSON.stringify({customer:customer.fullName,email:customer.email,method:"administrator reset"}),now)
      ]);
    }catch{
      // Reset succeeds even if session cleanup or audit logging is temporarily unavailable.
    }
    return Response.json({ok:true});
  }catch(error){
    const reason=error instanceof Error?error.message:"Unknown error";
    console.error("Customer password reset failed",reason);
    return Response.json({error:`Password reset failed: ${reason}`},{status:500});
  }
}
