#!/usr/bin/env bash
set -Eeuo pipefail

fail() { echo "STOP: $*" >&2; exit 1; }

APP_DIR="/srv/bearingmartbd-release-a-validation-source/app"
ENV_FILE="/root/bearingmartbd-release-a-test/mysql.env"
CLIENT="/root/bearingmartbd-release-a-test/mysql-client.cnf"
EXPECTED_COMMIT="1fb2febafdcc257c190680676b476b1743271fc8"
DB_NAME="bearingmartbd_release_a_test"
DB_USER="bearingmartbd_release_a"
DB_HOST="127.0.0.1"
DB_PORT="3306"

test "$(sudo -n -u bearingmart -- git -C "$APP_DIR" rev-parse HEAD)" = "$EXPECTED_COMMIT" || fail "unexpected source commit"
test -z "$(sudo -n -u bearingmart -- git -C "$APP_DIR" status --porcelain)" || fail "isolated source tree is not clean"
test -r "$ENV_FILE" || fail "restricted test environment file is unreadable"
test -r "$CLIENT" || fail "restricted test client configuration is unreadable"

MIGRATOR_SOURCE="$(sudo -n -u bearingmart -- git -C "$APP_DIR" show "$EXPECTED_COMMIT:scripts/release-a-catalogue-migrate.mjs")"
for REQUIRED_TEXT in \
  'const releaseA0002 = "0002_ball_bearing_catalogue.sql";' \
  'const releaseA0003 = "0003_manufacturer_master_data.sql";' \
  'host: required("DB_HOST")' \
  'port: Number(process.env.DB_PORT || 3306)' \
  'user: required("DB_USER")' \
  'password: required("DB_PASSWORD")' \
  'database: required("DB_NAME")' \
  'const apply = process.argv.includes("--apply");'
do
  printf '%s\n' "$MIGRATOR_SOURCE" | grep -Fq -- "$REQUIRED_TEXT" || fail "migrator is missing expected configuration: $REQUIRED_TEXT"
done
test "$(printf '%s\n' "$MIGRATOR_SOURCE" | grep -c 'createPool(')" = "1" || fail "migrator defines an unexpected number of MySQL pools"
if printf '%s\n' "$MIGRATOR_SOURCE" | grep -Eq 'migrate-mysql|db:migrate|bearingmartbd_vps|0004|changeUser|USE[[:space:]]|child_process|spawn\(|exec\('; then
  fail "migrator contains an unexpected database switch, generic migration, production reference, or subprocess"
fi

set -a
. "$ENV_FILE"
set +a
trap 'unset DB_PASSWORD' EXIT

: "${DB_HOST:?missing DB_HOST}"
: "${DB_PORT:?missing DB_PORT}"
: "${DB_NAME:?missing DB_NAME}"
: "${DB_USER:?missing DB_USER}"
: "${DB_PASSWORD:?missing DB_PASSWORD}"

test "$DB_HOST" = "127.0.0.1" || fail "unexpected DB_HOST"
test "$DB_PORT" = "3306" || fail "unexpected DB_PORT"
test "$DB_NAME" = "bearingmartbd_release_a_test" || fail "unexpected DB_NAME"
test "$DB_USER" = "bearingmartbd_release_a" || fail "unexpected DB_USER"
test "$(mysql -NBe 'SELECT @@port;')" = "3306" || fail "unexpected MySQL server port"

MYSQL_TEST=(mysql --defaults-extra-file="$CLIENT" --protocol=TCP --host="$DB_HOST" --port="$DB_PORT" --user="$DB_USER" --database="$DB_NAME")
IDENTITY="$("${MYSQL_TEST[@]}" -NBe "SELECT CONCAT(USER(),'|',CURRENT_USER(),'|',DATABASE());")"
case "$IDENTITY" in
  "$DB_USER@localhost|$DB_USER@$DB_HOST|$DB_NAME"|"$DB_USER@$DB_HOST|$DB_USER@$DB_HOST|$DB_NAME") ;;
  *) fail "restricted MySQL identity or selected database does not match" ;;
esac
echo "DATABASE_IDENTITY=$IDENTITY"

