# Setup Guide

## Prerequisites

- Node.js >= 18
- npm >= 9
- Cloudflare account with Workers + D1 enabled
- Wrangler CLI

## 1. Clone & Install

```bash
git clone https://github.com/pulpbit/muqeem-caterers.git
cd muqeem-caterers
npm install
```

## 2. Configure Wrangler

Ensure `wrangler.toml` in `apps/backend/` has the correct D1 database IDs:

```toml
[[d1_databases]]
binding = "DB"
database_name = "muqeem-db"
database_id = "6110d36b-ee67-435f-a7f0-930b2e3b643d"
```

## 3. Run Migrations

```bash
cd apps/backend
npx wrangler d1 migrations apply muqeem-db --remote
```

## 4. Run Locally

Start the backend Worker (connects to remote D1):

```bash
cd apps/backend
npm run dev
```

The API will be available at `http://localhost:8787`.

## 5. Frontend

The frontend is plain HTML + CSS + JS. Open `apps/frontend/index.html` in a browser for local development.

For full testing, serve it alongside the API using Cloudflare Pages.

## 6. Deploy

Deploy the backend Worker:

```bash
cd apps/backend
npm run deploy
```

Frontend is auto-deployed via GitHub → Cloudflare Pages integration.

## Project Structure

```
root/
├── apps/
│   ├── backend/      # Hono API (Cloudflare Workers)
│   └── frontend/     # HTML + CSS + JS SPA (Cloudflare Pages)
├── database/
│   └── migrations/   # SQL migration files
├── docs/
├── .gitignore
└── package.json
```
