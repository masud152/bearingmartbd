#!/usr/bin/env bash
# Deliberately destructive only with --apply and an exact confirmation token.
set -euo pipefail
umask 077

APPLY="${1:-}"
CONFIRMATION="${RELEASE_A_4D_CONFIRM:-}"
APP_DIR="/srv/bearingmartbd-release-a-diagnostics/app"
EXPECTED_COMMIT="7e1a5473b4490fee18e980185405dc7e4f37977f"
BASELINE_SQL="$APP_DIR/selfhost/mysql/0001_initial.sql"
EXPECTED_SQL_SHA="B1107D5C0F3C7792EA61490817CBA4279198930EAC36DA1FAF7F312B6DD20963"
ENV_FILE="${TEST_ENV_FILE:-/root/bearingmartbd-release-a-test/mysql.env}"
DB_NAME_REQUIRED="bearingmartbd_release_a_test"
DB_USER_REQUIRED="bearingmartbd_release_a"
EVIDENCE_SCRIPT="$(cd "$(dirname "$0")" && pwd)/RELEASE_A_4D_CAPTURE_EVIDENCE.sh"

die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

test -d "$APP_DIR" || die "isolated diagnostic checkout is missing"
test "$APP_DIR" != "/srv/bearingmartbd/app" || die "production application directory is prohibited"
test "$(runuser -u bearingmart -- git -C "$APP_DIR" rev-parse HEAD)" = "$EXPECTED_COMMIT" || die "unexpected diagnostic commit"
test -z "$(runuser -u bearingmart -- git -C "$APP_DIR" status --porcelain)" || die "diagnostic checkout is not clean"
test -f "$BASELINE_SQL" || die "baseline SQL is missing"
test "$(sha256sum "$BASELINE_SQL" | awk '{print toupper($1)}')" = "$EXPECTED_SQL_SHA" || die "baseline SQL checksum mismatch"
test -r "$ENV_FILE" || die "restricted test environment file is unreadable"
test -x "$EVIDENCE_SCRIPT" || die "read-only evidence script is missing or not executable"

if grep -Eiq '(^|[[:space:];])(USE|CREATE[[:space:]]+DATABASE|DROP[[:space:]]+DATABASE)([[:space:];]|$)|bearingmartbd_vps' "$BASELINE_SQL"; then
  die "baseline SQL contains a forbidden database-targeting operation"
fi

set -a
. "$ENV_FILE"
set +a
trap 'unset DB_HOST DB_PORT DB_NAME DB_USER DB_PASSWORD MYSQL_PWD RELEASE_A_4D_CONFIRM' EXIT

test "${DB_HOST:-}" = "127.0.0.1" || die "unexpected DB_HOST"
test "${DB_PORT:-}" = "3306" || die "unexpected DB_PORT"
test "${DB_NAME:-}" = "$DB_NAME_REQUIRED" || die "unexpected DB_NAME"
test "${DB_NAME:-}" != "bearingmartbd_vps" || die "production database is prohibited"
test "${DB_USER:-}" = "$DB_USER_REQUIRED" || die "unexpected DB_USER"

MYSQL_TEST=(mysql --protocol=TCP -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME" --batch --skip-column-names)
IDENTITY="$(MYSQL_PWD="$DB_PASSWORD" "${MYSQL_TEST[@]}" -NBe "SELECT USER(),CURRENT_USER(),DATABASE();")"
IFS=$'\t' read -r CONNECTED_USER EFFECTIVE_USER SELECTED_DB <<< "$IDENTITY"
case "$CONNECTED_USER" in
  "bearingmartbd_release_a@localhost"|"bearingmartbd_release_a@127.0.0.1") ;;
  *) die "unexpected USER() identity" ;;
esac
test "$EFFECTIVE_USER" = "bearingmartbd_release_a@127.0.0.1" || die "unexpected CURRENT_USER() identity"
test "$SELECTED_DB" = "$DB_NAME_REQUIRED" || die "unexpected selected database"

ROOT_MYSQL=(mysql --protocol=socket -uroot --batch --skip-column-names)
ROOT_SERVER="$("${ROOT_MYSQL[@]}" -NBe "SELECT @@server_uuid,@@port;")"
TCP_SERVER="$(MYSQL_PWD="$DB_PASSWORD" "${MYSQL_TEST[@]}" -NBe "SELECT @@server_uuid,@@port;")"
IFS=$'\t' read -r ROOT_SERVER_UUID ROOT_PORT <<< "$ROOT_SERVER"
IFS=$'\t' read -r TCP_SERVER_UUID TCP_PORT <<< "$TCP_SERVER"
test -n "$ROOT_SERVER_UUID" || die "root MySQL server identity is empty"
test "$ROOT_SERVER_UUID" = "$TCP_SERVER_UUID" || die "root and 127.0.0.1 MySQL connections differ"
test "$ROOT_PORT" = "3306" || die "root MySQL server is not listening on port 3306"
test "$TCP_PORT" = "3306" || die "restricted TCP connection is not using port 3306"

