import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('primary footer contains all four main destinations',()=>{
  assert.match(app,/\['today','◉','Today'\]/);
  assert.match(app,/\['understanding','◇','Understanding'\]/);
  assert.match(app,/\['journey','↗','Journey'\]/);
  assert.match(app,/\['settings','••','Settings'\]/);
});

test('active footer destination exposes aria-current page',()=>{
  assert.match(app,/aria-current="\$\{active===a\?'page':'false'\}"/);
});

test('footer is floating above the browser edge',()=>{
  assert.ok(css.includes('bottom:calc(var(--footer-offset) + env(safe-area-inset-bottom))'));
  assert.ok(css.includes('z-index:120'));
  assert.ok(css.includes('width:min(410px,calc(100% - 20px))'));
});

test('Understanding exposes five progressive disclosure views',()=>{
  for(const view of ['overview','patterns','outcomes','agency','audit']){
    assert.ok(app.includes(`data-understanding-view="${view}"`));
  }
});

test('non-overview Understanding sections are hidden by default',()=>{
  assert.match(app,/outcome-patterns understanding-group is-hidden/);
  assert.match(app,/agency-integrity-summary understanding-group is-hidden/);
  assert.match(app,/correction-audit understanding-group is-hidden/);
});

test('Understanding switcher updates sections without routing or scroll reset',()=>{
  const handler=app.match(/if\(t\.dataset\.understandingView\)\{.*?return\}/s)?.[0]||'';
  assert.ok(handler);
  assert.doesNotMatch(handler,/route\(/);
  assert.match(handler,/section\.classList\.toggle\('is-hidden'/);
});

test('hidden Understanding groups are removed from layout',()=>{
  assert.ok(css.includes('.understanding-group.is-hidden{\n  display:none;'));
});

test('footer labels remain visible with compact icons',()=>{
  assert.ok(css.includes('.tab-icon{'));
  assert.ok(css.includes('flex-direction:column'));
});
