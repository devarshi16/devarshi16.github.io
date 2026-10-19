import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { legacyLoader, newsLoader } from './lib/legacy-loader';

const blogs = defineCollection({ loader: legacyLoader('_blogs', 'blogs'), schema: z.object({
  title: z.string(), date: z.coerce.date(), updated: z.coerce.date().optional(), description: z.string().default(''),
  thumbnail: z.string().optional(), cardImage: z.string().optional(), tags: z.array(z.string()), category: z.string(),
  published: z.boolean(), readingMinutes: z.number(),
}) });
const books = defineCollection({ loader: legacyLoader('_mybooks', 'books'), schema: z.object({
  title: z.string(), description: z.string(), image: z.string(), book_url: z.url(),
  published: z.boolean(), tags: z.array(z.string()), category: z.string(), readingMinutes: z.number(),
}) });
const news = defineCollection({ loader: newsLoader('_news'), schema: z.object({
  title: z.string(), date: z.coerce.date(), kind: z.string(), summary: z.string(), location: z.string().optional(),
  image: z.string().optional(), links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
  published: z.boolean(),
}) });
export const collections = { blogs, books, news };
