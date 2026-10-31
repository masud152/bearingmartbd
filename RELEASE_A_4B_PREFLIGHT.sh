#!/usr/bin/env bash
set -Eeuo pipefail

fail() { echo "STOP: $*" >&2; exit 1; }

APP_DIR="/srv/bearingmartbd-release-a-validation-source/app"
ENV_FILE="/root/bearingmartbd-release-a-test/mysql.env"
CLIENT="/root/bearingmartbd-release-a-test/mysql-client.cnf"
EXPECTED_COMMIT="1fb2febafdcc257c190680676b476b1743271fc8"
EXPECTED_DB_NAME="bearingmartbd_release_a_test"
EXPECTED_DB_USER="bearingmartbd_release_a"
EXPECTED_DB_HOST="127.0.0.1"
EXPECTED_DB_PORT="3306"

EXPECTED_TABLES=(admin_sessions admin_users audit_events brands categories customer_password_resets customer_sessions customers permissions product_specifications products role_permissions roles schema_migrations site_settings site_stats user_roles)
RELEASE_A_COLUMNS=(series basic_model manufacturer_designation normalized_manufacturer_designation seal_shield clearance cage dynamic_load_value dynamic_load_unit static_load_value static_load_unit speed_rpm speed_note source_url source_title source_verified_at source_document source_document_version data_verification_status)
RELEASE_A_INDEXES=(products_brand_designation_unique products_basic_model_idx products_designation_search_idx products_verification_status_idx)

test -d "$APP_DIR/.git" || fail "isolated Release A Git checkout is missing"
test -r "$ENV_FILE" || fail "restricted test environment file is unreadable"
test -r "$CLIENT" || fail "restricted test client configuration is unreadable"
test -f "$APP_DIR/scripts/release-a-catalogue-migrate.mjs" || fail "Release A migration script is missing"

echo "CHECK: Git ownership, approved commit, and clean state"
test "$(sudo -n -u bearingmart -- git -C "$APP_DIR" rev-parse HEAD)" = "$EXPECTED_COMMIT" || fail "unexpected Release A commit"
test -z "$(sudo -n -u bearingmart -- git -C "$APP_DIR" status --porcelain)" || fail "Release A working tree is not clean"
sudo -n -u bearingmart -- git -C "$APP_DIR" cat-file -e "$EXPECTED_COMMIT:scripts/release-a-catalogue-migrate.mjs" || fail "migration script is absent from approved commit"

echo "CHECK: Node dependency resolution and complete migration control flow"
sudo -n -u bearingmart -- /bin/bash -s -- "$APP_DIR" <<'BASH'
set -Eeuo pipefail
cd "$1"
node --input-type=module <<'NODE'
import fs from "node:fs";
import assert from "node:assert/strict";
await import("mysql2/promise");
console.log("MYSQL2_IMPORT_PASS");
const source = fs.readFileSync("scripts/release-a-catalogue-migrate.mjs", "utf8");
const requireText = (text) => assert.ok(source.includes(text), `missing expected source text: ${text}`);
for (const text of [
  'import { createPool } from "mysql2/promise";', 'required("DB_HOST")',
  'process.env.DB_PORT || 3306', 'required("DB_USER")', 'required("DB_PASSWORD")',
  'required("DB_NAME")', 'const apply = process.argv.includes("--apply");',
  'const releaseA0002 = "0002_ball_bearing_catalogue.sql";',
  'const releaseA0003 = "0003_manufacturer_master_data.sql";',
  'async function migrationLedger()', 'async function productColumns()',
  'async function productIndexes()', 'function assertSafeState(',
  'async function verifyComplete()', 'const before = await state();',
  'if (!apply) process.exitCode = 0;', 'async function mark(filename)',
  'INSERT INTO schema_migrations', 'ALTER TABLE products',
  'CREATE UNIQUE INDEX products_brand_designation_unique',
  'CREATE INDEX products_basic_model_idx',
  'CREATE INDEX products_designation_search_idx',
  'CREATE INDEX products_verification_status_idx', 'await verifyComplete();'
]) requireText(text);
for (const forbidden of ["migrate-mysql", "db:migrate", "bearingmartbd_vps", "0004", "child_process", "spawn(", "exec("])
  assert.ok(!source.includes(forbidden), `unexpected source reference: ${forbidden}`);
