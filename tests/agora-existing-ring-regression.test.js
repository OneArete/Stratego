import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('the Delta glyph remains still during deliberation',()=>{
  assert.match(css,/\.agora-orbit \.delta \.glyph\{\s*animation:none !important;/);
});

test('only the existing SVG ring rotates',()=>{
  assert.match(css,/\.agora-orbit \.delta \.ring\{/);
  assert.match(css,/transform-origin:70px 70px !important;/);
  assert.match(css,/transform-box:view-box !important;/);
});

test('legacy generated orbit layers are disabled',()=>{
  const finalRepair=css.slice(css.lastIndexOf('/* v0.16.4 — Agora ring repair'));
  assert.match(finalRepair,/\.agora-orbit::before,\s*\.agora-orbit::after/);
  assert.match(finalRepair,/content:none !important;/);
});
