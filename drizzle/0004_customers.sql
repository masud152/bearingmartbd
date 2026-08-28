CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY NOT NULL,
  customer_type TEXT NOT NULL,
  full_name TEXT NOT NULL,
  company_name TEXT,
  responsible_person_name TEXT,
  mobile TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  photo_key TEXT,
  document_key TEXT NOT NULL,
  document_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_review',
  consent_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS customers_email_unique ON customers(lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS customers_mobile_unique ON customers(mobile);
CREATE INDEX IF NOT EXISTS customers_status_idx ON customers(status);
INSERT OR IGNORE INTO permissions (key,description) VALUES
('customers.view','View customer records and documents'),
('customers.update','Review and update customer status');
INSERT OR IGNORE INTO role_permissions (role_id,permission_key) VALUES
('role_admin','customers.view'),('role_admin','customers.update'),
('role_sales','customers.view'),('role_sales','customers.update'),
('role_viewer','customers.view');