GRANTS="$("${ROOT_MYSQL[@]}" -NBe "SHOW GRANTS FOR 'bearingmartbd_release_a'@'127.0.0.1';")"
DB_SCOPE="$("${ROOT_MYSQL[@]}" -NBe "SELECT GROUP_CONCAT(DISTINCT Db ORDER BY Db SEPARATOR ',') FROM mysql.db WHERE User='bearingmartbd_release_a' AND Host='127.0.0.1';")"
GRANTEE_EXPR="CONCAT(CHAR(39),'bearingmartbd_release_a',CHAR(39),'@',CHAR(39),'127.0.0.1',CHAR(39))"
GLOBAL_PRIVILEGES="$("${ROOT_MYSQL[@]}" -NBe "SELECT COALESCE(GROUP_CONCAT(PRIVILEGE_TYPE ORDER BY PRIVILEGE_TYPE SEPARATOR ','),'') FROM information_schema.user_privileges WHERE GRANTEE=$GRANTEE_EXPR;")"
SCHEMA_PRIVILEGES="$("${ROOT_MYSQL[@]}" -NBe "SELECT COALESCE(GROUP_CONCAT(PRIVILEGE_TYPE ORDER BY PRIVILEGE_TYPE SEPARATOR ','),'') FROM information_schema.schema_privileges WHERE GRANTEE=$GRANTEE_EXPR AND TABLE_SCHEMA='bearingmartbd_release_a_test';")"
ROLE_COUNT="$("${ROOT_MYSQL[@]}" -NBe "SELECT COUNT(*) FROM mysql.role_edges WHERE TO_USER='bearingmartbd_release_a' AND TO_HOST='127.0.0.1';")"
TABLE_PRIV_COUNT="$("${ROOT_MYSQL[@]}" -NBe "SELECT COUNT(*) FROM mysql.tables_priv WHERE User='bearingmartbd_release_a' AND Host='127.0.0.1';")"
COLUMN_PRIV_COUNT="$("${ROOT_MYSQL[@]}" -NBe "SELECT COUNT(*) FROM mysql.columns_priv WHERE User='bearingmartbd_release_a' AND Host='127.0.0.1';")"
ROUTINE_PRIV_COUNT="$("${ROOT_MYSQL[@]}" -NBe "SELECT COUNT(*) FROM mysql.procs_priv WHERE User='bearingmartbd_release_a' AND Host='127.0.0.1';")"
UNEXPECTED_GLOBAL="$(printf '%s\n' "$GRANTS" | grep -E ' ON \*\.\* ' | grep -Ev '^GRANT USAGE ON \*\.\* TO ' || true)"
test "$DB_SCOPE" = "$DB_NAME_REQUIRED" || die "test account has an unexpected database scope"
test "$GLOBAL_PRIVILEGES" = "USAGE" || die "test account does not have USAGE-only global privileges"
test "$SCHEMA_PRIVILEGES" = "ALTER,CREATE,DELETE,INDEX,INSERT,REFERENCES,SELECT,UPDATE" || die "test account schema privileges differ from the approved set"
test -z "$UNEXPECTED_GLOBAL" || die "test account has unexpected global privileges"
test "$ROLE_COUNT" = "0" || die "test account has role-derived privileges"
test "$TABLE_PRIV_COUNT" = "0" || die "test account has table-level privileges"
test "$COLUMN_PRIV_COUNT" = "0" || die "test account has column-level privileges"
test "$ROUTINE_PRIV_COUNT" = "0" || die "test account has routine-level privileges"

pre_destructive_state() {
  local object_count ledger columns0002 indexes0002 columns0003 indexes0003
  IDENTITY="$(MYSQL_PWD="$DB_PASSWORD" "${MYSQL_TEST[@]}" -NBe "SELECT USER(),CURRENT_USER(),DATABASE();")"
  IFS=$'\t' read -r CONNECTED_USER EFFECTIVE_USER SELECTED_DB <<< "$IDENTITY"
  test "$EFFECTIVE_USER" = "bearingmartbd_release_a@127.0.0.1" || die "restricted account identity changed"
  test "$SELECTED_DB" = "$DB_NAME_REQUIRED" || die "selected disposable database changed"
  object_count="$(MYSQL_PWD="$DB_PASSWORD" "${MYSQL_TEST[@]}" -NBe "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE();")"
  ledger="$(MYSQL_PWD="$DB_PASSWORD" "${MYSQL_TEST[@]}" -NBe "SELECT GROUP_CONCAT(filename ORDER BY filename SEPARATOR ',') FROM schema_migrations;")"
  columns0002="$(MYSQL_PWD="$DB_PASSWORD" "${MYSQL_TEST[@]}" -NBe "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='products' AND column_name IN ('series','basic_model','manufacturer_designation','normalized_manufacturer_designation','seal_shield','clearance','cage','dynamic_load_value','dynamic_load_unit','static_load_value','static_load_unit','speed_rpm','speed_note','source_url','source_title','source_verified_at');")"
  indexes0002="$(MYSQL_PWD="$DB_PASSWORD" "${MYSQL_TEST[@]}" -NBe "SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='products' AND index_name IN ('products_brand_designation_unique','products_basic_model_idx','products_designation_search_idx');")"
  columns0003="$(MYSQL_PWD="$DB_PASSWORD" "${MYSQL_TEST[@]}" -NBe "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='products' AND column_name IN ('source_document','source_document_version','data_verification_status');")"
  indexes0003="$(MYSQL_PWD="$DB_PASSWORD" "${MYSQL_TEST[@]}" -NBe "SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='products' AND index_name='products_verification_status_idx';")"
  test "$object_count" = "17" || die "unexpected disposable object count"
  test "$ledger" = "0001_initial.sql" || die "unexpected disposable migration ledger"
  test "$columns0002" = "16" || die "expected migration 0002 columns are not complete"
  test "$indexes0002" = "3" || die "expected migration 0002 indexes are not complete"
  test "$columns0003" = "0" || die "migration 0003 columns unexpectedly exist"
  test "$indexes0003" = "0" || die "migration 0003 index unexpectedly exists"
}