GRANTEE_EXPR="CONCAT(QUOTE('$DB_USER'),'@',QUOTE('$DB_HOST'))"
test "$(mysql -NBe "SELECT COUNT(*) FROM mysql.role_edges WHERE TO_USER='$DB_USER' AND TO_HOST='$DB_HOST';")" = "0" || fail "role-derived privileges detected"
test "$(mysql -NBe "SELECT COUNT(*) FROM mysql.default_roles WHERE USER='$DB_USER' AND HOST='$DB_HOST';")" = "0" || fail "default role detected"
GLOBAL_COUNT="$(mysql -NBe "SELECT COUNT(*) FROM information_schema.user_privileges WHERE grantee=$GRANTEE_EXPR;")"
GLOBAL_PRIVILEGES="$(mysql -NBe "SELECT COALESCE(GROUP_CONCAT(privilege_type ORDER BY privilege_type SEPARATOR ','),'') FROM information_schema.user_privileges WHERE grantee=$GRANTEE_EXPR;")"
if [ "$GLOBAL_COUNT" = "0" ] && [ -z "$GLOBAL_PRIVILEGES" ]; then echo "GLOBAL_PRIVILEGES=NONE"; elif [ "$GLOBAL_COUNT" = "1" ] && [ "$GLOBAL_PRIVILEGES" = "USAGE" ]; then echo "GLOBAL_PRIVILEGES=USAGE_ONLY"; else fail "unexpected global privileges"; fi

EXPECTED_SCHEMA_PRIVILEGES="$DB_NAME:ALTER,$DB_NAME:CREATE,$DB_NAME:DELETE,$DB_NAME:INDEX,$DB_NAME:INSERT,$DB_NAME:REFERENCES,$DB_NAME:SELECT,$DB_NAME:UPDATE"
test "$(mysql -NBe "SELECT COUNT(*) FROM information_schema.schema_privileges WHERE grantee=$GRANTEE_EXPR;")" = "8" || fail "unexpected schema privilege count"
ACTUAL_SCHEMA_PRIVILEGES="$(mysql -NBe "SELECT COALESCE(GROUP_CONCAT(CONCAT(table_schema,':',privilege_type) ORDER BY table_schema,privilege_type SEPARATOR ','),'') FROM information_schema.schema_privileges WHERE grantee=$GRANTEE_EXPR;")"
test "$ACTUAL_SCHEMA_PRIVILEGES" = "$EXPECTED_SCHEMA_PRIVILEGES" || fail "database privileges are not restricted exclusively to the disposable database"
test "$(mysql -NBe "SELECT COUNT(*) FROM information_schema.table_privileges WHERE grantee=$GRANTEE_EXPR;")" = "0" || fail "unexpected table-level privileges"
test "$(mysql -NBe "SELECT COUNT(*) FROM information_schema.column_privileges WHERE grantee=$GRANTEE_EXPR;")" = "0" || fail "unexpected column-level privileges"
test "$(mysql -NBe "SELECT COUNT(*) FROM mysql.procs_priv WHERE User='$DB_USER' AND Host='$DB_HOST';")" = "0" || fail "unexpected routine-level privileges"

LEDGER="$("${MYSQL_TEST[@]}" -NBe "SELECT GROUP_CONCAT(filename ORDER BY filename SEPARATOR ',') FROM schema_migrations;")"
test "$LEDGER" = "0001_initial.sql" || fail "only baseline migration 0001 must be recorded before apply"

RELEASE_A_COLUMN_COUNT="$("${MYSQL_TEST[@]}" -NBe "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='products' AND column_name IN ('series','basic_model','manufacturer_designation','normalized_manufacturer_designation','seal_shield','clearance','cage','dynamic_load_value','dynamic_load_unit','static_load_value','static_load_unit','speed_rpm','speed_note','source_url','source_title','source_verified_at','source_document','source_document_version','data_verification_status');")"
test "$RELEASE_A_COLUMN_COUNT" = "0" || fail "Release A columns already exist"

RELEASE_A_INDEX_COUNT="$("${MYSQL_TEST[@]}" -NBe "SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='products' AND index_name IN ('products_brand_designation_unique','products_basic_model_idx','products_designation_search_idx','products_verification_status_idx');")"
test "$RELEASE_A_INDEX_COUNT" = "0" || fail "Release A indexes already exist"

echo "PASS: isolation is verified; only Release A migrations 0002 and 0003 are eligible."
echo "Do not continue unless this safety gate exits successfully."
