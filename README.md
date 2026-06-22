# CollectFolio

Cross-category collectibles portfolio manager — landing page (demand smoke test phase).

## Stack

- **Astro 5** — static-first, SEO-optimized
- **Tailwind CSS 4** — CSS-first config with `@theme`
- **TypeScript** — strict mode
- **Cloudflare Pages** — hosting + Web Analytics
- **D1 + Workers** — waitlist emails (or Tally fallback)

## Local development

Requires Node.js 18+.

```bash
npm install
npm run dev          # http://localhost:4321
```

## Build & preview

```bash
npm run build
npm run preview
```

Output: `dist/` (deployable to any static host).

## Deploy to Cloudflare Pages

### Option A: GitHub integration (recommended)

1. Push this repo to GitHub
2. In Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git
3. Build command: `npm run build`
4. Build output directory: `dist`
5. Node version: 20

### Option B: CLI

```bash
npm run build
npm run deploy
```

## Project structure

```
src/
├── components/         # Astro components
│   ├── Header.astro
│   ├── Footer.astro
│   ├── CategoryCard.astro
│   └── WaitlistForm.astro
├── content/            # Blog posts (Astro Content Collections)
│   └── blog/
├── layouts/
│   └── Layout.astro    # Base layout (head, header, footer)
├── pages/              # Routes
│   ├── index.astro                    # /
│   ├── pokemon-tracker.astro          # /pokemon-tracker
│   ├── lego-investment.astro          # /lego-investment
│   ├── watch-collection.astro         # /watch-collection
│   ├── vinyl-value.astro              # /vinyl-value
│   ├── insurance-valuation.astro      # /insurance-valuation
│   ├── pricing.astro                  # /pricing
│   ├── about.astro                    # /about
│   ├── rss.xml.ts                     # /rss.xml
│   └── blog/
│       ├── index.astro                # /blog
│       └── [slug].astro               # /blog/[slug]
├── styles/
│   └── global.css      # Design tokens + Tailwind entry
└── lib/
    └── seo.ts          # SEO helpers

public/
├── favicon.svg
├── robots.txt
├── _headers            # Cloudflare Pages headers
└── og-default.png      # Open Graph default image (1200x630)
```

## SEO

- `astro.config.mjs` → `site` configures canonical URLs
- `@astrojs/sitemap` → auto-generated `sitemap-index.xml`
- `src/layouts/Layout.astro` → per-page meta tags + OG + Twitter Card
- JSON-LD via `<script type="application/ld+json">` in each page

## Analytics

- **Cloudflare Web Analytics** — auto-injected via Pages snippet (no cookie)
- **Google Search Console** — verify domain, submit sitemap
- **Bing Webmaster Tools** — verify and submit sitemap
- Optional: Plausible / Umami for visual dashboard
- Optional: Microsoft Clarity for heatmaps

## Email waitlist

Two options:
1. **Cloudflare Workers + D1** (self-hosted, recommended for scale)
2. **Tally / Formspree** (zero-code, fastest to ship)

Configured via env vars — see `.env.example`.

## Design constraints

- **No emoji** icons — all icons are custom inline SVG
- **Dual mode UI** — auto-follow system, with manual `.dark`/`.light` toggle hook
- **Editorial style** — Stripe Press / Linear / Vercel Docs as references
- **No stock photos**, no fake "Trusted by" stats, no AI-generic gradients

## Phases

This is the **Demand Smoke Test** phase. We are validating SEO search demand
before investing in the full product. See `collectibles-tracker-prd.md` for
the original (now-superseded) full-product PRD.