DATABASE_DEFAULTS="$(MYSQL_PWD="$DB_PASSWORD" "${MYSQL_TEST[@]}" -NBe "SELECT DEFAULT_CHARACTER_SET_NAME,DEFAULT_COLLATION_NAME FROM information_schema.schemata WHERE schema_name=DATABASE();")"
IFS=$'\t' read -r ORIGINAL_CHARACTER_SET ORIGINAL_COLLATION <<< "$DATABASE_DEFAULTS"
[[ "$ORIGINAL_CHARACTER_SET" =~ ^[A-Za-z0-9_]+$ ]] || die "unexpected original character set"
[[ "$ORIGINAL_COLLATION" =~ ^[A-Za-z0-9_]+$ ]] || die "unexpected original collation"
pre_destructive_state

printf 'RECOVERY_PREFLIGHT_PASS database=%s commit=%s\n' "$DB_NAME_REQUIRED" "$EXPECTED_COMMIT"

if test "$APPLY" != "--apply"; then
  printf 'RESET_NOT_APPLIED: rerun only after approval with --apply and RELEASE_A_4D_CONFIRM=reset-bearingmartbd-release-a-test\n'
  exit 0
fi
test "$CONFIRMATION" = "reset-bearingmartbd-release-a-test" || die "missing or invalid destructive confirmation"

EVIDENCE_OUTPUT="$("$EVIDENCE_SCRIPT")"
EVIDENCE_DIR="$(printf '%s\n' "$EVIDENCE_OUTPUT" | awk -F= '/^EVIDENCE_CAPTURED=/{print $2}')"
test -n "$EVIDENCE_DIR" || die "evidence capture did not report completion"
test -d "$EVIDENCE_DIR" || die "evidence directory is missing"
test -s "$EVIDENCE_DIR/inspection.txt" || die "evidence inspection is missing or empty"
test -s "$EVIDENCE_DIR/schema.sql" || die "evidence schema snapshot is missing or empty"
test -s "$EVIDENCE_DIR/SHA256SUMS" || die "evidence checksum manifest is missing or empty"
(cd "$EVIDENCE_DIR" && sha256sum -c SHA256SUMS) || die "evidence checksum verification failed"
pre_destructive_state

"${ROOT_MYSQL[@]}" -e "DROP DATABASE \`bearingmartbd_release_a_test\`;"
"${ROOT_MYSQL[@]}" -e "CREATE DATABASE \`bearingmartbd_release_a_test\` CHARACTER SET $ORIGINAL_CHARACTER_SET COLLATE $ORIGINAL_COLLATION;"
MYSQL_PWD="$DB_PASSWORD" "${MYSQL_TEST[@]}" < "$BASELINE_SQL"
MYSQL_PWD="$DB_PASSWORD" "${MYSQL_TEST[@]}" -e "INSERT INTO schema_migrations (filename,applied_at) VALUES ('0001_initial.sql', UTC_TIMESTAMP());"

OBJECT_COUNT="$(MYSQL_PWD="$DB_PASSWORD" "${MYSQL_TEST[@]}" -NBe "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE();")"
LEDGER="$(MYSQL_PWD="$DB_PASSWORD" "${MYSQL_TEST[@]}" -NBe "SELECT GROUP_CONCAT(filename ORDER BY filename SEPARATOR ',') FROM schema_migrations;")"
COUNTS="$(MYSQL_PWD="$DB_PASSWORD" "${MYSQL_TEST[@]}" -NBe "SELECT (SELECT COUNT(*) FROM products),(SELECT COUNT(*) FROM brands),(SELECT COUNT(*) FROM categories);")"
test "$OBJECT_COUNT" = "17" || die "baseline object count is not 17"
test "$LEDGER" = "0001_initial.sql" || die "baseline migration ledger is incorrect"
test "$COUNTS" = $'0\t0\t0' || die "baseline catalogue row counts are not zero"

printf 'RESET_BASELINE_PASS tables=%s ledger=%s catalogue_counts=%s\n' "$OBJECT_COUNT" "$LEDGER" "$COUNTS"
