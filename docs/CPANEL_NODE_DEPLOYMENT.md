# Bearing Mart BD — cPanel Node deployment

This branch is independent of ChatGPT Sites. Create a separate Node application and MySQL database for staging before any production cutover.

## cPanel application settings

- Node.js: 22.23.2
- Application root: `/home/bearingmartbd/nodeapps/bearingmartbd-staging`
- Startup file: `app.cjs`
- Application URL: staging hostname only

## Build and start

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm build
corepack pnpm db:migrate
corepack pnpm admin:bootstrap
node app.cjs
```

Copy `.env.example` to a protected `.env` file in the application root. Keep `MEDIA_ROOT` outside `public_html` and grant it only to the cPanel account. Confirm `GET /api/health` returns `{"status":"ok","database":"connected"}` before testing the application.

## Data import

Do not run imports against production before an approved D1 export and R2 export exist. Import into staging first, preserve all IDs/object keys, compare row and object counts, and validate protected customer-file access before any DNS cutover.

The import utilities deliberately refuse to overwrite data or media already present:

```bash
corepack pnpm import:d1 -- /protected/imports/approved-d1-export.json
MEDIA_ROOT=/home/bearingmartbd/private_storage/bearingmartbd-staging \
  corepack pnpm import:r2 -- /protected/imports/approved-r2-manifest.json /protected/imports/r2-files
```
