import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('primary router records app routes in browser history',()=>{
  assert.match(app,/history\.pushState/);
  assert.match(app,/history\.replaceState/);
  assert.match(app,/window\.addEventListener\('popstate'/);
});

test('browser back restores an application route without pushing another entry',()=>{
  assert.match(app,/route\(ROUTES\[next\]\?next:'today',\{history:'none'\}\)/);
});

test('startup seeds a stable splash history entry',()=>{
  assert.match(app,/replaceState\(\{strategosRoute:'splash'\}/);
  assert.match(app,/route\('splash',\{history:'none'\}\)/);
});

test('footer is attached to all viewport edges',()=>{
  assert.ok(css.includes('inset:auto 0 0 0 !important;'));
  assert.ok(css.includes('width:100% !important;'));
  assert.ok(css.includes('border-radius:0 !important;'));
});

test('footer cannot inherit floating geometry',()=>{
  assert.ok(css.includes('transform:none !important;'));
  assert.ok(css.includes('max-width:none !important;'));
  assert.ok(css.includes('margin:0 !important;'));
});

test('all four primary destinations remain equal and visible',()=>{
  assert.ok(css.includes('grid-template-columns:repeat(4,minmax(0,1fr)) !important;'));
  for(const index of [1,2,3,4])assert.ok(css.includes(`.tabbar button:nth-child(${index})`));
});

test('screen content reserves footer space',()=>{
  assert.ok(css.includes('padding-bottom:calc(var(--strategos-nav-height) + 28px + env(safe-area-inset-bottom)) !important;'));
});

test('footer remains above Safari compositing layers',()=>{
  assert.ok(css.includes('z-index:2147483000 !important;'));
});
