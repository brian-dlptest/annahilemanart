import rss from '@astrojs/rss';
import { getPublishedNewsPosts } from '../data/news';

export async function GET(context) {
  const posts = await getPublishedNewsPosts();

  return rss({
    title: 'Anna Hileman Art — News & Updates',
    description:
      'Project announcements, press features, and behind-the-scenes updates from Anna Hileman Art.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.seoDescription ?? post.data.excerpt,
      pubDate: post.data.publishDate,
      link: `/news/${post.slug}/`,
      categories: [post.data.category, ...post.data.tags],
    })),
    customData:
      '<language>en-us</language><managingEditor>hello@annahileman.com (Anna Hileman Art)</managingEditor>',
  });
}