const before = source.indexOf("const before = await state();");
const dry = source.indexOf("if (!apply) process.exitCode = 0;");
const apply = source.indexOf("else {", dry);
const finish = source.lastIndexOf("} finally");
assert.ok(before >= 0 && dry > before && apply > dry && finish > apply, "unexpected migration control-flow structure");
const dryRun = source.slice(before, apply);
assert.ok(!/INSERT\s+INTO|ALTER\s+TABLE|CREATE\s+(?:UNIQUE\s+)?INDEX|connection\.execute|await\s+mark\(/i.test(dryRun), "write operation detected before --apply branch");
const applyRun = source.slice(apply, finish);
for (const operation of ["ALTER TABLE products", "CREATE UNIQUE INDEX products_brand_designation_unique", "CREATE INDEX products_basic_model_idx", "CREATE INDEX products_designation_search_idx", "CREATE INDEX products_verification_status_idx", "await mark(releaseA0002)", "await mark(releaseA0003)"])
  assert.ok(applyRun.includes(operation), `expected apply-only operation missing: ${operation}`);
console.log("MIGRATION_CONTROL_FLOW_PASS");
console.log("DRY_RUN_WRITE_CHECK_PASS");
console.log("REQUIRED_PRIVILEGES=SELECT,ALTER,INDEX,INSERT");
NODE
BASH

echo "CHECK: restricted disposable-database environment"
set -a; . "$ENV_FILE"; set +a
: "${DB_HOST:?missing DB_HOST}"; : "${DB_PORT:?missing DB_PORT}"; : "${DB_NAME:?missing DB_NAME}"; : "${DB_USER:?missing DB_USER}"; : "${DB_PASSWORD:?missing DB_PASSWORD}"
test "$DB_HOST" = "$EXPECTED_DB_HOST" || fail "database host is not approved"
test "$DB_PORT" = "$EXPECTED_DB_PORT" || fail "database port is not approved"
test "$DB_NAME" = "$EXPECTED_DB_NAME" || fail "database is not the disposable test database"
test "$DB_USER" = "$EXPECTED_DB_USER" || fail "database user is not the restricted test user"

MYSQL_TEST=(mysql --defaults-extra-file="$CLIENT" --protocol=TCP --host="$DB_HOST" --port="$DB_PORT" --user="$DB_USER" --database="$DB_NAME")
test "$(mysql -NBe 'SELECT @@port;')" = "$EXPECTED_DB_PORT" || fail "MySQL server is not listening on approved port"

echo "CHECK: restricted identity and baseline database"
IDENTITY="$("${MYSQL_TEST[@]}" -NBe "SELECT CONCAT(USER(),'|',CURRENT_USER(),'|',DATABASE());")"
USER_VALUE="${IDENTITY%%|*}"; REMAINDER="${IDENTITY#*|}"; CURRENT_USER_VALUE="${REMAINDER%%|*}"; DATABASE_VALUE="${REMAINDER#*|}"
case "$USER_VALUE" in "$DB_USER@localhost"|"$DB_USER@$DB_HOST") ;; *) fail "unexpected USER(): $USER_VALUE";; esac
test "$CURRENT_USER_VALUE" = "$DB_USER@$DB_HOST" || fail "unexpected CURRENT_USER()"
test "$DATABASE_VALUE" = "$DB_NAME" || fail "unexpected DATABASE()"
test "$("${MYSQL_TEST[@]}" -NBe "SELECT CONCAT(COUNT(*),'|',COALESCE(MIN(filename),''),'|',COALESCE(MAX(filename),'')) FROM schema_migrations;")" = "1|0001_initial.sql|0001_initial.sql" || fail "migration ledger is not exactly 0001_initial.sql"

mapfile -t ACTUAL_TABLES < <("${MYSQL_TEST[@]}" -NBe "SELECT table_name FROM information_schema.tables WHERE table_schema=DATABASE() AND table_type='BASE TABLE' ORDER BY table_name;")
mapfile -t EXPECTED_TABLES_SORTED < <(printf '%s\n' "${EXPECTED_TABLES[@]}" | sort)
test "${#ACTUAL_TABLES[@]}" = "17" || fail "baseline does not contain exactly 17 tables"
test "$(printf '%s\n' "${ACTUAL_TABLES[@]}")" = "$(printf '%s\n' "${EXPECTED_TABLES_SORTED[@]}")" || fail "baseline table list differs from approved 0001 schema"

COLUMN_LIST="$(printf "'%s'," "${RELEASE_A_COLUMNS[@]}")"; COLUMN_LIST="${COLUMN_LIST%,}"
test "$("${MYSQL_TEST[@]}" -NBe "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='products' AND column_name IN ($COLUMN_LIST);")" = "0" || fail "Release A catalogue columns already exist"
INDEX_LIST="$(printf "'%s'," "${RELEASE_A_INDEXES[@]}")"; INDEX_LIST="${INDEX_LIST%,}"
test "$("${MYSQL_TEST[@]}" -NBe "SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='products' AND index_name IN ($INDEX_LIST);")" = "0" || fail "Release A catalogue indexes already exist"

