-- Add the customer-management permission to the existing super-admin role.
-- This is additive and idempotent; no users, roles, or permissions are removed.
INSERT OR IGNORE INTO role_permissions (role_id, permission_key)
VALUES ('role_super_admin', 'customers.update');
