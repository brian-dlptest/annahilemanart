import type { APIRoute } from 'astro';
import { isPrimaryProductionHostname } from '../../siteIndexing.mjs';

export const prerender = true;

const PRODUCTION_SITEMAP = 'https://annahileman.com/sitemap-index.xml';

const productionRobots = [
  'User-agent: *',
  'Allow: /',
  '',
  '# AI crawlers — allow (can be adjusted if desired)',
  'User-agent: GPTBot',
  'Allow: /',
  '',
  'User-agent: ClaudeBot',
  'Allow: /',
  '',
  'User-agent: PerplexityBot',
  'Allow: /',
  '',
  'User-agent: Google-Extended',
  'Allow: /',
  '',
  `Sitemap: ${PRODUCTION_SITEMAP}`,
  '',
].join('\n');

export const GET: APIRoute = ({ site }) => {
  const hostname = site?.hostname ?? '';
  const allowIndexing = isPrimaryProductionHostname(hostname);

  if (!allowIndexing) {
    const body = [
      'User-agent: *',
      'Disallow: /',
      '',
      '# Staging or preview — not for public search indexing.',
      '',
    ].join('\n');
    return new Response(body, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  return new Response(productionRobots, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
