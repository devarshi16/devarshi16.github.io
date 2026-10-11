import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { legacyLoader } from './lib/legacy-loader';

const blogs = defineCollection({ loader: legacyLoader('_blogs', 'blogs'), schema: z.object({
  title: z.string(), date: z.coerce.date(), updated: z.coerce.date().optional(), description: z.string().default(''),
  thumbnail: z.string().optional(), cardImage: z.string().optional(), tags: z.array(z.string()), category: z.string(),
  published: z.boolean(), readingMinutes: z.number(),
}) });
const books = defineCollection({ loader: legacyLoader('_mybooks', 'books'), schema: z.object({
  title: z.string(), description: z.string(), image: z.string(), book_url: z.url(),
  published: z.boolean(), tags: z.array(z.string()), category: z.string(), readingMinutes: z.number(),
}) });
export const collections = { blogs, books };
