import test from 'node:test';
import assert from 'node:assert/strict';
import { initComments, COMMENTS_TIMEOUT_MS } from '../src/lib/comments';

// Minimal browser doubles exercise scheduling and provider failure without contacting Giscus.
class ElementDouble extends EventTarget {
  dataset: Record<string, string> = {};
  attributes: Record<string, string> = {};
  children: ElementDouble[] = [];
  parent?: ElementDouble;
  disabled = false;
  hidden = false;
  textContent = '';
  src = '';
  async = false;
  crossOrigin = '';
  onerror: (() => void) | null = null;
  onload: (() => void) | null = null;
  constructor(readonly kind = '') { super(); }
  setAttribute(key: string, value: string) { this.attributes[key] = value; }
  appendChild(child: ElementDouble) { this.children.push(child); child.parent = this; return child; }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this); }
  querySelector(selector: string): ElementDouble | undefined { return this.children.find(child => child.kind === selector); }
}

function fixture({ parsing = false, intersectionObserver = true } = {}) {
  const section = new ElementDouble();
  Object.assign(section.dataset, { repo: 'owner/repo', repoId: 'R_test', category: 'Blog comments', categoryId: 'DIC_test' });
  const host = section.appendChild(new ElementDouble('[data-comments-host]'));
  const button = section.appendChild(new ElementDouble('[data-comments-load]'));
  const status = section.appendChild(new ElementDouble('[data-comments-status]'));
  const document = Object.assign(new EventTarget(), {
    readyState: parsing ? 'loading' : 'complete',
    activeElement: null as ElementDouble | null,
    documentElement: { dataset: { theme: 'light' } },
    createElement: (tag: string) => new ElementDouble(tag),
  });
  const timers = new Map<number, () => void>();
  let timerId = 0;
  let callback: IntersectionObserverCallback | undefined;
  let observerDisconnected = false;
  const media = Object.assign(new EventTarget(), { matches: false });
  const window = Object.assign(new EventTarget(), {
    matchMedia: () => media,
    setTimeout: (fn: () => void, delay: number) => { assert.equal(delay, COMMENTS_TIMEOUT_MS); timers.set(++timerId, fn); return timerId; },
    clearTimeout: (id: number) => timers.delete(id),
    IntersectionObserver: intersectionObserver ? class {
      constructor(fn: IntersectionObserverCallback, options: IntersectionObserverInit) {
        callback = fn; assert.equal(options.rootMargin, '300px 0px');
      }
      observe(target: ElementDouble) { assert.equal(target, section); }
      disconnect() { observerDisconnected = true; }
    } : undefined,
  });
  const start = () => initComments(section as unknown as HTMLElement, {
    document: document as unknown as Document, window: window as unknown as Window & typeof globalThis,
  });
  const nearViewport = (isIntersecting = true) => callback?.([{ isIntersecting }] as IntersectionObserverEntry[], {} as IntersectionObserver);
  const expire = () => { for (const [id, fn] of [...timers]) { timers.delete(id); fn(); } };
  const scripts = () => host.children.filter(child => child.kind === 'script');
  const post = (data: unknown, source: unknown, origin = 'https://giscus.app') => {
    const event = new Event('message'); Object.assign(event, { data, source, origin }); window.dispatchEvent(event);
  };
  const addFrame = () => {
    const messages: unknown[] = [];
    const frame = Object.assign(new ElementDouble('iframe.giscus-frame'), {
      contentWindow: { postMessage: (message: unknown, origin: string) => { assert.equal(origin, 'https://giscus.app'); messages.push(message); } },
      src: 'https://giscus.app/en/widget',
    });
    host.appendChild(frame);
    return { frame, messages };
  };
  return { section, host, button, status, document, window, media, start, nearViewport, expire, scripts, post, addFrame, timers, disconnected: () => observerDisconnected };
}

test('comments make no provider request before DOM parsing and viewport proximity', () => {
  const f = fixture({ parsing: true }); f.start();
  f.nearViewport(); f.button.dispatchEvent(new Event('click'));
  assert.equal(f.scripts().length, 0);
  f.document.dispatchEvent(new Event('DOMContentLoaded'));
  f.nearViewport(false); assert.equal(f.scripts().length, 0);
  f.nearViewport(); assert.equal(f.scripts().length, 1);
  assert.equal(f.scripts()[0].async, true);
  assert.equal(f.scripts()[0].dataset.mapping, 'pathname');
  assert.equal(f.scripts()[0].dataset.strict, '1');
  assert.equal(f.disconnected(), true);
});

