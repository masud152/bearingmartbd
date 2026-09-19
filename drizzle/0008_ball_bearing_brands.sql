INSERT OR IGNORE INTO brands (id,name,slug,status,created_at,updated_at) VALUES
('brand_skf','SKF','skf','active',datetime('now'),datetime('now')),
('brand_ntn','NTN','ntn','active',datetime('now'),datetime('now')),
('brand_koyo_jtekt','KOYO/JTEKT','koyo-jtekt','active',datetime('now'),datetime('now')),
('brand_timken','TIMKEN','timken','active',datetime('now'),datetime('now')),
('brand_nachi','NACHI','nachi','active',datetime('now'),datetime('now')),
('brand_fag','FAG','fag','active',datetime('now'),datetime('now')),
('brand_ina','INA','ina','active',datetime('now'),datetime('now')),
('brand_iko','IKO','iko','active',datetime('now'),datetime('now'));

WITH brand_seed(brand_id,brand_name,brand_slug,stock_status) AS (
  VALUES
    ('brand_skf','SKF','skf','in_stock'),('brand_ntn','NTN','ntn','in_stock'),
    ('brand_koyo_jtekt','KOYO/JTEKT','koyo-jtekt','in_stock'),('brand_timken','TIMKEN','timken','in_stock'),
    ('brand_nachi','NACHI','nachi','in_stock'),('brand_fag','FAG','fag','available_on_order'),
    ('brand_ina','INA','ina','available_on_order'),('brand_iko','IKO','iko','available_on_order')
)
INSERT OR IGNORE INTO products (id,name,slug,bearing_number,sku,mpn,category_id,brand_id,product_type,bore_diameter,outside_diameter,width,dimension_unit,price_visibility,stock_status,status,sort_order,seo_title,meta_description,version,created_at,updated_at,published_at)
SELECT 'prod_' || seed.brand_slug || '_' || source.bearing_number,seed.brand_name || ' ' || source.bearing_number || ' ' || source.product_type,seed.brand_slug || '-' || source.bearing_number,source.bearing_number,replace(seed.brand_name,'/','') || '-' || source.bearing_number,source.bearing_number,source.category_id,seed.brand_id,source.product_type,source.bore_diameter,source.outside_diameter,source.width,'mm','request',seed.stock_status,'published',source.sort_order,seed.brand_name || ' ' || source.bearing_number || ' Bearing | Bearing Mart BD','Request a quotation for the ' || seed.brand_name || ' ' || source.bearing_number || ' bearing.',1,datetime('now'),datetime('now'),datetime('now')
FROM products AS source CROSS JOIN brand_seed AS seed
WHERE source.id LIKE 'prod_nsk_%';
