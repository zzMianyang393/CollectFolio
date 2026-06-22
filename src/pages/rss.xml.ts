import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return rss({
    title: 'CollectFolio Blog',
    description: 'Collector-grade analysis: pricing data, investment returns, insurance strategy, and category-specific guides.',
    site: context.site ?? 'https://collectfolio.pages.dev',
    items: posts
      .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: `/blog/${post.id}/`,
        categories: [post.data.category],
      })),
    customData: '<language>en-us</language>',
    stylesheet: false,
  });
}