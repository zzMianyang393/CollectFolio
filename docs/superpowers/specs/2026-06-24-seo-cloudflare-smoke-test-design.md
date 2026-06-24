# CollectFolio SEO Smoke Test and Cloudflare Deployment Design

## Objective

Deploy CollectFolio as an organic-search demand test. The site will measure search impressions, clicks, landing-page traffic, and email signups before the full product is built. Paid traffic is explicitly out of scope.

## Product Boundary

This phase is a marketing and validation site, not the production application. Cloudflare Pages will host the static Astro site, a Pages Function will accept waitlist submissions, and D1 will store signups. A later product may run on a conventional server and may obtain valuation data through public APIs or compliant crawlers.

The site may describe planned capabilities, but copy must not imply that unavailable live data or generated reports already exist. Calls to action will consistently describe a waitlist or upcoming beta.

## SEO Strategy

### Existing commercial-intent clusters

- Pokemon card collection tracker and portfolio tracker
- LEGO collection value and investment tracker
- Watch collection tracker and portfolio manager
- Vinyl collection value and tracker
- Collectibles insurance inventory and valuation report
- Cross-category collectibles portfolio tracker

### Expansion approach

Add a small number of substantial pages rather than programmatically generating thin pages. Each new page must target a distinct intent, answer the query without requiring signup, link to a relevant commercial landing page, and offer the waitlist as a secondary conversion.

Initial supporting topics:

1. Pokemon card collection value tracker and spreadsheet workflow
2. LEGO collection value tracker and investment ROI workflow
3. Watch collection inventory and valuation workflow
4. Vinyl collection value using Discogs and sold-market data
5. Collectibles insurance inventory template and documentation checklist
6. How to track a mixed collectibles portfolio

The existing Pokemon guide may be revised to avoid overlapping the Pokemon landing page. New content will use descriptive titles, unique metadata, article schema, contextual internal links, and visible update dates.

### Technical SEO

- One canonical URL per page
- Absolute Open Graph and canonical URLs
- XML sitemap and RSS output verified after build
- Robots file points to the deployed sitemap
- Unique title, description, H1, and search intent for every indexable page
- Breadcrumb or contextual navigation from articles to their commercial cluster
- No fabricated ratings, usage counts, or testimonials
- Structured data limited to content visible on the page
- Independent production domain configuration via a single site URL value

Because the Cloudflare account has no active zones, the initial canonical host will be `https://collectfolio.pages.dev`. A future custom-domain migration must update the Astro site setting, robots sitemap URL, analytics properties, and redirects together.

## Measurement Design

Google Search Console will be the source of truth for organic queries, impressions, clicks, position, and CTR. Cloudflare Web Analytics will measure page traffic. D1 will measure waitlist conversions.

Each signup will store:

- normalized email
- page-defined content source
- landing path
- referrer when available
- UTM source, medium, and campaign when present
- creation timestamp
- user agent

The form will emit a browser event after a confirmed API success so an analytics provider can record the conversion later. The success message must not claim that a confirmation email was sent unless email delivery is configured and succeeds.

Spam controls will include an actual honeypot field, request validation, same-origin enforcement, and duplicate-email handling. Turnstile is optional and will only be added if spam appears, to avoid unnecessary friction during the initial test.

## Cloudflare Architecture

- Cloudflare Pages project: `collectfolio`
- Production URL: `https://collectfolio.pages.dev`
- Build command: `npm run build`
- Output directory: `dist`
- Pages Function route: `/api/waitlist`
- D1 database: `collectfolio-waitlist`
- D1 binding: `DB`
- Production allowed origin: `https://collectfolio.pages.dev`

Deployment may use Wrangler for the static asset and Functions bundle while the Cloudflare API plugin creates or inspects account resources. No source repository integration is required for the first release.

## Error Handling

- Invalid signup payloads return 400 without storing data.
- Cross-origin requests return 403.
- Duplicate signups return a successful idempotent response.
- D1 failures return 500 and do not display a false success state.
- Optional email-delivery failure does not remove a successfully stored signup, but the UI only reports waitlist success.
- Pages missing required metadata or canonical URLs fail local SEO verification before deployment.

## Verification

Before deployment:

- `npm run check` passes without errors.
- `npm run build` succeeds.
- Automated checks verify titles, descriptions, canonicals, one H1, sitemap inclusion, robots sitemap URL, and internal-link validity for generated HTML.
- Waitlist handler tests cover valid, invalid, duplicate, forbidden-origin, honeypot, and D1-failure cases.

After deployment:

- Homepage and all SEO pages return 200 over HTTPS.
- `robots.txt`, `sitemap-index.xml`, sitemap contents, and `rss.xml` return valid content.
- `/api/waitlist` rejects GET and accepts a controlled test signup.
- The D1 test row is verified without exposing email addresses publicly.
- Canonicals, Open Graph URLs, and form requests use the production host.
- Cloudflare deployment status is successful.

## Completion Criteria

The smoke-test site is complete when the expanded pages are deployed, technical checks pass, the production Pages URL is reachable, the waitlist persists submissions to D1, and the user has the exact URLs and remaining manual steps for Google Search Console verification and sitemap submission.

