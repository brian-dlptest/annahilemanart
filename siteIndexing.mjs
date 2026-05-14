/**
 * SEO indexing: only public production host(s) should be indexed.
 *
 * Staging uses PUBLIC_SITE_URL=https://staging.annahileman.com (see DEPLOY.txt).
 * Production Pages default hostname (annahileman.pages.dev) is allowed so builds
 * that rely on CF_PAGES_URL before custom DNS is ready still emit sitemap + index.
 * Staging project hostname (annahileman-staging.pages.dev) is not listed → noindex.
 */

export function isPrimaryProductionHostname(hostname) {
  if (hostname == null || hostname === '') return true;
  const h = String(hostname).toLowerCase();
  return (
    h === 'annahileman.com' ||
    h === 'www.annahileman.com' ||
    h === 'annahileman.pages.dev'
  );
}
