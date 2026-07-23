import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('Understanding has dedicated navigation listener',()=>{
  assert.ok(app.includes('button[data-action="understanding"]'));
  assert.ok(app.includes('stopImmediatePropagation'));
  assert.ok(app.includes('route(destination)'));
});
test('Understanding route has recovery boundary',()=>{
  const route=app.slice(app.indexOf('function route('),app.indexOf('function rerenderJudgementAt'));
  assert.ok(route.includes("if(next==='understanding')recoverUnderstanding(error)"));
});
test('legacy explanation records are normalised',()=>{
  assert.ok(app.includes('function normaliseExplainRecordForDisplay'));
  assert.ok(app.includes('observations:Array.isArray'));
  assert.ok(app.includes('changeConditions:Array.isArray'));
});
test('footer is fixed to viewport',()=>{
  assert.ok(css.includes('body #app .tabbar'));
  assert.ok(css.includes('position:fixed !important'));
  assert.ok(css.includes('width:100vw !important'));
  assert.ok(css.includes('z-index:2147483646 !important'));
});
test('footer remains four destinations',()=>{
  const nav=app.slice(app.indexOf('const nav='),app.indexOf('const ROUTES='));
  for(const label of ['Today','Understanding','Journey','Settings'])assert.ok(nav.includes(label));
});
test('runtime imports use repair token',()=>{
  for(const specifier of [...app.matchAll(/from ['"]([^'"]+\.js(?:\?v=[^'"]+)?)['"]/g)].map(match=>match[1]))assert.match(specifier,/\?v=0390p1$/);
});
