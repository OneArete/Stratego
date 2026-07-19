import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');
const manifest = JSON.parse(readFileSync(new URL('../manifest.webmanifest', import.meta.url), 'utf8'));

test('registers a versioned service worker and offline shell', () => {
  assert.match(app, /serviceWorker\.register\('\.\/service-worker\.js'/);
  assert.match(sw, /strategos-shell-v0\.9\.0/);
  assert.match(sw, /request\.mode === 'navigate'/);
});

test('provides a persistent polite live region and bounded timer announcements', () => {
  assert.match(index, /id="a11y-status"/);
  assert.match(index, /aria-live="polite"/);
  assert.match(app, /Three seconds remaining in this phase/);
  assert.doesNotMatch(app, /aria-live="assertive"/);
});

test('icon controls and settings switches expose accessible semantics', () => {
  assert.match(app, /aria-label="Open settings"/);
  assert.match(app, /aria-label="End practice"/);
  assert.match(app, /role="switch"/);
  assert.match(app, /aria-checked=/);
});

test('dynamic routes manage focus and reduced motion is supported', () => {
  assert.match(app, /focusCurrentScreen/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /animation:none!important/);
});

test('manifest has a stable id and install scope', () => {
  assert.equal(manifest.id, './');
  assert.equal(manifest.scope, './');
  assert.equal(manifest.display, 'standalone');
});
