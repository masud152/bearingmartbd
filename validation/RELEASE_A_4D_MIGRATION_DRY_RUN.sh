#!/usr/bin/env bash
# Read-only Release A migration dry run after a verified baseline recovery.
set -euo pipefail
umask 077

APP_DIR="/srv/bearingmartbd-release-a-diagnostics/app"
EXPECTED_COMMIT="7e1a5473b4490fee18e980185405dc7e4f37977f"
ENV_FILE="${TEST_ENV_FILE:-/root/bearingmartbd-release-a-test/mysql.env}"
DB_NAME_REQUIRED="bearingmartbd_release_a_test"
DB_USER_REQUIRED="bearingmartbd_release_a"
RELEASE_COLUMNS="'series','basic_model','manufacturer_designation','normalized_manufacturer_designation','seal_shield','clearance','cage','dynamic_load_value','dynamic_load_unit','static_load_value','static_load_unit','speed_rpm','speed_note','source_url','source_title','source_verified_at','source_document','source_document_version','data_verification_status'"
RELEASE_INDEXES="'products_brand_designation_unique','products_basic_model_idx','products_designation_search_idx','products_verification_status_idx'"

die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

test -d "$APP_DIR" || die "isolated diagnostic checkout is missing"
test "$APP_DIR" != "/srv/bearingmartbd/app" || die "production application directory is prohibited"
test "$(runuser -u bearingmart -- git -C "$APP_DIR" rev-parse HEAD)" = "$EXPECTED_COMMIT" || die "unexpected diagnostic commit"
test -z "$(runuser -u bearingmart -- git -C "$APP_DIR" status --porcelain)" || die "diagnostic checkout is not clean"
test -r "$ENV_FILE" || die "restricted test environment file is unreadable"

set -a
. "$ENV_FILE"
set +a
trap 'unset DB_HOST DB_PORT DB_NAME DB_USER DB_PASSWORD MYSQL_PWD' EXIT

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

check_baseline() {
  local ledger column_count index_count
  ledger="$(MYSQL_PWD="$DB_PASSWORD" "${MYSQL_TEST[@]}" -NBe "SELECT GROUP_CONCAT(filename ORDER BY filename SEPARATOR ',') FROM schema_migrations;")"
  column_count="$(MYSQL_PWD="$DB_PASSWORD" "${MYSQL_TEST[@]}" -NBe "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='products' AND column_name IN ($RELEASE_COLUMNS);")"
  index_count="$(MYSQL_PWD="$DB_PASSWORD" "${MYSQL_TEST[@]}" -NBe "SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='products' AND index_name IN ($RELEASE_INDEXES);")"
  test "$ledger" = "0001_initial.sql" || die "unexpected migration ledger"
  test "$column_count" = "0" || die "Release A columns already exist"
  test "$index_count" = "0" || die "Release A indexes already exist"
}

check_baseline
set +e
sudo --preserve-env=DB_HOST,DB_PORT,DB_NAME,DB_USER,DB_PASSWORD -u bearingmart sh -ceu '
  cd /srv/bearingmartbd-release-a-diagnostics/app
  exec node scripts/release-a-catalogue-migrate.mjs
'
MIGRATOR_STATUS=$?
set -e

check_baseline
test "$MIGRATOR_STATUS" = "0" || die "dry-run migrator failed with status $MIGRATOR_STATUS"
printf 'MIGRATION_DRY_RUN_PASS ledger=0001_initial.sql release_a_columns=0 release_a_indexes=0\n'
