import test from 'node:test';
import assert from 'node:assert/strict';
import { goatCounterEndpoint, installAnalytics } from '../src/lib/analytics';

function browser({ origin = 'https://devarshi16.github.io', ready = 'complete', fail = false, framed = false } = {}) {
  const events = new EventTarget();
  const scripts: any[] = [];
  let pending: (() => void) | undefined;
  const doc = Object.assign(events, {
    readyState: ready,
    querySelector: () => scripts[0] || null,
    createElement: () => ({ dataset: {} }),
    head: { append(script: any) { if (fail) throw new Error('Blocked script'); scripts.push(script); } },
  }) as unknown as Document;
  const top = {};
  const view = {
    location: { origin }, self: framed ? {} : top, top,
    setTimeout(callback: () => void) { pending = callback; return 1; },
    clearTimeout() { pending = undefined; },
  } as unknown as Window;
  return { doc, view, scripts, flush: () => { pending?.(); pending = undefined; } };
}
const config = { endpoint: 'https://portfolio-test.goatcounter.com/count', productionOrigin: 'https://devarshi16.github.io' };

test('missing or malformed analytics configuration never produces a tracking endpoint', () => {
  assert.equal(goatCounterEndpoint(undefined), null);
  assert.equal(goatCounterEndpoint(''), null);
  assert.equal(goatCounterEndpoint('https://example.com/count'), null);
  assert.equal(goatCounterEndpoint('foo" onload="bad'), null);
  assert.equal(goatCounterEndpoint(' Portfolio-Test '), config.endpoint);
});
test('tracking starts asynchronously after parsing, once per document', () => {
  const b = browser({ ready: 'loading' });
  installAnalytics(config, b.doc, b.view);
  b.flush();
  assert.equal(b.scripts.length, 0);
  b.doc.dispatchEvent(new Event('DOMContentLoaded'));
  assert.equal(b.scripts.length, 0);
  b.flush();
  assert.equal(b.scripts.length, 1);
  assert.equal(b.scripts[0].async, true);
  assert.equal(b.scripts[0].dataset.goatcounter, config.endpoint);
  installAnalytics(config, b.doc, b.view);
  b.flush();
  assert.equal(b.scripts.length, 1);
});
test('preview origins and embedded demos do not send production pageviews', () => {
  for (const options of [{ origin: 'http://localhost:4321' }, { framed: true }]) {
    const b = browser(options);
    installAnalytics(config, b.doc, b.view);
    b.flush();
    assert.equal(b.scripts.length, 0);
  }
});
test('blocked loading and provider errors never escape into the page', () => {
  const blocked = browser({ fail: true });
  installAnalytics(config, blocked.doc, blocked.view);
  assert.doesNotThrow(blocked.flush);
  const b = browser();
  installAnalytics(config, b.doc, b.view);
  b.flush();
  assert.doesNotThrow(() => b.scripts[0].onerror(new Event('error')));
});
test('cancelling before collection leaves no tracking request', () => {
  const b = browser();
  const cancel = installAnalytics(config, b.doc, b.view);
  cancel(); b.flush();
  assert.equal(b.scripts.length, 0);
});
