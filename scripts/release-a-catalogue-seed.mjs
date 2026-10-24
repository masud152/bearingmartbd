import { createPool } from "mysql2/promise";

const apply = process.argv.includes("--apply");
const required = (name) => { const value = process.env[name]; if (!value) throw new Error(`${name} is required.`); return value; };
if (apply && process.env.APP_ENV === "production" && process.env.RELEASE_A_PRODUCTION_CONFIRM !== "apply-release-a-catalogue") throw new Error("Production application requires RELEASE_A_PRODUCTION_CONFIRM=apply-release-a-catalogue.");

const category = { id: "catalogue-ball-bearings", slug: "ball-bearings", name: "Ball Bearings", description: "Verified ball-bearing catalogue records.", status: "active" };
const brands = [
  ["catalogue-brand-skf", "SKF", "skf"], ["catalogue-brand-nsk", "NSK", "nsk"], ["catalogue-brand-ntn", "NTN", "ntn"], ["catalogue-brand-koyo-jtekt", "KOYO/JTEKT", "koyo-jtekt"], ["catalogue-brand-timken", "TIMKEN", "timken"], ["catalogue-brand-nachi", "NACHI", "nachi"], ["catalogue-brand-fag", "FAG", "fag"], ["catalogue-brand-ina", "INA", "ina"], ["catalogue-brand-iko", "IKO", "iko"],
].map(([id, name, slug]) => ({ id, name, slug }));
const pool = createPool({ host: required("DB_HOST"), port: Number(process.env.DB_PORT || 3306), user: required("DB_USER"), password: required("DB_PASSWORD"), database: required("DB_NAME"), charset: "utf8mb4" });

function sameCategory(row) { return row.id === category.id && row.name === category.name && row.status === category.status; }
function sameBrand(row, expected) { return row.id === expected.id && row.name === expected.name && row.status === "active"; }

const client = await pool.getConnection();
try {
  const [[existingCategory]] = await client.query("SELECT id,name,status FROM categories WHERE slug=?", [category.slug]);
  if (existingCategory && !sameCategory(existingCategory)) throw new Error(`Category ${category.slug} exists with an incompatible identity or status.`);
  const existingBrands = new Map();
  for (const brand of brands) {
    const [[row]] = await client.query("SELECT id,name,status FROM brands WHERE slug=?", [brand.slug]);
    if (row && !sameBrand(row, brand)) throw new Error(`Brand ${brand.slug} exists with an incompatible identity or status.`);
    existingBrands.set(brand.slug, row);
  }
  const plan = { database: process.env.DB_NAME, apply, category: existingCategory ? "unchanged" : "insert", brands: brands.filter((brand) => !existingBrands.get(brand.slug)).map((brand) => brand.slug), productRecords: 0, publishedProducts: 0 };
  console.log(JSON.stringify(plan, null, 2));
  if (!apply) process.exitCode = 0;
  else {
    const now = new Date().toISOString();
    await client.beginTransaction();
    if (!existingCategory) await client.execute("INSERT INTO categories (id,parent_id,name,slug,description,status,sort_order,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)", [category.id, null, category.name, category.slug, category.description, category.status, 0, now, now]);
    for (const brand of brands) if (!existingBrands.get(brand.slug)) await client.execute("INSERT INTO brands (id,name,slug,description,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?)", [brand.id, brand.name, brand.slug, `${brand.name} reference manufacturer.`, "active", now, now]);
    await client.commit();
    console.log("Release A reference data is verified; no products were created or published.");
  }
} catch (error) { await client.rollback(); throw error; } finally { client.release(); await pool.end(); }
