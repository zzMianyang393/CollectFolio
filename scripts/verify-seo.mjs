import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve('dist');
const productionOrigin = 'https://collectfolio.pages.dev';
const requiredRoutes = [
  '/',
  '/pokemon-tracker',
  '/lego-investment',
  '/watch-collection',
  '/vinyl-value',
  '/insurance-valuation',
  '/blog/pokemon-card-tracking-guide',
  '/blog/lego-collection-value-tracker',
  '/blog/watch-collection-inventory-guide',
  '/blog/vinyl-collection-value-guide',
  '/blog/collectibles-insurance-inventory-template',
  '/blog/mixed-collectibles-portfolio-tracker',
];

const failures = [];
const htmlFiles = [];

const walk = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(path);
  }
};

if (!existsSync(root)) {
  throw new Error('dist does not exist; run npm run build first');
}

walk(root);

const routeForFile = (file) => {
  const path = relative(root, file).replaceAll('\\', '/');
  if (path === 'index.html') return '/';
  if (path.endsWith('/index.html')) return `/${path.slice(0, -'/index.html'.length)}`;
  return `/${path}`;
};

const routeFiles = new Map(htmlFiles.map((file) => [routeForFile(file), file]));

for (const route of requiredRoutes) {
  if (!routeFiles.has(route)) failures.push(`missing required route: ${route}`);
}

for (const [route, file] of routeFiles) {
  if (route === '/404.html') continue;
  const html = readFileSync(file, 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1]?.trim();
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1]?.trim();
  const ogImage = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)?.[1]?.trim();
  const h1Count = (html.match(/<h1\b/gi) ?? []).length;

  if (!title) failures.push(`${route}: missing title`);
  if (!description) failures.push(`${route}: missing description`);
  const expectedCanonical = route === '/' ? `${productionOrigin}/` : `${productionOrigin}${route}/`;
  if (canonical !== expectedCanonical) failures.push(`${route}: canonical must be ${expectedCanonical}`);
  if (!ogImage?.startsWith(productionOrigin)) failures.push(`${route}: og:image must be absolute`);
  if (h1Count !== 1) failures.push(`${route}: expected one h1, found ${h1Count}`);

  for (const href of html.matchAll(/href="(\/[^"]*)"/g)) {
    const target = href[1].split(/[?#]/)[0].replace(/\/$/, '') || '/';
    if (target.startsWith('/_') || target.includes('.')) continue;
    if (!routeFiles.has(target)) failures.push(`${route}: broken internal link ${target}`);
  }
}

const robots = readFileSync(join(root, 'robots.txt'), 'utf8');
if (!robots.includes(`${productionOrigin}/sitemap-index.xml`)) failures.push('robots.txt: invalid sitemap URL');

const sitemapIndex = readFileSync(join(root, 'sitemap-index.xml'), 'utf8');
if (!sitemapIndex.includes(`${productionOrigin}/sitemap-0.xml`)) failures.push('sitemap-index.xml: invalid child sitemap URL');

const sitemap = readFileSync(join(root, 'sitemap-0.xml'), 'utf8');
for (const route of requiredRoutes) {
  const expected = route === '/' ? `${productionOrigin}/` : `${productionOrigin}${route}/`;
  if (!sitemap.includes(`<loc>${expected}</loc>`)) failures.push(`sitemap: missing ${route}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`SEO verification passed for ${routeFiles.size} generated HTML routes.`);
