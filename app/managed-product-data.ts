import { env } from "cloudflare:workers";
import { getBallBearingProduct } from "./ball-bearing-products";

export type BallBearingRecord = readonly [string, string, number, number, number];

export async function getManagedBallBearingProduct(number: string): Promise<BallBearingRecord | undefined> {
  try {
    const record = await env.DB.prepare(`SELECT p.bearing_number AS bearingNumber,p.product_type AS productType,p.bore_diameter AS bore,p.outside_diameter AS outerDiameter,p.width FROM products p JOIN categories c ON c.id=p.category_id WHERE p.bearing_number=? AND c.slug='ball-bearings' AND p.status='published' LIMIT 1`).bind(number).first<{ bearingNumber:string; productType:string; bore:number|null; outerDiameter:number|null; width:number|null }>();
    if (record && record.bore != null && record.outerDiameter != null && record.width != null) return [record.bearingNumber, record.productType, record.bore, record.outerDiameter, record.width];
  } catch {
    // The static catalogue remains the safe fallback before the D1 migration is applied.
  }
  return getBallBearingProduct(number);
}
