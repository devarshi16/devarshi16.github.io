export type Publishable = { published?: boolean };

export function canPublish(entry: Publishable, draftPreview = false): boolean {
  return entry.published !== false || draftPreview;
}

export function slugify(value: string): string {
  return value.normalize('NFKD').toLowerCase().trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/[\s-]+/g, '-');
}

export function articleUrl(id: string): string {
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error(`Invalid article ID: ${id}`);
  return `/blog/${id}/`;
}

export function previewAllowed(mode: string, requested: boolean): boolean {
  return mode === 'development' && requested;
}
