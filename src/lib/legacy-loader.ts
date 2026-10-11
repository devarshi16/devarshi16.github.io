import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'yaml';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import type { Loader } from 'astro/loaders';
import { slugify } from './content-policy';

export function splitFrontmatter(source: string): { data: Record<string, unknown>; body: string } {
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
  if (!match) throw new Error('Expected YAML frontmatter');
  // One existing book uses an unindented multiline quoted description. Normalize
  // continuation indentation for the strict YAML reader without rewriting its source.
  const yaml = match[1].replace(/^(description:[ \t]*)("[\s\S]*?"[ \t]*)(?=\r?\n[\w_-]+:|$)/m,
    (_, key, value) => key + value.replace(/\n(?=\S)/g, '\n  '));
  return { data: parse(yaml) ?? {}, body: source.slice(match[0].length) };
}

export async function convertLiquid(body: string): Promise<string> {
  let result = body.replace(/\{\{\s*['"]([^'"]+)['"]\s*\|\s*relative_url\s*\}\}/g, '$1')
    .replace(/\{\{\s*site\.baseurl\s*\}\}/g, '');
  if (result.includes('{% include teleoperation-connection.html %}')) {
    result = result.replace('{% include teleoperation-connection.html %}',
      await readFile('_includes/teleoperation-connection.html', 'utf8'));
  }
  if (/\{[{%]/.test(result)) throw new Error('Unconverted Liquid expression in content');
  return result;
}

export function renderLegacyMarkdown(body: string): { html: string; headings: { depth: number; slug: string; text: string }[] } {
  const html = marked.parse(body, { async: false, gfm: true }) as string;
  const headings: { depth: number; slug: string; text: string }[] = [];
  const used = new Map<string, number>();
  const withHeadings = html.replace(/<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/g, (_, depth, attributes, inner) => {
    const text = inner.replace(/<[^>]*>/g, '').replace(/&#8211;/g, '–').replace(/&amp;/g, '&');
    const base = slugify(text) || 'section';
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    const existing = attributes.match(/\bid=["']([^"']+)["']/)?.[1];
    const slug = existing ?? `${base}${count ? `-${count}` : ''}`;
    headings.push({ depth: Number(depth), slug, text });
    return `<h${depth}${attributes}${existing ? '' : ` id="${slug}"`}>${inner}</h${depth}>`;
  });
  const clean = sanitizeHtml(withHeadings, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'iframe', 'video', 'source', 'figure', 'figcaption',
      'link', 'svg', 'g', 'path', 'rect', 'circle', 'line', 'polyline', 'polygon', 'text', 'tspan', 'defs', 'marker', 'title', 'desc'],
    allowedAttributes: {
      '*': ['id', 'class', 'aria-label', 'aria-labelledby', 'aria-hidden', 'role', 'title', 'style'],
      a: ['href', 'target', 'rel', 'download'], img: ['src', 'alt', 'width', 'height', 'loading'],
      iframe: ['src', 'title', 'width', 'height', 'loading', 'allow', 'allowfullscreen', 'frameborder'],
      video: ['controls', 'playsinline', 'preload', 'poster', 'width', 'height', 'aria-label'],
      source: ['src', 'type'], link: ['rel', 'href'],
      svg: ['viewBox', 'xmlns', 'width', 'height', 'aria-labelledby'],
      g: ['transform', 'fill', 'stroke'], path: ['d', 'fill', 'stroke', 'stroke-width', 'marker-end'],
      rect: ['x', 'y', 'width', 'height', 'rx', 'fill', 'stroke'], circle: ['cx', 'cy', 'r', 'fill', 'stroke'],
      line: ['x1', 'y1', 'x2', 'y2', 'stroke', 'stroke-width', 'marker-end'],
      text: ['x', 'y', 'text-anchor', 'fill', 'font-size'], tspan: ['x', 'y', 'dy'],
      marker: ['id', 'viewBox', 'refX', 'refY', 'markerWidth', 'markerHeight', 'orient'],
      polyline: ['points', 'fill', 'stroke'], polygon: ['points', 'fill', 'stroke'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedIframeHostnames: ['video.wordpress.com', 'videopress.com', 'www.youtube.com', 'www.youtube-nocookie.com'],
    allowIframeRelativeUrls: true,
    parser: { lowerCaseAttributeNames: false },
    transformTags: { img: (_, attrs) => ({ tagName: 'img', attribs: { ...attrs, alt: attrs.alt || '', loading: 'lazy' } }) },
  });
  return { html: clean, headings };
}

export function legacyLoader(directory: string, type: 'blogs' | 'books'): Loader {
  return {
    name: `legacy-${type}`,
    async load(context) {
      const sync = async () => {
        context.store.clear();
        const files = (await readdir(directory)).filter(file => /\.(md|markdown)$/.test(file));
        for (const file of files) {
          const filePath = path.join(directory, file);
          const source = await readFile(filePath, 'utf8');
          const { data: original, body } = splitFrontmatter(source);
          const id = file.replace(/\.(md|markdown)$/, '');
          const tags = (original.tags as string[] | undefined) ?? [];
          const category = tags.some(tag => tag.toLowerCase() === 'poetry') ? 'Personal writing'
            : tags.some(tag => /robot|teleop|physical/i.test(tag)) ? 'Robotics'
            : tags.some(tag => /arduino|electronics|raspberry|gamepad/i.test(tag)) ? 'Hardware'
            : tags.some(tag => /regression|one hot|one-hot/i.test(tag)) ? 'Vision & ML' : 'Computing';
          const data = await context.parseData({ id, filePath, data: {
            ...original, tags: [...new Set(tags.map(slugify))], category,
            published: original.published !== false,
            readingMinutes: Math.max(1, Math.ceil(body.replace(/<[^>]*>/g, ' ').split(/\s+/).length / 220)),
          } });
          const converted = await convertLiquid(body);
          const rendered = renderLegacyMarkdown(converted);
          context.store.set({ id, data, body: converted, filePath, digest: context.generateDigest(source),
            rendered: { html: rendered.html, metadata: { headings: rendered.headings } } });
        }
      };
      await sync();
      context.watcher?.on('change', file => { if (file.includes(`/${directory}/`)) void sync(); });
    },
  };
}
