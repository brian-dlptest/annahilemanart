// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

/**
 * Set PUBLIC_SITE_URL in each Cloudflare Pages project:
 * - Staging project: https://staging.annahileman.com
 * - Production project: https://annahileman.com
 * If unset, CF_PAGES_URL is used on Cloudflare builds; local dev defaults to production URL.
 */
function resolveSite() {
  const explicit = process.env.PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (explicit) return explicit;
  if (process.env.CF_PAGES === '1' && process.env.CF_PAGES_URL) {
    return process.env.CF_PAGES_URL.replace(/\/$/, '');
  }
  return 'https://annahileman.com';
}

export default defineConfig({
  site: resolveSite(),
  server: {
    port: 4322,
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
