import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

test('Today signal selection does not route and reset scroll',()=>{
  const handler=app.match(/if\(t\.dataset\.key\)\{[^}]+(?:\}[^i]*)?announceStatus\([^;]+;return\}/s)?.[0]||'';
  assert.ok(handler);
  assert.doesNotMatch(handler,/route\('today'\)/);
});

test('Today signal selection updates only its local choice row',()=>{
  assert.match(app,/const row=t\.closest\('\.choice-row'\)/);
  assert.match(app,/row\.querySelectorAll\('button\[data-key\]'\)/);
  assert.match(app,/button\.classList\.toggle\('selected',selected\)/);
});

test('Today signal buttons expose pressed state',()=>{
  assert.match(app,/aria-pressed="\$\{context\[key\]===v\?'true':'false'\}"/);
});

test('Today signal groups expose accessible labels',()=>{
  assert.match(app,/class="choice-row" role="group" aria-label="\$\{title\}"/);
});