test('manual fallback loads without IntersectionObserver and repeated initialization does not duplicate requests', () => {
  const f = fixture({ intersectionObserver: false }); f.start(); f.start();
  assert.equal(f.scripts().length, 0);
  assert.match(f.status.textContent, /Select Load comments/);
  f.button.dispatchEvent(new Event('click')); f.button.dispatchEvent(new Event('click'));
  assert.equal(f.scripts().length, 1);
});

test('blocked script shows a recoverable error and explicit retry replaces only the failed request', () => {
  const f = fixture(); f.start(); f.nearViewport();
  f.scripts()[0].onerror?.();
  assert.equal(f.section.dataset.commentsState, 'error');
  assert.equal(f.button.disabled, false); assert.equal(f.button.textContent, 'Retry comments');
  assert.match(f.status.textContent, /GitHub/); assert.equal(f.timers.size, 0);
  f.button.dispatchEvent(new Event('click'));
  assert.equal(f.scripts().length, 1); assert.equal(f.section.dataset.commentsState, 'loading');
});

test('a slow client times out without blocking the article; retries reuse its pending request and it can recover', () => {
  const f = fixture(); f.start(); f.nearViewport(); const pending = f.scripts()[0];
  f.expire(); assert.equal(f.section.dataset.commentsState, 'error');
  f.button.dispatchEvent(new Event('click'));
  assert.equal(f.scripts()[0], pending); assert.equal(f.scripts().length, 1);
  const { frame } = f.addFrame();
  f.post({ giscus: { resizeHeight: 420 } }, frame.contentWindow);
  assert.equal(f.section.dataset.commentsState, 'ready'); assert.equal(f.timers.size, 0);
});

test('only the provider iframe can mark comments ready; first-comment empty state works and focus stays put', () => {
  const f = fixture(); f.start(); f.button.dispatchEvent(new Event('click'));
  f.document.activeElement = f.button;
  const { frame } = f.addFrame();
  f.post({ giscus: { resizeHeight: 420 } }, {}, 'https://giscus.app');
  f.post({ giscus: { resizeHeight: 420 } }, frame.contentWindow, 'https://example.com');
  assert.equal(f.section.dataset.commentsState, 'loading');
  f.post({ giscus: { error: 'Discussion not found' } }, frame.contentWindow);
  f.post({ giscus: { resizeHeight: 420 } }, frame.contentWindow);
  assert.equal(f.section.dataset.commentsState, 'ready');
  assert.equal(f.button.hidden, false); assert.equal(f.document.activeElement, f.button);
});

test('provider errors remain visible even if its error screen emits a resize event', () => {
  const f = fixture(); f.start(); f.nearViewport(); const { frame } = f.addFrame();
  f.post({ giscus: { error: 'Repository not found' } }, frame.contentWindow);
  f.post({ giscus: { resizeHeight: 420 } }, frame.contentWindow);
  assert.equal(f.section.dataset.commentsState, 'error');
});

test('comments follow portfolio theme changes without reloading the provider; cleanup stops listeners', () => {
  const f = fixture(); const cleanup = f.start(); f.nearViewport(); const { frame, messages } = f.addFrame();
  f.post({ giscus: { resizeHeight: 420 } }, frame.contentWindow);
  f.document.documentElement.dataset.theme = 'dark';
  f.document.dispatchEvent(new Event('portfolio:theme'));
  assert.deepEqual(messages.at(-1), { giscus: { setConfig: { theme: 'dark' } } });
  assert.equal(f.scripts().length, 1);
  const count = messages.length; cleanup();
  f.document.dispatchEvent(new Event('portfolio:theme')); assert.equal(messages.length, count);
  assert.equal(f.timers.size, 0);
});

test('missing provider IDs leaves comments disabled with no browser effects', () => {
  const f = fixture(); delete f.section.dataset.categoryId; f.start(); f.nearViewport();
  f.button.dispatchEvent(new Event('click')); assert.equal(f.scripts().length, 0);
  assert.equal(f.section.dataset.commentsInitialized, undefined);
});
