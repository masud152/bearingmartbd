-- Stage 1: additive, manufacturer-specific Ball Bearing catalogue fields.
-- Do not change or clone existing catalogue records in this migration.
ALTER TABLE products
  ADD COLUMN series VARCHAR(120) NULL,
  ADD COLUMN basic_model VARCHAR(120) NULL,
  ADD COLUMN manufacturer_designation VARCHAR(160) NULL,
  ADD COLUMN normalized_manufacturer_designation VARCHAR(160) NULL,
  ADD COLUMN seal_shield VARCHAR(255) NULL,
  ADD COLUMN clearance VARCHAR(120) NULL,
  ADD COLUMN cage VARCHAR(255) NULL,
  ADD COLUMN dynamic_load_value DECIMAL(14,3) NULL,
  ADD COLUMN dynamic_load_unit VARCHAR(12) NULL,
  ADD COLUMN static_load_value DECIMAL(14,3) NULL,
  ADD COLUMN static_load_unit VARCHAR(12) NULL,
  ADD COLUMN speed_rpm INT NULL,
  ADD COLUMN speed_note VARCHAR(255) NULL,
  ADD COLUMN source_url VARCHAR(2048) NULL,
  ADD COLUMN source_title VARCHAR(255) NULL,
  ADD COLUMN source_verified_at VARCHAR(40) NULL;

CREATE UNIQUE INDEX products_brand_designation_unique
  ON products (brand_id, normalized_manufacturer_designation);
CREATE INDEX products_basic_model_idx ON products (basic_model);
CREATE INDEX products_designation_search_idx ON products (normalized_manufacturer_designation);
