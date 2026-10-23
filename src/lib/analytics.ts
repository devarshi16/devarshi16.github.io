/** Hosted pageview collection is optional and never a dependency of the page UI. */
export function goatCounterEndpoint(code: string | undefined): string | null {
  const value = code?.trim().toLowerCase();
  return value && /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(value)
    ? `https://${value}.goatcounter.com/count` : null;
}

export function installAnalytics(
  config: { endpoint: string; productionOrigin: string },
  doc: Document = document,
  view: Window = window,
): () => void {
  let cancelled = false;
  let timer: number | undefined;
  let idle: number | undefined;
  const start = () => {
    try {
      if (cancelled || doc.querySelector('script[data-goatcounter-client]')) return;
      const script = doc.createElement('script');
      script.src = 'https://gc.zgo.at/count.js';
      script.async = true;
      script.dataset.goatcounter = config.endpoint;
      script.dataset.goatcounterClient = 'true';
      script.referrerPolicy = 'strict-origin-when-cross-origin';
      // An unavailable provider or an ad blocker must not affect the site.
      script.onerror = () => { script.onerror = null; };
      doc.head.append(script);
    } catch { /* Analytics is best effort; no retries, blocking fetches, or UI errors. */ }
  };
  const schedule = () => {
    try {
      if (cancelled) return;
      if (typeof view.requestIdleCallback === 'function') {
        idle = view.requestIdleCallback(start, { timeout: 1500 });
      } else {
        timer = view.setTimeout(start, 0);
      }
    } catch { /* Missing browser capabilities must not affect the page. */ }
  };
  try {
    // Keep previews and embedded demos out of the production pageview count.
    if (!config.endpoint || view.location.origin !== config.productionOrigin || view.self !== view.top) {
      return () => {};
    }
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', schedule, { once: true });
    else schedule();
  } catch { return () => {}; }
  return () => {
    cancelled = true;
    doc.removeEventListener('DOMContentLoaded', schedule);
    if (timer !== undefined) view.clearTimeout(timer);
    if (idle !== undefined) view.cancelIdleCallback(idle);
  };
}
