CREATE TABLE customer_password_resets (
  id TEXT PRIMARY KEY NOT NULL,
  customer_id TEXT NOT NULL,
  token_hash TEXT,
  expires_at TEXT,
  used_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);
CREATE INDEX idx_customer_password_resets_customer ON customer_password_resets(customer_id,created_at);
CREATE UNIQUE INDEX idx_customer_password_resets_token ON customer_password_resets(token_hash) WHERE token_hash IS NOT NULL;
