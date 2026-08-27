PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS admin_users (id TEXT PRIMARY KEY NOT NULL, email TEXT NOT NULL UNIQUE, display_name TEXT, status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS roles (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL UNIQUE, description TEXT, is_system INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS permissions (key TEXT PRIMARY KEY NOT NULL, description TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS user_roles (user_id TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE, role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE, PRIMARY KEY(user_id, role_id));
CREATE TABLE IF NOT EXISTS role_permissions (role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE, permission_key TEXT NOT NULL REFERENCES permissions(key) ON DELETE CASCADE, PRIMARY KEY(role_id, permission_key));
CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY NOT NULL, parent_id TEXT, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT, status TEXT NOT NULL DEFAULT 'active', sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS brands (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT, status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, slug TEXT NOT NULL, bearing_number TEXT NOT NULL, sku TEXT UNIQUE, mpn TEXT, category_id TEXT NOT NULL REFERENCES categories(id), brand_id TEXT REFERENCES brands(id), product_type TEXT NOT NULL, short_description TEXT, description TEXT, bore_diameter INTEGER, outside_diameter INTEGER, width INTEGER, dimension_unit TEXT NOT NULL DEFAULT 'mm', price_minor INTEGER, currency TEXT NOT NULL DEFAULT 'BDT', price_visibility TEXT NOT NULL DEFAULT 'request', stock_status TEXT NOT NULL DEFAULT 'confirm_availability', lead_time_text TEXT, status TEXT NOT NULL DEFAULT 'draft', seo_title TEXT, meta_description TEXT, version INTEGER NOT NULL DEFAULT 1, created_by TEXT, updated_by TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, published_at TEXT);
CREATE UNIQUE INDEX IF NOT EXISTS products_category_slug_unique ON products(category_id, slug);
CREATE TABLE IF NOT EXISTS product_specifications (id TEXT PRIMARY KEY NOT NULL, product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE, key TEXT NOT NULL, label TEXT NOT NULL, value TEXT NOT NULL, unit TEXT, sort_order INTEGER NOT NULL DEFAULT 0);
CREATE UNIQUE INDEX IF NOT EXISTS product_spec_key_unique ON product_specifications(product_id, key);
CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL, updated_by TEXT, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS audit_events (id TEXT PRIMARY KEY NOT NULL, actor_id TEXT, actor_email TEXT NOT NULL, action TEXT NOT NULL, resource_type TEXT NOT NULL, resource_id TEXT, details TEXT, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS products_status_idx ON products(status);
CREATE INDEX IF NOT EXISTS products_number_idx ON products(bearing_number);
CREATE INDEX IF NOT EXISTS audit_created_idx ON audit_events(created_at DESC);

INSERT OR IGNORE INTO roles (id,name,description,is_system,created_at,updated_at) VALUES
('role_super_admin','Super Administrator','Full access to every admin capability',1,datetime('now'),datetime('now')),
('role_admin','Administrator','Catalogue, content, enquiries and administration',1,datetime('now'),datetime('now')),
('role_catalogue','Catalogue Manager','Product and catalogue management',1,datetime('now'),datetime('now')),
('role_content','Content & SEO Editor','Page content and SEO management',1,datetime('now'),datetime('now')),
('role_sales','Sales / Enquiry Manager','Enquiry management',1,datetime('now'),datetime('now')),
('role_viewer','Viewer / Auditor','Read-only access',1,datetime('now'),datetime('now'));

INSERT OR IGNORE INTO permissions (key,description) VALUES
('dashboard.view','View dashboard'),('products.view','View products'),('products.create','Create products'),('products.update','Update products'),('products.publish','Publish products'),('products.archive','Archive products'),('products.delete','Permanently delete products'),('products.import','Import products'),('products.export','Export products'),('categories.view','View categories'),('categories.update','Manage categories'),('brands.view','View brands'),('brands.update','Manage brands'),('pages.view','View pages'),('pages.update','Manage pages'),('pages.publish','Publish pages'),('seo.manage','Manage SEO and redirects'),('enquiries.view','View enquiries'),('enquiries.update','Manage enquiries'),('users.view','View users'),('users.create','Create users'),('users.update','Update users'),('users.disable','Disable users'),('roles.view','View roles'),('roles.update','Manage roles and permissions'),('roles.assign','Assign roles'),('audit.view','View audit log'),('settings.view','View settings'),('settings.update','Update settings');

INSERT OR IGNORE INTO role_permissions (role_id,permission_key) SELECT 'role_super_admin', key FROM permissions;
INSERT OR IGNORE INTO role_permissions (role_id,permission_key) SELECT 'role_admin', key FROM permissions WHERE key NOT IN ('products.delete','roles.update');
INSERT OR IGNORE INTO role_permissions (role_id,permission_key) SELECT 'role_catalogue', key FROM permissions WHERE key LIKE 'products.%' OR key IN ('dashboard.view','categories.view','categories.update','brands.view','brands.update');
INSERT OR IGNORE INTO role_permissions (role_id,permission_key) SELECT 'role_content', key FROM permissions WHERE key IN ('dashboard.view','pages.view','pages.update','pages.publish','seo.manage','products.view');
INSERT OR IGNORE INTO role_permissions (role_id,permission_key) SELECT 'role_sales', key FROM permissions WHERE key IN ('dashboard.view','enquiries.view','enquiries.update','products.view');
INSERT OR IGNORE INTO role_permissions (role_id,permission_key) SELECT 'role_viewer', key FROM permissions WHERE key IN ('dashboard.view','products.view','categories.view','brands.view','pages.view');

INSERT OR IGNORE INTO categories (id,name,slug,description,status,sort_order,created_at,updated_at) VALUES
('cat_ball','Ball Bearings','ball-bearings','Versatile bearing solutions for smooth, efficient rotation across industrial and machinery applications.','active',1,datetime('now'),datetime('now')),
('cat_roller','Roller Bearings','roller-bearings','Heavy-duty bearing solutions designed to support demanding radial and axial loads.','active',2,datetime('now'),datetime('now')),
('cat_pillow','Pillow Block Bearings','pillow-block-bearings','Easy-to-install mounted bearing units for dependable shaft support.','active',3,datetime('now'),datetime('now')),
('cat_linear','Linear Bearings','linear-bearings','Precision components for controlled, smooth linear movement.','active',4,datetime('now'),datetime('now')),
('cat_housing','Bearing Housings','bearing-housings','Strong housings that protect bearings and simplify installation.','active',5,datetime('now'),datetime('now')),
('cat_accessories','Industrial Accessories','industrial-accessories','Essential accessories to support bearing installation, maintenance, and machinery operations.','active',6,datetime('now'),datetime('now'));

INSERT OR IGNORE INTO brands (id,name,slug,status,created_at,updated_at) VALUES ('brand_nsk','NSK','nsk','active',datetime('now'),datetime('now'));

INSERT OR IGNORE INTO products (id,name,slug,bearing_number,sku,mpn,category_id,brand_id,product_type,bore_diameter,outside_diameter,width,stock_status,status,seo_title,meta_description,created_at,updated_at,published_at) VALUES
('prod_nsk_6000','NSK 6000 Deep Groove Ball Bearing','6000','6000','NSK-6000','6000','cat_ball','brand_nsk','Deep Groove Ball Bearing',10,26,8,'confirm_availability','published','NSK 6000 Bearing (10×26×8 mm) | Bearing Mart BD','Request a quotation for the NSK 6000 deep groove ball bearing, size 10×26×8 mm.',datetime('now'),datetime('now'),datetime('now')),
('prod_nsk_6200','NSK 6200 Deep Groove Ball Bearing','6200','6200','NSK-6200','6200','cat_ball','brand_nsk','Deep Groove Ball Bearing',10,30,9,'confirm_availability','published',NULL,NULL,datetime('now'),datetime('now'),datetime('now')),
('prod_nsk_6300','NSK 6300 Deep Groove Ball Bearing','6300','6300','NSK-6300','6300','cat_ball','brand_nsk','Deep Groove Ball Bearing',10,35,11,'confirm_availability','published',NULL,NULL,datetime('now'),datetime('now'),datetime('now')),
('prod_nsk_6403','NSK 6403 Deep Groove Ball Bearing','6403','6403','NSK-6403','6403','cat_ball','brand_nsk','Deep Groove Ball Bearing',17,62,17,'confirm_availability','published',NULL,NULL,datetime('now'),datetime('now'),datetime('now')),
('prod_nsk_6800','NSK 6800 Thin Section Ball Bearing','6800','6800','NSK-6800','6800','cat_ball','brand_nsk','Thin Section Ball Bearing',10,19,5,'confirm_availability','published',NULL,NULL,datetime('now'),datetime('now'),datetime('now')),
('prod_nsk_6900','NSK 6900 Thin Section Ball Bearing','6900','6900','NSK-6900','6900','cat_ball','brand_nsk','Thin Section Ball Bearing',10,22,6,'confirm_availability','published',NULL,NULL,datetime('now'),datetime('now'),datetime('now')),
('prod_nsk_16001','NSK 16001 Extra Thin Section Ball Bearing','16001','16001','NSK-16001','16001','cat_ball','brand_nsk','Extra Thin Section Ball Bearing',12,28,7,'confirm_availability','published',NULL,NULL,datetime('now'),datetime('now'),datetime('now')),
('prod_nsk_608','NSK 608 Miniature Ball Bearing','608','608','NSK-608','608','cat_ball','brand_nsk','Miniature Ball Bearing',8,22,7,'confirm_availability','published',NULL,NULL,datetime('now'),datetime('now'),datetime('now')),
('prod_nsk_4200','NSK 4200 Double Row Deep Groove Ball Bearing','4200','4200','NSK-4200','4200','cat_ball','brand_nsk','Double Row Deep Groove Ball Bearing',10,30,14,'confirm_availability','published',NULL,NULL,datetime('now'),datetime('now'),datetime('now')),
('prod_nsk_4300','NSK 4300 Double Row Deep Groove Ball Bearing','4300','4300','NSK-4300','4300','cat_ball','brand_nsk','Double Row Deep Groove Ball Bearing',10,35,17,'confirm_availability','published',NULL,NULL,datetime('now'),datetime('now'),datetime('now')),
('prod_nsk_7000','NSK 7000 Single Row Angular Contact Ball Bearing','7000','7000','NSK-7000','7000','cat_ball','brand_nsk','Single Row Angular Contact Ball Bearing',10,26,8,'confirm_availability','published',NULL,NULL,datetime('now'),datetime('now'),datetime('now')),
('prod_nsk_7200','NSK 7200 Single Row Angular Contact Ball Bearing','7200','7200','NSK-7200','7200','cat_ball','brand_nsk','Single Row Angular Contact Ball Bearing',10,30,9,'confirm_availability','published',NULL,NULL,datetime('now'),datetime('now'),datetime('now')),
('prod_nsk_7300','NSK 7300 Single Row Angular Contact Ball Bearing','7300','7300','NSK-7300','7300','cat_ball','brand_nsk','Single Row Angular Contact Ball Bearing',10,35,11,'confirm_availability','published',NULL,NULL,datetime('now'),datetime('now'),datetime('now')),
('prod_nsk_7403','NSK 7403 Single Row Angular Contact Ball Bearing','7403','7403','NSK-7403','7403','cat_ball','brand_nsk','Single Row Angular Contact Ball Bearing',17,62,17,'confirm_availability','published',NULL,NULL,datetime('now'),datetime('now'),datetime('now')),
('prod_nsk_3200','NSK 3200 Double Row Angular Contact Ball Bearing','3200','3200','NSK-3200','3200','cat_ball','brand_nsk','Double Row Angular Contact Ball Bearing',10,30,14,'confirm_availability','published',NULL,NULL,datetime('now'),datetime('now'),datetime('now')),
('prod_nsk_3300','NSK 3300 Double Row Angular Contact Ball Bearing','3300','3300','NSK-3300','3300','cat_ball','brand_nsk','Double Row Angular Contact Ball Bearing',10,35,17,'confirm_availability','published',NULL,NULL,datetime('now'),datetime('now'),datetime('now')),
('prod_nsk_1200','NSK 1200 Self-Aligning Ball Bearing','1200','1200','NSK-1200','1200','cat_ball','brand_nsk','Self-Aligning Ball Bearing',10,30,9,'confirm_availability','published',NULL,NULL,datetime('now'),datetime('now'),datetime('now')),
('prod_nsk_1300','NSK 1300 Self-Aligning Ball Bearing','1300','1300','NSK-1300','1300','cat_ball','brand_nsk','Self-Aligning Ball Bearing',10,35,11,'confirm_availability','published',NULL,NULL,datetime('now'),datetime('now'),datetime('now')),
('prod_nsk_2200','NSK 2200 Self-Aligning Ball Bearing','2200','2200','NSK-2200','2200','cat_ball','brand_nsk','Self-Aligning Ball Bearing',10,30,14,'confirm_availability','published',NULL,NULL,datetime('now'),datetime('now'),datetime('now')),
('prod_nsk_2300','NSK 2300 Self-Aligning Ball Bearing','2300','2300','NSK-2300','2300','cat_ball','brand_nsk','Self-Aligning Ball Bearing',10,35,17,'confirm_availability','published',NULL,NULL,datetime('now'),datetime('now'),datetime('now')),
('prod_nsk_51100','NSK 51100 Single Direction Thrust Ball Bearing','51100','51100','NSK-51100','51100','cat_ball','brand_nsk','Single Direction Thrust Ball Bearing',10,24,9,'confirm_availability','published',NULL,NULL,datetime('now'),datetime('now'),datetime('now')),
('prod_nsk_51200','NSK 51200 Single Direction Thrust Ball Bearing','51200','51200','NSK-51200','51200','cat_ball','brand_nsk','Single Direction Thrust Ball Bearing',10,26,11,'confirm_availability','published',NULL,NULL,datetime('now'),datetime('now'),datetime('now')),
('prod_nsk_51300','NSK 51300 Single Direction Thrust Ball Bearing','51300','51300','NSK-51300','51300','cat_ball','brand_nsk','Single Direction Thrust Ball Bearing',10,26,11,'confirm_availability','published',NULL,NULL,datetime('now'),datetime('now'),datetime('now')),
('prod_nsk_51400','NSK 51400 Single Direction Thrust Ball Bearing','51400','51400','NSK-51400','51400','cat_ball','brand_nsk','Single Direction Thrust Ball Bearing',10,26,11,'confirm_availability','published',NULL,NULL,datetime('now'),datetime('now'),datetime('now'));
