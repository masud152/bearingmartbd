# Bearing Mart BD — independent Node.js edition

This branch is the isolated self-hosted migration candidate. It uses the Next.js App Router, Node.js 22.23.2 or later, MySQL/MariaDB, and filesystem media storage. It has no Cloudflare Worker, D1, R2, Vinext, Vite, or Wrangler runtime dependency.

## Local prerequisites

- Node.js 22.23.2 or later
- pnpm
- MySQL or MariaDB

Copy `.env.example` to `.env`, create an empty local database, then run:

```bash
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm admin:bootstrap
pnpm dev
```

The health check is available at `/api/health`. It returns only service status and never credentials.

## Controlled data import

No production D1 or R2 data is included in this repository. When approved exports become available, use the importer scripts against an empty staging database and a new, empty `MEDIA_ROOT`. The import tools preserve IDs/object keys and refuse to overwrite existing data or media.

See [cPanel deployment instructions](docs/CPANEL_NODE_DEPLOYMENT.md).
