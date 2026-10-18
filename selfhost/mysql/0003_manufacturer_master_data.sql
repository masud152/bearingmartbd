-- Stage 2: additive manufacturer-master provenance. Existing product rows stay intact.
ALTER TABLE products
  ADD COLUMN source_document VARCHAR(255) NULL,
  ADD COLUMN source_document_version VARCHAR(120) NULL,
  ADD COLUMN data_verification_status VARCHAR(32) NOT NULL DEFAULT 'manual_review';

CREATE INDEX products_verification_status_idx ON products (data_verification_status);
