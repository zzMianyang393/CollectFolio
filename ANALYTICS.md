# Analytics Setup

CollectFolio uses a layered analytics stack. All components are free, privacy-respecting, and have zero impact on SEO.

## Cloudflare Web Analytics (primary)

**What it gives you:** page views, unique visitors, top pages, top referrers, countries (geo distribution), browsers, devices.

**Setup:**

1. Cloudflare dashboard → Analytics → Web Analytics
2. Click "Add a site"
3. Enter `collectfolio.pages.dev`
4. Click "Done" — Cloudflare gives you a beacon token
5. In Cloudflare Pages project → Settings → Environment variables:
   - Variable: `PUBLIC_CF_ANALYTICS_TOKEN`
   - Value: the token from step 4
   - Environment: Production (and Preview if desired)
6. Trigger a redeploy
7. Visit the site — the analytics dashboard will start populating within ~1 hour

**Privacy:** cookie-free, no personal data collection, GDPR/CCPA friendly.

## Google Search Console (search keyword data)

**What it gives you:** which search queries surfaced your pages, impressions, clicks, average position, CTR. This is the only reliable source for "how users found you via search".

**Setup:**

1. https://search.google.com/search-console → Add property
2. Choose "URL prefix" → enter `https://collectfolio.pages.dev`
3. Verification method: **HTML tag**
4. Copy the `content="..."` value
5. In Cloudflare Pages environment variables:
   - Variable: `PUBLIC_GSC_VERIFICATION`
   - Value: the content from step 4
6. Trigger redeploy
7. Return to GSC → click "Verify"
8. Once verified → Sitemaps → submit `https://collectfolio.pages.dev/sitemap-index.xml`

**Daily review:** GSC → Performance → filter by date range (last 7 days is a good default). Top queries, top pages, CTR vs position.

## Bing Webmaster Tools (secondary search data)

**What it gives you:** Bing + Yahoo search data, complementary to GSC.

**Setup:**

1. https://www.bing.com/webmasters → Sign in
2. Add site → `https://collectfolio.pages.dev`
3. Verification: easiest is to import from GSC (one click if signed into same Microsoft account)
4. Submit sitemap: `https://collectfolio.pages.dev/sitemap-index.xml`

## Microsoft Clarity (optional, heatmaps + session replay)

**What it gives you:** click heatmaps, scroll depth, session recordings. Useful for understanding what users do after landing.

**Setup:**

1. https://clarity.microsoft.com → Add project
2. Copy the project ID
3. Cloudflare Pages env vars:
   - Variable: `PUBLIC_CLARITY_ID`
   - Value: project ID from step 2
4. Redeploy

**Privacy note:** Clarity records sessions. Add a disclosure to your privacy policy (already in `/privacy` page template).

## Plausible / Umami (optional, custom dashboard)

If you want a self-hosted dashboard with custom events, replace Cloudflare Web Analytics with Plausible or Umami. Both are lightweight and privacy-respecting.

Skip these for now — Cloudflare Web Analytics + GSC covers the smoke test requirements (PV, geo, search keywords).

## What to monitor daily

| Metric | Source | Why |
|--------|--------|-----|
| Page views | Cloudflare | Are people visiting? |
| Unique visitors | Cloudflare | How broad is the reach? |
| Top referrers | Cloudflare | Where do they come from? |
| Top countries | Cloudflare | Geo distribution |
| Search queries | GSC | Which keywords surface us? |
| Search CTR | GSC | Are titles/descriptions compelling? |
| Average position | GSC | Are we ranking for target keywords? |
| Sitemap errors | GSC | Any indexing issues? |

**The single most important metric for the smoke test:** GSC impressions + clicks for the 6 target keyword clusters. If impressions are climbing but CTR is low, the titles need work. If impressions are flat, the keywords are wrong or the content is not matching search intent.