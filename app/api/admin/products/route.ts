import { env } from "@/lib/server/runtime";
import { authorizeApi } from "../../../admin/_lib/auth";

const statuses=new Set(["draft","published","archived"]),stocks=new Set(["confirm_availability","in_stock","limited_stock","available_on_order","sourcing_available","out_of_stock","discontinued"]);
const clean=(value:unknown,max=300)=>typeof value==="string"?value.trim().slice(0,max):"";
const number=(value:unknown)=>value===""||value==null?null:Number.isFinite(Number(value))&&Number(value)>=0?Number(value):null;
const slug=(value:string)=>value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,120);
const normalize=(value:string)=>value.toUpperCase().replace(/[^A-Z0-9]/g,"");
const validSource=(value:string)=>{try{return !value||new URL(value).protocol==="https:";}catch{return false;}};

export async function POST(request:Request){
 const auth=await authorizeApi("products.create");if("response" in auth)return auth.response;
 let body:Record<string,unknown>;try{body=await request.json()}catch{return Response.json({error:"Invalid request body."},{status:400});}
 const name=clean(body.name,180),designation=clean(body.manufacturerDesignation,120),basicModel=clean(body.basicModel,80),productType=clean(body.productType,120),categorySlug=slug(clean(body.categorySlug,120)),brandSlug=slug(clean(body.brandSlug,120)),imageKey=clean(body.imageKey,120),sourceUrl=clean(body.sourceUrl,2048);
 if(!name||!designation||!basicModel||!productType||!categorySlug||!brandSlug)return Response.json({error:"Name, brand, basic model, manufacturer designation, product type and category are required."},{status:400});
 if(imageKey&&!/^[a-f0-9-]+\.(jpg|png|webp)$/.test(imageKey))return Response.json({error:"Invalid product image reference."},{status:400});
 if(!validSource(sourceUrl))return Response.json({error:"Manufacturer source must be a valid HTTPS URL."},{status:400});
 const bore=number(body.boreDiameter),outside=number(body.outsideDiameter),width=number(body.width),status=statuses.has(String(body.status))?String(body.status):"draft";
 if(status==="published"&&!auth.identity.permissions.has("*")&&!auth.identity.permissions.has("products.publish"))return Response.json({error:"Publishing permission is required."},{status:403});
 const category=await env.DB.prepare("SELECT id FROM categories WHERE slug=? AND status='active'").bind(categorySlug).first<{id:string}>(),brand=await env.DB.prepare("SELECT id,name FROM brands WHERE slug=? AND status='active'").bind(brandSlug).first<{id:string;name:string}>();
 if(!category||!brand)return Response.json({error:"The selected category or brand does not exist."},{status:400});
 if(categorySlug==="ball-bearings"&&(bore==null||outside==null||width==null||!sourceUrl||!clean(body.sourceTitle,255)))return Response.json({error:"Ball Bearings require dimensions, source URL and source title."},{status:400});
 for(const unit of [clean(body.dynamicLoadUnit,12),clean(body.staticLoadUnit,12)])if(unit&&unit!=="N")return Response.json({error:"Load values must use canonical N units."},{status:400});
 const last=await env.DB.prepare("SELECT COALESCE(MAX(sort_order),0) AS value FROM products").first<{value:number}>(),requested=number(body.sortOrder),sortOrder=requested&&requested>=1?requested:(last?.value??0)+1,now=new Date().toISOString(),id=crypto.randomUUID(),productSlug=slug(`${brandSlug}-${designation}`),sku=clean(body.sku,80)||`${brand.name.replace(/[^a-z0-9]/gi,"").toUpperCase()}-${designation.toUpperCase()}`;
 try{await env.DB.batch([
  env.DB.prepare(`INSERT INTO products (id,name,slug,bearing_number,sku,mpn,category_id,brand_id,product_type,short_description,image_key,bore_diameter,outside_diameter,width,stock_status,status,sort_order,seo_title,meta_description,version,created_by,updated_by,created_at,updated_at,published_at,series,basic_model,manufacturer_designation,normalized_manufacturer_designation,seal_shield,clearance,cage,dynamic_load_value,dynamic_load_unit,static_load_value,static_load_unit,speed_rpm,speed_note,source_url,source_title,source_verified_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,name,productSlug,designation,sku,designation,category.id,brand.id,productType,clean(body.shortDescription,800)||null,imageKey||null,bore,outside,width,stocks.has(String(body.stockStatus))?String(body.stockStatus):"confirm_availability",status,sortOrder,clean(body.seoTitle,180)||null,clean(body.metaDescription,320)||null,auth.identity.userId,auth.identity.userId,now,now,status==="published"?now:null,clean(body.series,120)||null,basicModel,designation,normalize(designation),clean(body.sealShield,255)||null,clean(body.clearance,120)||null,clean(body.cage,255)||null,number(body.dynamicLoadValue),clean(body.dynamicLoadUnit,12)||null,number(body.staticLoadValue),clean(body.staticLoadUnit,12)||null,number(body.speedRpm),clean(body.speedNote,255)||null,sourceUrl||null,clean(body.sourceTitle,255)||null,clean(body.sourceVerifiedAt,40)||null),
  env.DB.prepare("INSERT INTO audit_events (id,actor_id,actor_email,action,resource_type,resource_id,details,created_at) VALUES (?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(),auth.identity.userId,auth.identity.email,"product.create","product",id,JSON.stringify({name,designation,status,sortOrder,hasImage:Boolean(imageKey)}),now)
 ]);return Response.json({id,status,sortOrder},{status:201});}catch(error){return Response.json({error:error instanceof Error&&error.message.includes("UNIQUE")?"A product with this manufacturer designation or SKU already exists for the selected brand.":"Unable to create the product."},{status:400});}
}
