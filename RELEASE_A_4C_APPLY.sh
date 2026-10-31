#!/usr/bin/env bash
set -Eeuo pipefail
fail(){ echo "STOP: $*" >&2; exit 1; }
APP_DIR="/srv/bearingmartbd-release-a-validation-source/app"
ENV_FILE="/root/bearingmartbd-release-a-test/mysql.env"
CLIENT="/root/bearingmartbd-release-a-test/mysql-client.cnf"
COMMIT="1fb2febafdcc257c190680676b476b1743271fc8"
EXPECTED_DB_NAME="bearingmartbd_release_a_test" EXPECTED_DB_USER="bearingmartbd_release_a" EXPECTED_DB_HOST="127.0.0.1" EXPECTED_DB_PORT="3306"
COLUMNS=(basic_model cage clearance data_verification_status dynamic_load_unit dynamic_load_value manufacturer_designation normalized_manufacturer_designation seal_shield series source_document source_document_version source_title source_url source_verified_at speed_note speed_rpm static_load_unit static_load_value)
EXPECTED_COLUMNS="$(printf '%s\n' "${COLUMNS[@]}" | sort | paste -sd, -)"
EXPECTED_INDEXES="products_basic_model_idx:1:basic_model|products_brand_designation_unique:0:brand_id,normalized_manufacturer_designation|products_designation_search_idx:1:normalized_manufacturer_designation|products_verification_status_idx:1:data_verification_status"
test "$(sudo -n -u bearingmart -- git -C "$APP_DIR" rev-parse HEAD)" = "$COMMIT" || fail "unexpected source commit"
test -z "$(sudo -n -u bearingmart -- git -C "$APP_DIR" status --porcelain)" || fail "source checkout is not clean"
test -r "$ENV_FILE" && test -r "$CLIENT" || fail "restricted credential files are unavailable"
set -a; . "$ENV_FILE"; set +a; trap 'unset DB_PASSWORD' EXIT
: "${DB_HOST:?}"; : "${DB_PORT:?}"; : "${DB_NAME:?}"; : "${DB_USER:?}"; : "${DB_PASSWORD:?}"
test "$DB_HOST" = "$EXPECTED_DB_HOST" && test "$DB_PORT" = "$EXPECTED_DB_PORT" && test "$DB_NAME" = "$EXPECTED_DB_NAME" && test "$DB_USER" = "$EXPECTED_DB_USER" || fail "unexpected database identity"
MYSQL=(mysql --defaults-extra-file="$CLIENT" --protocol=TCP --host="$DB_HOST" --port="$DB_PORT" --user="$DB_USER" --database="$DB_NAME")
ID="$("${MYSQL[@]}" -NBe "SELECT CONCAT(CURRENT_USER(),'|',DATABASE());")"; test "$ID" = "$DB_USER@$DB_HOST|$DB_NAME" || fail "restricted database identity mismatch"
LEDGER="$("${MYSQL[@]}" -NBe "SELECT GROUP_CONCAT(filename ORDER BY filename SEPARATOR ',') FROM schema_migrations;")"; test "$LEDGER" = "0001_initial.sql" || fail "unexpected pre-apply ledger"
PRE_COLUMNS="$("${MYSQL[@]}" -NBe "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='products' AND column_name IN ('series','basic_model','manufacturer_designation','normalized_manufacturer_designation','seal_shield','clearance','cage','dynamic_load_value','dynamic_load_unit','static_load_value','static_load_unit','speed_rpm','speed_note','source_url','source_title','source_verified_at','source_document','source_document_version','data_verification_status');")"; test "$PRE_COLUMNS" = 0 || fail "Release A columns already exist"
PRE_INDEXES="$("${MYSQL[@]}" -NBe "SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='products' AND index_name IN ('products_brand_designation_unique','products_basic_model_idx','products_designation_search_idx','products_verification_status_idx');")"; test "$PRE_INDEXES" = 0 || fail "Release A indexes already exist"
echo "RUN: applying only Release A migrations 0002 and 0003"
unset RELEASE_A_PRODUCTION_CONFIRM
set +e
env -i PATH="$PATH" HOME="/root" DB_HOST="$DB_HOST" DB_PORT="$DB_PORT" DB_NAME="$DB_NAME" DB_USER="$DB_USER" DB_PASSWORD="$DB_PASSWORD" APP_ENV="release_a_validation" sudo -n -u bearingmart --preserve-env=DB_HOST,DB_PORT,DB_NAME,DB_USER,DB_PASSWORD,APP_ENV /bin/bash -c 'cd /srv/bearingmartbd-release-a-validation-source/app && exec /usr/bin/node scripts/release-a-catalogue-migrate.mjs --apply'
MIGRATOR_STATUS=$?
set -e; unset DB_PASSWORD
POST=0
LEDGER="$("${MYSQL[@]}" -NBe "SELECT GROUP_CONCAT(filename ORDER BY filename SEPARATOR ',') FROM schema_migrations;")" || POST=1
COLS="$("${MYSQL[@]}" -NBe "SELECT GROUP_CONCAT(column_name ORDER BY column_name SEPARATOR ',') FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='products' AND column_name IN ('series','basic_model','manufacturer_designation','normalized_manufacturer_designation','seal_shield','clearance','cage','dynamic_load_value','dynamic_load_unit','static_load_value','static_load_unit','speed_rpm','speed_note','source_url','source_title','source_verified_at','source_document','source_document_version','data_verification_status');")" || POST=1
IDX="$("${MYSQL[@]}" -NBe "SELECT GROUP_CONCAT(CONCAT(index_name,':',non_unique,':',column_list) ORDER BY index_name SEPARATOR '|') FROM (SELECT index_name,MIN(non_unique) non_unique,GROUP_CONCAT(column_name ORDER BY seq_in_index SEPARATOR ',') column_list FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='products' AND index_name IN ('products_brand_designation_unique','products_basic_model_idx','products_designation_search_idx','products_verification_status_idx') GROUP BY index_name) x;")" || POST=1
ROWS="$("${MYSQL[@]}" -NBe "SELECT CONCAT((SELECT COUNT(*) FROM products),'|',(SELECT COUNT(*) FROM brands),'|',(SELECT COUNT(*) FROM categories));")" || POST=1
echo "MIGRATOR_EXIT_STATUS=$MIGRATOR_STATUS"; echo "LEDGER_AFTER=${LEDGER:-<query-failed>}"; echo "COLUMNS_AFTER=${COLS:-<query-failed>}"; echo "INDEXES_AFTER=${IDX:-<query-failed>}"; echo "PRODUCTS_BRANDS_CATEGORIES=${ROWS:-<query-failed>}"
test "${LEDGER:-}" = "0001_initial.sql,0002_ball_bearing_catalogue.sql,0003_manufacturer_master_data.sql" || POST=1
test "${COLS:-}" = "$EXPECTED_COLUMNS" || POST=1
test "${IDX:-}" = "$EXPECTED_INDEXES" || POST=1
test "${ROWS:-}" = "0|0|0" || POST=1
if [ "$MIGRATOR_STATUS" -ne 0 ]; then echo "STOP: migration failed; post-checks completed. Do not retry or roll back automatically." >&2; exit "$MIGRATOR_STATUS"; fi
if [ "$POST" -ne 0 ]; then fail "post-apply verification failed; do not retry or roll back automatically"; fi
echo "PASS: only Release A migrations 0002 and 0003 were applied to $DB_NAME"
