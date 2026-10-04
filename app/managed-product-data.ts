import { env } from "@/lib/server/runtime";
import { ballBearingProducts } from "./ball-bearing-products";
import { normalizeDesignation } from "./bearing-designation";

export type BallBearingRecord = { bearingNumber: string; basicModel: string; manufacturerDesignation: string; normalizedDesignation: string; productType: string; series?: string; bore: number; outerDiameter: number; width: number; imageKey?: string; brand: string; slug: string; stockStatus: "in_stock" | "available_on_order" | "confirm_availability"; sealShield?: string; clearance?: string; cage?: string; dynamicLoadValue?: number; dynamicLoadUnit?: string; staticLoadValue?: number; staticLoadUnit?: string; speedRpm?: number; speedNote?: string; sourceUrl?: string; sourceTitle?: string; sourceVerifiedAt?: string; status?: string };

const availability = (value: string | null): BallBearingRecord["stockStatus"] => value === "in_stock" || value === "available_on_order" ? value : "confirm_availability";
const identity = (product: Pick<BallBearingRecord, "brand" | "basicModel" | "normalizedDesignation">) => `${product.brand.toUpperCase()}|${product.basicModel.toUpperCase()}|${product.normalizedDesignation}`;
const fallback = () => ballBearingProducts.map(([bearingNumber, productType, bore, outerDiameter, width]) => ({ bearingNumber, basicModel: bearingNumber, manufacturerDesignation: bearingNumber, normalizedDesignation: normalizeDesignation(bearingNumber), productType, bore, outerDiameter, width, brand: "NSK", slug: bearingNumber, stockStatus: "confirm_availability" as const }));

type DbRecord = { slug: string; bearingNumber: string; basicModel: string | null; manufacturerDesignation: string | null; normalizedDesignation: string | null; productType: string; series: string | null; bore: number | null; outerDiameter: number | null; width: number | null; imageKey: string | null; stockStatus: string | null; brand: string | null; sealShield: string | null; clearance: string | null; cage: string | null; dynamicLoadValue: number | null; dynamicLoadUnit: string | null; staticLoadValue: number | null; staticLoadUnit: string | null; speedRpm: number | null; speedNote: string | null; sourceUrl: string | null; sourceTitle: string | null; sourceVerifiedAt: string | null; status: string | null };

const fromDb = (record: DbRecord): BallBearingRecord | undefined => record.bore == null || record.outerDiameter == null || record.width == null || !record.manufacturerDesignation || !record.basicModel || !record.normalizedDesignation ? undefined : { bearingNumber: record.manufacturerDesignation, basicModel: record.basicModel, manufacturerDesignation: record.manufacturerDesignation, normalizedDesignation: record.normalizedDesignation, productType: record.productType, series: record.series ?? undefined, bore: record.bore, outerDiameter: record.outerDiameter, width: record.width, imageKey: record.imageKey ?? undefined, brand: record.brand ?? "NSK", slug: record.slug, stockStatus: availability(record.stockStatus), sealShield: record.sealShield ?? undefined, clearance: record.clearance ?? undefined, cage: record.cage ?? undefined, dynamicLoadValue: record.dynamicLoadValue ?? undefined, dynamicLoadUnit: record.dynamicLoadUnit ?? undefined, staticLoadValue: record.staticLoadValue ?? undefined, staticLoadUnit: record.staticLoadUnit ?? undefined, speedRpm: record.speedRpm ?? undefined, speedNote: record.speedNote ?? undefined, sourceUrl: record.sourceUrl ?? undefined, sourceTitle: record.sourceTitle ?? undefined, sourceVerifiedAt: record.sourceVerifiedAt ?? undefined, status: record.status ?? undefined };

export async function getManagedBallBearingProducts(): Promise<readonly BallBearingRecord[]> {
  const staticProducts = fallback();
  try {
    const result = await env.DB.prepare(`SELECT p.slug,p.bearing_number AS bearingNumber,p.basic_model AS basicModel,p.manufacturer_designation AS manufacturerDesignation,p.normalized_manufacturer_designation AS normalizedDesignation,p.product_type AS productType,p.series,p.bore_diameter AS bore,p.outside_diameter AS outerDiameter,p.width,p.image_key AS imageKey,p.stock_status AS stockStatus,p.seal_shield AS sealShield,p.clearance,p.cage,p.dynamic_load_value AS dynamicLoadValue,p.dynamic_load_unit AS dynamicLoadUnit,p.static_load_value AS staticLoadValue,p.static_load_unit AS staticLoadUnit,p.speed_rpm AS speedRpm,p.speed_note AS speedNote,p.source_url AS sourceUrl,p.source_title AS sourceTitle,p.source_verified_at AS sourceVerifiedAt,p.status,b.name AS brand FROM products p JOIN categories c ON c.id=p.category_id LEFT JOIN brands b ON b.id=p.brand_id WHERE c.slug='ball-bearings' AND p.status='published' AND p.data_verification_status='verified' ORDER BY p.sort_order,p.manufacturer_designation,p.bearing_number`).all<DbRecord>();
    const managed = result.results.map(fromDb).filter((product): product is BallBearingRecord => Boolean(product));
    const managedKeys = new Set(managed.map(identity));
    return [...managed, ...staticProducts.filter(product => !managedKeys.has(identity(product)))];
  } catch { return staticProducts; }
}

export async function getManagedBallBearingProduct(slug: string): Promise<BallBearingRecord | undefined> {
  const products = await getManagedBallBearingProducts();
  const normalized = normalizeDesignation(slug);
  return products.find(product => product.slug === slug) || products.find(product => product.brand === "NSK" && product.manufacturerDesignation === slug) || products.find(product => product.brand === "NSK" && product.normalizedDesignation === normalized);
}