GRANTEE_EXPR="CONCAT(QUOTE('$DB_USER'),'@',QUOTE('$DB_HOST'))"
echo "CHECK: roles and privileges"
test "$(mysql -NBe "SELECT COUNT(*) FROM mysql.role_edges WHERE TO_USER='$DB_USER' AND TO_HOST='$DB_HOST';")" = "0" || fail "restricted account has assigned role edges"
test "$(mysql -NBe "SELECT COUNT(*) FROM mysql.default_roles WHERE USER='$DB_USER' AND HOST='$DB_HOST';")" = "0" || fail "restricted account has default roles"
GLOBAL_COUNT="$(mysql -NBe "SELECT COUNT(*) FROM information_schema.user_privileges WHERE grantee=$GRANTEE_EXPR;")"
GLOBAL_PRIVILEGES="$(mysql -NBe "SELECT COALESCE(GROUP_CONCAT(privilege_type ORDER BY privilege_type SEPARATOR ','),'') FROM information_schema.user_privileges WHERE grantee=$GRANTEE_EXPR;")"
if [ "$GLOBAL_COUNT" = "0" ] && [ -z "$GLOBAL_PRIVILEGES" ]; then echo "GLOBAL_PRIVILEGES=NONE"; elif [ "$GLOBAL_COUNT" = "1" ] && [ "$GLOBAL_PRIVILEGES" = "USAGE" ]; then echo "GLOBAL_PRIVILEGES=USAGE_ONLY"; else fail "restricted account has unexpected global privileges"; fi
EXPECTED_SCHEMA_PRIVILEGES="$DB_NAME:ALTER,$DB_NAME:CREATE,$DB_NAME:DELETE,$DB_NAME:INDEX,$DB_NAME:INSERT,$DB_NAME:REFERENCES,$DB_NAME:SELECT,$DB_NAME:UPDATE"
test "$(mysql -NBe "SELECT COUNT(*) FROM information_schema.schema_privileges WHERE grantee=$GRANTEE_EXPR;")" = "8" || fail "unexpected schema privilege count"
test "$(mysql -NBe "SELECT COALESCE(GROUP_CONCAT(CONCAT(table_schema,':',privilege_type) ORDER BY table_schema,privilege_type SEPARATOR ','),'') FROM information_schema.schema_privileges WHERE grantee=$GRANTEE_EXPR;")" = "$EXPECTED_SCHEMA_PRIVILEGES" || fail "schema privileges are not limited to the test database"
test "$(mysql -NBe "SELECT COUNT(*) FROM information_schema.table_privileges WHERE grantee=$GRANTEE_EXPR;")" = "0" || fail "unexpected table-level grants"
test "$(mysql -NBe "SELECT COUNT(*) FROM information_schema.column_privileges WHERE grantee=$GRANTEE_EXPR;")" = "0" || fail "unexpected column-level grants"
test "$(mysql -NBe "SELECT COUNT(*) FROM mysql.procs_priv WHERE User='$DB_USER' AND Host='$DB_HOST';")" = "0" || fail "unexpected routine-level grants"

echo "CHECK: controlled environment propagation to bearingmart"
unset RELEASE_A_PRODUCTION_CONFIRM
env -i PATH="$PATH" HOME="/root" DB_HOST="$DB_HOST" DB_PORT="$DB_PORT" DB_NAME="$DB_NAME" DB_USER="$DB_USER" DB_PASSWORD="$DB_PASSWORD" APP_ENV="release_a_validation" sudo -n -u bearingmart --preserve-env=DB_HOST,DB_PORT,DB_NAME,DB_USER,DB_PASSWORD,APP_ENV /bin/bash -c '
  test "$DB_HOST" = "127.0.0.1"
  test "$DB_PORT" = "3306"
  test "$DB_NAME" = "bearingmartbd_release_a_test"
  test "$DB_USER" = "bearingmartbd_release_a"
  test "$APP_ENV" = "release_a_validation"
  test -n "$DB_PASSWORD"
  test -z "${RELEASE_A_PRODUCTION_CONFIRM:-}"
  test "$(env | awk -F= "/^DB_/ {print \$1}" | sort | tr "\n" " ")" = "DB_HOST DB_NAME DB_PASSWORD DB_PORT DB_USER "
  echo "SUDO_ENVIRONMENT_PASS"
'

unset DB_PASSWORD
echo "PASS: Release A Step 4B preflight completed."
echo "No migration command, production database access, or database write was performed."
