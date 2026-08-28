import { env } from "cloudflare:workers";

export async function GET(_request:Request,{params}:{params:Promise<{key:string}>}){
  const {key}=await params; if(!/^[a-f0-9-]+\.(jpg|png|webp)$/.test(key))return new Response("Not found",{status:404});
  const bucket=(env as unknown as {PRODUCT_IMAGES:R2Bucket}).PRODUCT_IMAGES; const object=await bucket.get(key);
  if(!object)return new Response("Not found",{status:404});
  const headers=new Headers(); object.writeHttpMetadata(headers); headers.set("etag",object.httpEtag); headers.set("cache-control","public, max-age=31536000, immutable");
  return new Response(object.body,{headers});
}
