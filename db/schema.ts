import { integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const siteStats = sqliteTable("site_stats", {
  key: text("key").primaryKey(),
  value: integer("value").notNull().default(0),
});

export const adminUsers = sqliteTable("admin_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  status: text("status", { enum: ["active", "disabled"] }).notNull().default("active"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const roles = sqliteTable("roles", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isSystem: integer("is_system", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const permissions = sqliteTable("permissions", {
  key: text("key").primaryKey(),
  description: text("description").notNull(),
});

export const userRoles = sqliteTable("user_roles", {
  userId: text("user_id").notNull().references(() => adminUsers.id, { onDelete: "cascade" }),
  roleId: text("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
}, (table) => [primaryKey({ columns: [table.userId, table.roleId] })]);

export const rolePermissions = sqliteTable("role_permissions", {
  roleId: text("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  permissionKey: text("permission_key").notNull().references(() => permissions.key, { onDelete: "cascade" }),
}, (table) => [primaryKey({ columns: [table.roleId, table.permissionKey] })]);

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  parentId: text("parent_id"),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  status: text("status", { enum: ["active", "archived"] }).notNull().default("active"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const brands = sqliteTable("brands", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  status: text("status", { enum: ["active", "archived"] }).notNull().default("active"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  bearingNumber: text("bearing_number").notNull(),
  sku: text("sku"),
  mpn: text("mpn"),
  categoryId: text("category_id").notNull().references(() => categories.id),
  brandId: text("brand_id").references(() => brands.id),
  productType: text("product_type").notNull(),
  shortDescription: text("short_description"),
  description: text("description"),
  imageKey: text("image_key"),
  boreDiameter: integer("bore_diameter"),
  outsideDiameter: integer("outside_diameter"),
  width: integer("width"),
  dimensionUnit: text("dimension_unit").notNull().default("mm"),
  priceMinor: integer("price_minor"),
  currency: text("currency").notNull().default("BDT"),
  priceVisibility: text("price_visibility", { enum: ["public", "request"] }).notNull().default("request"),
  stockStatus: text("stock_status").notNull().default("confirm_availability"),
  leadTimeText: text("lead_time_text"),
  status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
  sortOrder: integer("sort_order").notNull().default(0),
  seoTitle: text("seo_title"),
  metaDescription: text("meta_description"),
  version: integer("version").notNull().default(1),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  publishedAt: text("published_at"),
}, (table) => [
  uniqueIndex("products_category_slug_unique").on(table.categoryId, table.slug),
  uniqueIndex("products_sku_unique").on(table.sku),
]);

export const productSpecifications = sqliteTable("product_specifications", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  label: text("label").notNull(),
  value: text("value").notNull(),
  unit: text("unit"),
  sortOrder: integer("sort_order").notNull().default(0),
}, (table) => [uniqueIndex("product_spec_key_unique").on(table.productId, table.key)]);

export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedBy: text("updated_by"),
  updatedAt: text("updated_at").notNull(),
});

export const customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  customerType: text("customer_type", { enum: ["retail", "business"] }).notNull(),
  fullName: text("full_name").notNull(),
  companyName: text("company_name"),
  responsiblePersonName: text("responsible_person_name"),
  mobile: text("mobile").notNull(),
  email: text("email").notNull(),
  address: text("address").notNull(),
  photoKey: text("photo_key"),
  documentKey: text("document_key").notNull(),
  documentType: text("document_type", { enum: ["nid", "trade_license"] }).notNull(),
  status: text("status", { enum: ["pending_review", "verified", "rejected", "suspended"] }).notNull().default("pending_review"),
  consentAt: text("consent_at").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  passwordHash: text("password_hash"),
  failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
  lockedUntil: text("locked_until"),
});

export const customerSessions = sqliteTable("customer_sessions", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export const auditEvents = sqliteTable("audit_events", {
  id: text("id").primaryKey(),
  actorId: text("actor_id"),
  actorEmail: text("actor_email").notNull(),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id"),
  details: text("details"),
  createdAt: text("created_at").notNull(),
});
