import { env } from "@/lib/server/runtime";
import { getAdminIdentity } from "../../../admin/_lib/auth";

const allowedTypes = new Map([["image/jpeg","jpg"],["image/png","png"],["image/webp","webp"]]);

export async function POST(request:Request){
  const identity=await getAdminIdentity();
  if(!identity||(!identity.permissions.has("*")&&!identity.permissions.has("products.create")&&!identity.permissions.has("products.update")))return Response.json({error:"Product editing access is required."},{status:403});
  const form=await request.formData(); const file=form.get("image");
  if(!(file instanceof File))return Response.json({error:"Select an image to upload."},{status:400});
  const extension=allowedTypes.get(file.type); if(!extension)return Response.json({error:"Use a JPG, PNG or WebP image."},{status:400});
  if(file.size>5*1024*1024)return Response.json({error:"The image must be 5 MB or smaller."},{status:400});
  // Keep keys flat: the public product-image route has a single dynamic segment,
  // and existing catalogue records use this same key format.
  const key=`${crypto.randomUUID()}.${extension}`; const bucket=env.PRODUCT_IMAGES;
  await bucket.put(key,file.stream(),{httpMetadata:{contentType:file.type}});
  return Response.json({key,url:`/api/product-images/${key}`},{status:201});
}
