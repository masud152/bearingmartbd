import { env } from "cloudflare:workers";

export type AdminProduct = {
  id: string; name: string; slug: string; bearingNumber: string; sku: string | null;
  productType: string; categoryName: string; brandName: string | null; status: string;
  stockStatus: string; boreDiameter: number | null; outsideDiameter: number | null;
  width: number | null; sortOrder: number; updatedAt: string; version: number;
};

export async function listProducts(query = "") {
  const pattern = `%${query.trim()}%`;
  const result = await env.DB.prepare(`SELECT p.id,p.name,p.slug,p.bearing_number AS bearingNumber,p.sku,p.product_type AS productType,c.name AS categoryName,b.name AS brandName,p.status,p.stock_status AS stockStatus,p.bore_diameter AS boreDiameter,p.outside_diameter AS outsideDiameter,p.width,p.sort_order AS sortOrder,p.updated_at AS updatedAt,p.version FROM products p JOIN categories c ON c.id=p.category_id LEFT JOIN brands b ON b.id=p.brand_id WHERE (?='' OR p.name LIKE ? OR p.bearing_number LIKE ? OR p.sku LIKE ?) ORDER BY p.sort_order,p.bearing_number LIMIT 100`).bind(query.trim(), pattern, pattern, pattern).all<AdminProduct>();
  return result.results;
}

export async function productFormOptions() {
  const [categories, brands] = await Promise.all([
    env.DB.prepare("SELECT slug,name FROM categories WHERE status='active' ORDER BY sort_order,name").all<{slug:string;name:string}>(),
    env.DB.prepare("SELECT slug,name FROM brands WHERE status='active' ORDER BY name").all<{slug:string;name:string}>(),
  ]);
  return { categories: categories.results, brands: brands.results };
}

export async function dashboardStats() {
  const [products, published, draft, users, audit] = await Promise.all([
    env.DB.prepare("SELECT count(*) AS count FROM products WHERE status != 'archived'").first<{count:number}>(),
    env.DB.prepare("SELECT count(*) AS count FROM products WHERE status = 'published'").first<{count:number}>(),
    env.DB.prepare("SELECT count(*) AS count FROM products WHERE status = 'draft'").first<{count:number}>(),
    env.DB.prepare("SELECT count(*) AS count FROM admin_users WHERE status = 'active'").first<{count:number}>(),
    env.DB.prepare("SELECT action,resource_type AS resourceType,actor_email AS actorEmail,created_at AS createdAt FROM audit_events ORDER BY created_at DESC LIMIT 8").all<{action:string;resourceType:string;actorEmail:string;createdAt:string}>(),
  ]);
  return { products: products?.count ?? 0, published: published?.count ?? 0, draft: draft?.count ?? 0, users: users?.count ?? 0, audit: audit.results };
}

export async function listUsers() {
  const result = await env.DB.prepare(`SELECT u.id,u.email,u.display_name AS displayName,u.status,u.updated_at AS updatedAt,group_concat(r.name, ', ') AS roles FROM admin_users u LEFT JOIN user_roles ur ON ur.user_id=u.id LEFT JOIN roles r ON r.id=ur.role_id GROUP BY u.id ORDER BY u.email`).all<{id:string;email:string;displayName:string|null;status:string;updatedAt:string;roles:string|null}>();
  return result.results;
}

export async function listRoles() {
  const result = await env.DB.prepare(`SELECT r.id,r.name,r.description,r.is_system AS isSystem,count(DISTINCT ur.user_id) AS userCount,group_concat(rp.permission_key, ',') AS permissions FROM roles r LEFT JOIN user_roles ur ON ur.role_id=r.id LEFT JOIN role_permissions rp ON rp.role_id=r.id GROUP BY r.id ORDER BY r.name`).all<{id:string;name:string;description:string|null;isSystem:number;userCount:number;permissions:string|null}>();
  return result.results;
}

export async function listAudit() {
  const result = await env.DB.prepare("SELECT id,actor_email AS actorEmail,action,resource_type AS resourceType,resource_id AS resourceId,details,created_at AS createdAt FROM audit_events ORDER BY created_at DESC LIMIT 100").all<{id:string;actorEmail:string;action:string;resourceType:string;resourceId:string|null;details:string|null;createdAt:string}>();
  return result.results;
}
