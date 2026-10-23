const GISCUS_ORIGIN = 'https://giscus.app';
export const COMMENTS_TIMEOUT_MS = 20_000;

type CommentBrowser = { document: Document; window: Window & typeof globalThis };

/** Load the optional provider only after parsing and approaching the comments section. */
export function initComments(section: HTMLElement, browser?: CommentBrowser): () => void {
  if (section.dataset.commentsInitialized) return () => {};
  const document = browser?.document ?? section.ownerDocument;
  const window = browser?.window ?? document.defaultView as Window & typeof globalThis;
  const host = section.querySelector<HTMLElement>('[data-comments-host]');
  const button = section.querySelector<HTMLButtonElement>('[data-comments-load]');
  const status = section.querySelector<HTMLElement>('[data-comments-status]');
  if (!window || !host || !button || !status || !section.dataset.repoId || !section.dataset.categoryId) return () => {};
  section.dataset.commentsInitialized = 'true';

  let state: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
  let script: HTMLScriptElement | undefined;
  let scriptFailed = false;
  let scriptCompleted = false;
  let providerError = false;
  let parsed = document.readyState !== 'loading';
  let timer: number | undefined;
  let observer: IntersectionObserver | undefined;
  const media = window.matchMedia?.('(prefers-color-scheme: dark)');
  const theme = () => document.documentElement.dataset.theme || (media?.matches ? 'dark' : 'light');
  const frame = () => host.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
  const clearTimer = () => { if (timer !== undefined) window.clearTimeout(timer); timer = undefined; };
  const sendTheme = () => {
    if (script) script.dataset.theme = theme();
    try { frame()?.contentWindow?.postMessage({ giscus: { setConfig: { theme: theme() } } }, GISCUS_ORIGIN); } catch { /* Provider failure must not affect the article. */ }
  };
  const setState = (next: typeof state) => {
    state = next;
    section.dataset.commentsState = next;
    host.setAttribute('aria-busy', String(next === 'loading'));
    button.disabled = next === 'loading' || next === 'ready';
    // A reader using the manual button keeps their focus when the iframe becomes ready.
    button.hidden = next === 'ready' && document.activeElement !== button;
    button.textContent = next === 'error' ? 'Retry comments' : next === 'loading' ? 'Loading comments…' : next === 'ready' ? 'Comments loaded' : 'Load comments';
    status.textContent = next === 'error'
      ? 'Comments could not load. Retry, or read and comment on GitHub below.'
      : next === 'loading' ? 'Loading comments from GitHub…'
      : next === 'ready' ? 'Sign in with GitHub to leave a comment.'
      : 'Comments load as you reach this section. You can also load them now.';
  };
  const fail = () => { clearTimer(); setState('error'); };
  const load = () => {
    if (!parsed || state === 'loading' || state === 'ready') return;
    observer?.disconnect();
    setState('loading');
    providerError = false;
    clearTimer();
    timer = window.setTimeout(fail, COMMENTS_TIMEOUT_MS);
    try {
      if (script && !scriptFailed && (!scriptCompleted || frame())) {
        // Never duplicate a pending client script. If the iframe stalled, retry just it.
        const existing = frame();
        if (existing) existing.src = existing.src;
        return;
      }
      script?.remove();
      scriptFailed = false;
      scriptCompleted = false;
      script = document.createElement('script');
      script.src = `${GISCUS_ORIGIN}/client.js`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      Object.assign(script.dataset, {
        repo: section.dataset.repo, repoId: section.dataset.repoId,
        category: section.dataset.category, categoryId: section.dataset.categoryId,
        mapping: 'pathname', strict: '1', reactionsEnabled: '1', emitMetadata: '0',
        inputPosition: 'bottom', theme: theme(), lang: 'en',
      });
      script.onerror = () => { scriptFailed = true; fail(); };
      script.onload = () => { scriptCompleted = true; };
      // Script load is not success: wait for a message from its isolated iframe.
      host.appendChild(script);
    } catch { scriptFailed = true; fail(); }
  };
  const onMessage = (event: MessageEvent) => {
    const currentFrame = frame();
    if (!currentFrame || event.origin !== GISCUS_ORIGIN || event.source !== currentFrame.contentWindow) return;
    const data = event.data?.giscus;
    if (!data || typeof data !== 'object') return;
    if (typeof data.error === 'string' && !data.error.includes('Discussion not found')) {
      providerError = true; fail(); return;
    }
    if (!providerError && Number.isFinite(data.resizeHeight) && data.resizeHeight > 0) {
      // An empty discussion is valid; Giscus creates it on the first comment/reaction.
      const wasReady = state === 'ready';
      clearTimer(); setState('ready');
      if (!wasReady) sendTheme();
    }
  };
  const start = () => {
    parsed = true;
    if (typeof window.IntersectionObserver === 'function') {
      try {
        observer = new window.IntersectionObserver(entries => {
          if (state === 'idle' && entries.some(entry => entry.isIntersecting)) load();
        }, { rootMargin: '300px 0px' });
        observer.observe(section);
        return;
      } catch { observer?.disconnect(); }
    }
    status.textContent = 'Select Load comments to read or join the discussion.';
  };
  button.addEventListener('click', load);
  window.addEventListener('message', onMessage);
  document.addEventListener('portfolio:theme', sendTheme);
  media?.addEventListener('change', sendTheme);
  setState('idle');
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();

  return () => {
    clearTimer(); observer?.disconnect();
    button.removeEventListener('click', load);
    window.removeEventListener('message', onMessage);
    document.removeEventListener('portfolio:theme', sendTheme);
    document.removeEventListener('DOMContentLoaded', start);
    media?.removeEventListener('change', sendTheme);
    if (script) { script.onerror = null; script.onload = null; }
    delete section.dataset.commentsInitialized;
  };
}
