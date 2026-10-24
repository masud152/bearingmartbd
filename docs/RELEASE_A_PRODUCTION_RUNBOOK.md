# Release A — controlled production runbook

This runbook is a plan, not deployment authorization. It applies only after a separately approved release window.

## Preconditions

1. Confirm the running revision and service are healthy.
2. Confirm `schema_migrations` contains `0001_initial.sql` only.
3. Confirm the Release A preflight reports every Release A object as absent.
4. Confirm the production role ID is `super-admin`.
5. Build and test the exact release directory before switching the service.
6. Never run `pnpm db:migrate` for this release.

## Backup and restore rehearsal

Create a timestamped dump with the authorized MySQL administration account:

```sh
mysqldump --single-transaction --routines --events bearingmartbd_vps > bearingmartbd_vps-pre-release-a.sql
sha256sum bearingmartbd_vps-pre-release-a.sql > bearingmartbd_vps-pre-release-a.sql.sha256
```

Verify it is non-empty and restore it to a disposable database, never production:

```sh
mysql -e 'CREATE DATABASE bearingmartbd_restore_check'
mysql bearingmartbd_restore_check < bearingmartbd_vps-pre-release-a.sql
mysql -e 'DROP DATABASE bearingmartbd_restore_check'
```

## Migration sequence

From the separately built Release A directory, using the production environment only after approval:

```sh
pnpm release-a:preflight
RELEASE_A_PRODUCTION_CONFIRM=apply-release-a-catalogue pnpm release-a:migrate
RELEASE_A_PRODUCTION_CONFIRM=apply-release-a-catalogue pnpm release-a:seed
pnpm release-a:preflight
```

The migration tool stops on partial schema, incompatible definitions, or a ledger mismatch. It writes `0002_ball_bearing_catalogue.sql` and `0003_manufacturer_master_data.sql` to the existing filename ledger only after each matching schema group is verified.

## Deployment and smoke test

1. Keep the current application directory and environment file unchanged.
2. Build the new release in a separate release directory.
3. Switch only the release pointer or service working directory during the approved window.
4. Restart only `bearingmartbd.service`.
5. Verify homepage, customer account, admin login, `/products/ball-bearings`, `/products/ball-bearings/catalog/6000`, CSS/assets, sitemap, and HTTPS.
6. Confirm no draft or unverified database product appears publicly.

## Rollback

1. Stop only `bearingmartbd.service`.
2. Restore the prior release pointer/working directory.
3. Restart `bearingmartbd.service`.
4. Repeat the smoke test.
5. Do not reverse the additive schema automatically. The prior application remains compatible with nullable extra columns and empty reference rows.
6. Restore the verified database dump only if an approved data-changing action caused a confirmed problem.
