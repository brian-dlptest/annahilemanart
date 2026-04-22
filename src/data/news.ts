import { getCollection } from 'astro:content';

export const NEWS_PAGE_SIZE = 6;

export function formatNewsDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function toAbsoluteSiteUrl(site: URL | undefined, path: string): string | undefined {
  if (!site) return undefined;
  return new URL(path, site).href;
}

export async function getPublishedNewsPosts() {
  const posts = await getCollection('news', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
}

export function getNewsPageCount(totalPosts: number): number {
  return Math.max(1, Math.ceil(totalPosts / NEWS_PAGE_SIZE));
}

export function getPostsForNewsPage<T>(posts: T[], page: number): T[] {
  const start = (page - 1) * NEWS_PAGE_SIZE;
  return posts.slice(start, start + NEWS_PAGE_SIZE);
}

export function buildNewsPageLink(page: number): string {
  return page <= 1 ? '/news/' : `/news/page/${page}/`;
}
