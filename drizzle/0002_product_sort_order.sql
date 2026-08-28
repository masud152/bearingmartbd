ALTER TABLE products ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
UPDATE products
SET sort_order = (
  SELECT COUNT(*)
  FROM products AS ordered_products
  WHERE ordered_products.bearing_number <= products.bearing_number
);
