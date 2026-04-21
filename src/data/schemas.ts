/**
 * Structured data helpers for service + article pages.
 *
 * Usage:
 *   import { buildServiceSchema, buildBreadcrumbs } from '../data/schemas';
 *   const serviceSchema = buildServiceSchema(Astro.site, { name: 'Custom Murals', slug: 'murals', ... });
 *   const crumbs = buildBreadcrumbs(Astro.site, [{ name: 'Home', slug: '' }, { name: 'Murals', slug: 'murals' }]);
 */

export type ServiceInput = {
  name: string;
  slug: string;
  description: string;
  serviceType?: string;
  image?: string;
};

const BUSINESS_ID = '#business';

export function buildServiceSchema(site: URL | undefined, input: ServiceInput) {
  const origin = site ? site.origin : 'https://annahileman.com';
  const url = new URL(`/${input.slug}`, origin).href;
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name: input.name,
    description: input.description,
    url,
    provider: { '@id': `${origin}/${BUSINESS_ID}` },
    areaServed: [
      { '@type': 'State', name: 'Colorado' },
      { '@type': 'City', name: 'Denver' },
      { '@type': 'City', name: 'Boulder' },
    ],
  };
  if (input.serviceType) schema.serviceType = input.serviceType;
  if (input.image) {
    schema.image = input.image.startsWith('http')
      ? input.image
      : new URL(input.image, origin).href;
  }
  return schema;
}

export type Crumb = { name: string; slug: string };

export function buildBreadcrumbs(site: URL | undefined, crumbs: Crumb[]) {
  const origin = site ? site.origin : 'https://annahileman.com';
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: new URL(`/${c.slug}`.replace(/\/$/, '') || '/', origin).href,
    })),
  };
}
