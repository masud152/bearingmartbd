import { env } from "@/lib/server/runtime";
import { authorizeApi } from "../../../../admin/_lib/auth";

const statuses=new Set(["draft","published","archived"]),stocks=new Set(["confirm_availability","in_stock","limited_stock","available_on_order","sourcing_available","out_of_stock","discontinued"]);
const clean=(value:unknown,max=300)=>typeof value==="string"?value.trim().slice(0,max):"";
const number=(value:unknown)=>value===""||value==null?null:Number.isFinite(Number(value))&&Number(value)>=0?Number(value):null;
const normalize=(value:string)=>value.toUpperCase().replace(/[^A-Z0-9]/g,"");
const validSource=(value:string)=>{try{return !value||new URL(value).protocol==="https:";}catch{return false;}};

export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}){
 const auth=await authorizeApi("products.update");if("response" in auth)return auth.response;
 const {id}=await params;let body:Record<string,unknown>;try{body=await request.json()}catch{return Response.json({error:"Invalid request body."},{status:400});}
 const status=statuses.has(String(body.status))?String(body.status):"draft",imageKey=clean(body.imageKey,120),sourceUrl=clean(body.sourceUrl,2048);
 if(imageKey&&!/^[a-f0-9-]+\.(jpg|png|webp)$/.test(imageKey))return Response.json({error:"Invalid product image reference."},{status:400});
 if(!validSource(sourceUrl))return Response.json({error:"Manufacturer source must be a valid HTTPS URL."},{status:400});
 if(status==="published"&&!auth.identity.permissions.has("*")&&!auth.identity.permissions.has("products.publish"))return Response.json({error:"Publishing permission is required."},{status:403});
 const category=await env.DB.prepare("SELECT id,slug FROM categories WHERE slug=?").bind(clean(body.categorySlug,120)).first<{id:string;slug:string}>(),brand=clean(body.brandSlug,120)?await env.DB.prepare("SELECT id FROM brands WHERE slug=?").bind(clean(body.brandSlug,120)).first<{id:string}>():null;
 if(!category)return Response.json({error:"The selected category does not exist."},{status:400});
 const current=await env.DB.prepare("SELECT version,status,name,sort_order AS sortOrder FROM products WHERE id=?").bind(id).first<{version:number;status:string;name:string;sortOrder:number}>();
 if(!current)return Response.json({error:"Product not found."},{status:404});if(Number(body.version)!==current.version)return Response.json({error:"This product was changed by another editor. Refresh before saving."},{status:409});
 const now=new Date().toISOString(),name=clean(body.name,180),designation=clean(body.manufacturerDesignation,120),basicModel=clean(body.basicModel,80),type=clean(body.productType,120),sortOrder=number(body.sortOrder)??current.sortOrder,bore=number(body.boreDiameter),outside=number(body.outsideDiameter),width=number(body.width);
 if(!name||!designation||!basicModel||!type)return Response.json({error:"Name, basic model, manufacturer designation and product type are required."},{status:400});
 if(category.slug==="ball-bearings"&&(bore==null||outside==null||width==null||!sourceUrl||!clean(body.sourceTitle,255)))return Response.json({error:"Ball Bearings require dimensions, source URL and source title."},{status:400});
 for(const unit of [clean(body.dynamicLoadUnit,12),clean(body.staticLoadUnit,12)])if(unit&&unit!=="N")return Response.json({error:"Load values must use canonical N units."},{status:400});
 try{await env.DB.batch([
  env.DB.prepare(`UPDATE products SET name=?,bearing_number=?,sku=?,mpn=?,category_id=?,brand_id=?,product_type=?,short_description=?,image_key=?,bore_diameter=?,outside_diameter=?,width=?,stock_status=?,status=?,sort_order=?,seo_title=?,meta_description=?,series=?,basic_model=?,manufacturer_designation=?,normalized_manufacturer_designation=?,seal_shield=?,clearance=?,cage=?,dynamic_load_value=?,dynamic_load_unit=?,static_load_value=?,static_load_unit=?,speed_rpm=?,speed_note=?,source_url=?,source_title=?,source_verified_at=?,version=version+1,updated_by=?,updated_at=?,published_at=CASE WHEN ?='published' AND published_at IS NULL THEN ? ELSE published_at END WHERE id=? AND version=?`).bind(name,designation,clean(body.sku,80)||null,designation,category.id,brand?.id??null,type,clean(body.shortDescription,800)||null,imageKey||null,bore,outside,width,stocks.has(String(body.stockStatus))?String(body.stockStatus):"confirm_availability",status,sortOrder,clean(body.seoTitle,180)||null,clean(body.metaDescription,320)||null,clean(body.series,120)||null,basicModel,designation,normalize(designation),clean(body.sealShield,255)||null,clean(body.clearance,120)||null,clean(body.cage,255)||null,number(body.dynamicLoadValue),clean(body.dynamicLoadUnit,12)||null,number(body.staticLoadValue),clean(body.staticLoadUnit,12)||null,number(body.speedRpm),clean(body.speedNote,255)||null,sourceUrl||null,clean(body.sourceTitle,255)||null,clean(body.sourceVerifiedAt,40)||null,auth.identity.userId,now,status,now,id,current.version),
  env.DB.prepare("INSERT INTO audit_events (id,actor_id,actor_email,action,resource_type,resource_id,details,created_at) VALUES (?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(),auth.identity.userId,auth.identity.email,"product.update","product",id,JSON.stringify({fromStatus:current.status,toStatus:status,previousName:current.name,name,designation,sortOrder,hasImage:Boolean(imageKey)}),now)
 ]);return Response.json({id,version:current.version+1});}catch(error){return Response.json({error:error instanceof Error&&error.message.includes("UNIQUE")?"A product with this manufacturer designation or SKU already exists for the selected brand.":"Unable to update the product."},{status:400});}
}

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 const auth=await authorizeApi("products.update"); if("response" in auth)return auth.response;
 const {id}=await params; let body:Record<string,unknown>;
 try{body=await request.json()}catch{return Response.json({error:"Invalid request body."},{status:400})}
 const current=await env.DB.prepare("SELECT version,status,name,sort_order AS sortOrder FROM products WHERE id=?").bind(id).first<{version:number;status:string;name:string;sortOrder:number}>();
 if(!current)return Response.json({error:"Product not found."},{status:404});
 if("sortOrder" in body){
   const sortOrder=Number(body.sortOrder); if(!Number.isInteger(sortOrder)||sortOrder<1||sortOrder>9999)return Response.json({error:"Website order must be a whole number between 1 and 9999."},{status:400});
   const now=new Date().toISOString(); await env.DB.batch([env.DB.prepare("UPDATE products SET sort_order=?,version=version+1,updated_by=?,updated_at=? WHERE id=?").bind(sortOrder,auth.identity.userId,now,id),env.DB.prepare("INSERT INTO audit_events (id,actor_id,actor_email,action,resource_type,resource_id,details,created_at) VALUES (?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(),auth.identity.userId,auth.identity.email,"product.reorder","product",id,JSON.stringify({name:current.name,from:current.sortOrder,to:sortOrder}),now)]);
   return Response.json({id,sortOrder,version:current.version+1});
 }
 const status=String(body.status); if(status!=="draft"&&status!=="published")return Response.json({error:"Visibility status must be draft or published."},{status:400});
 if(status==="published"&&!auth.identity.permissions.has("*")&&!auth.identity.permissions.has("products.publish"))return Response.json({error:"Publishing permission is required."},{status:403});
 const now=new Date().toISOString(); await env.DB.prepare("UPDATE products SET status=?,version=version+1,updated_by=?,updated_at=?,published_at=CASE WHEN ?='published' AND published_at IS NULL THEN ? ELSE published_at END WHERE id=?").bind(status,auth.identity.userId,now,status,now,id).run();
 await env.DB.prepare("INSERT INTO audit_events (id,actor_id,actor_email,action,resource_type,resource_id,details,created_at) VALUES (?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(),auth.identity.userId,auth.identity.email,status==="published"?"product.unhide":"product.hide","product",id,JSON.stringify({name:current.name,fromStatus:current.status,toStatus:status}),now).run();
 return Response.json({id,status,version:current.version+1});
}
