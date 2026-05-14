// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { isPrimaryProductionHostname } from './siteIndexing.mjs';

/**
 * Set PUBLIC_SITE_URL in each Cloudflare Pages project:
 * - Staging project: https://staging.annahileman.com
 * - Production project: https://annahileman.com
 * If unset, CF_PAGES_URL is used on Cloudflare builds (production project → annahileman.pages.dev).
 * Prefer setting PUBLIC_SITE_URL on production to https://annahileman.com once DNS is live.
 */
function resolveSite() {
  const explicit = process.env.PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (explicit) return explicit;
  if (process.env.CF_PAGES === '1' && process.env.CF_PAGES_URL) {
    return process.env.CF_PAGES_URL.replace(/\/$/, '');
  }
  return 'https://annahileman.com';
}

const resolvedSite = resolveSite();
const hostname = new URL(resolvedSite).hostname;
const useProductionSitemap = isPrimaryProductionHostname(hostname);

export default defineConfig({
  site: resolvedSite,
  server: {
    port: 4322,
  },
  integrations: [...(useProductionSitemap ? [sitemap()] : [])],
  vite: {
    plugins: [tailwindcss()],
  },
});
