# Deployment Guide

Step-by-step deploy to Cloudflare Pages with all integrations.

## Current production resources

- Pages project: `collectfolio`
- Production URL: `https://collectfolio.pages.dev`
- Production branch: `main`
- D1 database: `collectfolio-waitlist`
- D1 binding: `DB`
- Configuration source: `wrangler.jsonc`

Cloudflare Pages is connected to `zzMianyang393/CollectFolio`. A push to `main` triggers the production build and deployment. Apply both SQL files in `migrations/` when creating a replacement database.

The Git integration watches `*` so every change pushed to `main` can trigger a production deployment; preview branch deployments are disabled for this smoke-test project.

## Prerequisites

- GitHub account (push this repo)
- Cloudflare account (you have one)
- Node.js 18+ (for local dev)

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial scaffold"
gh repo create collectfolio --public --source=. --push
```

Or push to any Git host.

## 2. Create Cloudflare Pages project

1. Cloudflare dashboard → Workers & Pages → Create application → Pages → Connect to Git
2. Select your repo
3. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** (leave empty)
   - **Environment variables:** Node version = 20 (under "Advanced")

## 3. Set environment variables

In Pages project → Settings → Environment variables, add:

| Variable | Value | Where to get it |
|----------|-------|-----------------|
| `NODE_VERSION` | `20` | (build setting) |
| `PUBLIC_CF_ANALYTICS_TOKEN` | (token) | See [ANALYTICS.md](./ANALYTICS.md) step 4 |
| `PUBLIC_GSC_VERIFICATION` | (code) | See [ANALYTICS.md](./ANALYTICS.md) step 4 |
| `PUBLIC_CLARITY_ID` | (id) | Optional, see [ANALYTICS.md](./ANALYTICS.md) |
| `RESEND_API_KEY` | (key) | Optional, resend.com |
| `ALLOWED_ORIGIN` | `https://collectfolio.pages.dev` | Or your custom domain |

## 4. Create D1 database

```bash
# Login to Cloudflare
npx wrangler login

# Create D1 database
npx wrangler d1 create collectfolio-waitlist

# Copy the database_id from output, paste into wrangler.toml (create one in project root):
```

Create `wrangler.toml` in project root:

```toml
name = "collectfolio"
compatibility_date = "2024-09-01"
pages_build_output_dir = "./dist"

[[d1_databases]]
binding = "DB"
database_name = "collectfolio-waitlist"
database_id = "PASTE_ID_HERE"
```

Then apply the schema:

```bash
# Local (for testing)
npx wrangler d1 execute collectfolio-waitlist --file=migrations/0001_init.sql

# Remote (production)
npx wrangler d1 execute collectfolio-waitlist --remote --file=migrations/0001_init.sql
```

## 5. Bind D1 to Pages

In Pages project → Settings → Functions → D1 database bindings → Add binding:
- Variable name: `DB`
- D1 database: `collectfolio-waitlist`

## 6. Verify and submit sitemaps

1. Visit `https://collectfolio.pages.dev` — site should load
2. Check `https://collectfolio.pages.dev/sitemap-index.xml` — should show sitemap
3. Check `https://collectfolio.pages.dev/rss.xml` — should show RSS feed
4. Submit sitemap to GSC and Bing (see [ANALYTICS.md](./ANALYTICS.md))

## 7. Custom domain (optional, later)

When you have a real domain:

1. Add domain to Cloudflare (if not already)
2. Pages project → Custom domains → Set up a custom domain
3. Update `site` in `astro.config.mjs`
4. Update `ALLOWED_ORIGIN` env var
5. Update `robots.txt` sitemap URL
6. Update GSC and Bing to use the new domain

## Troubleshooting

### Build fails on Cloudflare

- Check Node version is set to 20
- Check the build output directory is `dist`
- Look at the build log for the specific error

### `/api/waitlist` returns 500

- Verify D1 binding is set (Pages → Settings → Functions → D1 bindings)
- Verify the schema has been applied (`wrangler d1 execute ... --remote --command="SELECT * FROM waitlist"`)
- Check the Functions log in Pages → Logs

### Analytics not showing data

- Wait 1-24 hours after the first deploy
- Verify the token env var is set correctly (no extra spaces)
- Hard-refresh the page (Ctrl+Shift+R) to bypass cache

### Sitemap missing pages

- The sitemap is generated at build time from `src/pages/`
- New pages need a rebuild (push to git)

## Cost

Cloudflare Pages free tier:
- Unlimited bandwidth
- Unlimited requests
- 500 builds/month
- D1: 5GB storage, 5M reads/day, 100K writes/day

Waitlist expectations: even with 10,000 signups, we'd use ~1MB of D1 storage and well under 100K writes. Free tier is more than sufficient for the entire smoke test phase.
