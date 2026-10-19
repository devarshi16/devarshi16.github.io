import { getCollection } from 'astro:content';
import { canPublish, previewAllowed, articleUrl, newsUrl } from './content-policy';

export const isDraftPreview = previewAllowed(import.meta.env.MODE, process.env.INCLUDE_DRAFTS === '1');
export async function visibleArticles() {
  return (await getCollection('blogs')).filter(post => canPublish(post.data, isDraftPreview))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
export async function technicalArticles() {
  return (await visibleArticles()).filter(post => post.data.category !== 'Personal writing');
}
export async function personalWriting() {
  return (await visibleArticles()).filter(post => post.data.category === 'Personal writing');
}
export async function visibleNews() {
  return (await getCollection('news')).filter(item => canPublish(item.data, isDraftPreview))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
export async function visibleBooks() {
  return (await getCollection('books')).filter(book => canPublish(book.data, isDraftPreview));
}
export async function allTags() {
  const tags = new Set((await visibleArticles()).flatMap(post => post.data.tags));
  // Keep empty legacy routes; unpublished articles never populate them in production.
  for (const tag of ['robotics', 'teleoperation', 'isaac-sim', 'physical-ai', 'poetry']) tags.add(tag);
  return [...tags].sort();
}
export { articleUrl, newsUrl };
