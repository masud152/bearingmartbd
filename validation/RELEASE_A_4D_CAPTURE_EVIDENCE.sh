#!/usr/bin/env bash
# Read-only evidence capture for the Release A disposable database.
set -euo pipefail
umask 077

APP_DIR="/srv/bearingmartbd-release-a-diagnostics/app"
EXPECTED_COMMIT="7e1a5473b4490fee18e980185405dc7e4f37977f"
BASELINE_SQL="$APP_DIR/selfhost/mysql/0001_initial.sql"
EXPECTED_SQL_SHA="B1107D5C0F3C7792EA61490817CBA4279198930EAC36DA1FAF7F312B6DD20963"
ENV_FILE="${TEST_ENV_FILE:-/root/bearingmartbd-release-a-test/mysql.env}"
EVIDENCE_ROOT="/srv/bearingmartbd-release-a-diagnostics/evidence"

die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

test -d "$APP_DIR" || die "isolated diagnostic checkout is missing"
test "$(runuser -u bearingmart -- git -C "$APP_DIR" rev-parse HEAD)" = "$EXPECTED_COMMIT" || die "unexpected diagnostic commit"
test -z "$(runuser -u bearingmart -- git -C "$APP_DIR" status --porcelain)" || die "diagnostic checkout is not clean"
test -f "$BASELINE_SQL" || die "baseline SQL is missing"
test "$(sha256sum "$BASELINE_SQL" | awk '{print toupper($1)}')" = "$EXPECTED_SQL_SHA" || die "baseline SQL checksum mismatch"
test -r "$ENV_FILE" || die "restricted test environment file is unreadable"

set -a
. "$ENV_FILE"
set +a
trap 'unset DB_HOST DB_PORT DB_NAME DB_USER DB_PASSWORD MYSQL_PWD' EXIT

test "${DB_HOST:-}" = "127.0.0.1" || die "unexpected DB_HOST"
test "${DB_PORT:-}" = "3306" || die "unexpected DB_PORT"
test "${DB_NAME:-}" = "bearingmartbd_release_a_test" || die "unexpected DB_NAME"
test "${DB_USER:-}" = "bearingmartbd_release_a" || die "unexpected DB_USER"

MYSQL_TEST=(mysql --protocol=TCP -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME" --batch --skip-column-names)
IDENTITY="$(MYSQL_PWD="$DB_PASSWORD" "${MYSQL_TEST[@]}" -NBe "SELECT USER(),CURRENT_USER(),DATABASE();")"
IFS=$'\t' read -r CONNECTED_USER EFFECTIVE_USER SELECTED_DB <<< "$IDENTITY"
case "$CONNECTED_USER" in
  "bearingmartbd_release_a@localhost"|"bearingmartbd_release_a@127.0.0.1") ;;
  *) die "unexpected USER() identity" ;;
esac
test "$EFFECTIVE_USER" = "bearingmartbd_release_a@127.0.0.1" || die "unexpected CURRENT_USER() identity"
test "$SELECTED_DB" = "$DB_NAME" || die "unexpected selected database"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_DIR="$EVIDENCE_ROOT/$STAMP"
mkdir -p "$OUT_DIR"
chmod 700 "$EVIDENCE_ROOT" "$OUT_DIR"

{
  printf 'captured_at_utc=%s\n' "$STAMP"
  printf 'diagnostic_commit=%s\n' "$EXPECTED_COMMIT"
  printf 'baseline_sha256=%s\n' "$EXPECTED_SQL_SHA"
  printf 'database=%s\n' "$SELECTED_DB"
  printf 'current_user=%s\n' "$EFFECTIVE_USER"
  printf '\n[migration_ledger]\n'
  MYSQL_PWD="$DB_PASSWORD" "${MYSQL_TEST[@]}" -e "SELECT filename,applied_at FROM schema_migrations ORDER BY filename;"
  printf '\n[table_inventory]\n'
  MYSQL_PWD="$DB_PASSWORD" "${MYSQL_TEST[@]}" -e "SELECT table_name,table_type FROM information_schema.tables WHERE table_schema=DATABASE() ORDER BY table_name;"
  printf '\n[products_columns]\n'
  MYSQL_PWD="$DB_PASSWORD" "${MYSQL_TEST[@]}" -e "SELECT COLUMN_NAME,COLUMN_TYPE,IS_NULLABLE,COLUMN_DEFAULT FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='products' ORDER BY ORDINAL_POSITION;"
  printf '\n[products_indexes]\n'
  MYSQL_PWD="$DB_PASSWORD" "${MYSQL_TEST[@]}" -e "SELECT INDEX_NAME,NON_UNIQUE,SEQ_IN_INDEX,COLUMN_NAME FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='products' ORDER BY INDEX_NAME,SEQ_IN_INDEX;"
  printf '\n[row_counts]\n'
  MYSQL_PWD="$DB_PASSWORD" "${MYSQL_TEST[@]}" -e "SELECT (SELECT COUNT(*) FROM products) AS products,(SELECT COUNT(*) FROM brands) AS brands,(SELECT COUNT(*) FROM categories) AS categories;"
} > "$OUT_DIR/inspection.txt"

MYSQL_PWD="$DB_PASSWORD" mysqldump --protocol=TCP -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --skip-lock-tables --skip-triggers --no-data "$DB_NAME" > "$OUT_DIR/schema.sql"
sha256sum "$OUT_DIR/inspection.txt" "$OUT_DIR/schema.sql" > "$OUT_DIR/SHA256SUMS"
chmod 600 "$OUT_DIR/inspection.txt" "$OUT_DIR/schema.sql" "$OUT_DIR/SHA256SUMS"

printf 'EVIDENCE_CAPTURED=%s\n' "$OUT_DIR"
