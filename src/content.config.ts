import { defineCollection, z } from 'astro:content';

const news = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(6),
    excerpt: z.string().min(40),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(['News', 'Press', 'Studio Journal']),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    featuredImage: z.string().optional(),
    featuredImageAlt: z.string().optional(),
    sourceUrl: z.string().url().optional(),
    sourceLabel: z.string().optional(),
  }),
});

export const collections = {
  news,
};
