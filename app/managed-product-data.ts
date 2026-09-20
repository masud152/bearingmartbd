import { env } from "cloudflare:workers";
import { ballBearingProducts } from "./ball-bearing-products";

export type BallBearingRecord = { bearingNumber:string; productType:string; bore:number; outerDiameter:number; width:number; imageKey?:string; brand:string; slug:string; stockStatus:"in_stock"|"available_on_order"|"confirm_availability" };
const availability = (value:string|null):BallBearingRecord["stockStatus"] => value === "in_stock" || value === "available_on_order" ? value : "confirm_availability";

export async function getManagedBallBearingProducts(): Promise<readonly BallBearingRecord[]> {
  try {
    const result = await env.DB.prepare(`SELECT p.slug,p.bearing_number AS bearingNumber,p.product_type AS productType,p.bore_diameter AS bore,p.outside_diameter AS outerDiameter,p.width,p.image_key AS imageKey,p.stock_status AS stockStatus,b.name AS brand FROM products p JOIN categories c ON c.id=p.category_id LEFT JOIN brands b ON b.id=p.brand_id WHERE c.slug='ball-bearings' AND p.status='published' ORDER BY p.sort_order,p.bearing_number`).all<{slug:string;bearingNumber:string;productType:string;bore:number|null;outerDiameter:number|null;width:number|null;imageKey:string|null;stockStatus:string|null;brand:string|null}>();
    return result.results.filter(record => record.bore != null && record.outerDiameter != null && record.width != null).map(record => ({ bearingNumber:record.bearingNumber,productType:record.productType,bore:record.bore!,outerDiameter:record.outerDiameter!,width:record.width!,imageKey:record.imageKey??undefined,brand:record.brand??"NSK",slug:record.slug,stockStatus:availability(record.stockStatus) }));
  } catch {
    return ballBearingProducts.map(([bearingNumber,productType,bore,outerDiameter,width]) => ({ bearingNumber,productType,bore,outerDiameter,width,brand:"NSK",slug:bearingNumber,stockStatus:"confirm_availability" as const }));
  }
}

export async function getManagedBallBearingProduct(slug:string): Promise<BallBearingRecord|undefined> {
  const products = await getManagedBallBearingProducts();
  return products.find(product => product.slug === slug) ?? products.find(product => product.brand === "NSK" && product.bearingNumber === slug);
}
