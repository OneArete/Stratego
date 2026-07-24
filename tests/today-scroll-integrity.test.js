import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

test('progressive check-in advances directly to the next check-in question',()=>{
  assert.match(app,/setTimeout\(\(\)=>route\('checkin',\{history:'replace'\}\),40\)/);
  assert.doesNotMatch(app,/setTimeout\(\(\)=>route\('today'.*?\),40\);\s*}\s*catch/s);
});

test('check-in choice uses a direct native handler on every button',()=>{
  assert.match(app,/onclick="return window\.strategosSelectSignal\(event,this\)"/);
  assert.match(app,/window\.strategosSelectSignal=/);
  assert.match(app,/commitCheckinChoice\(target\)/);
});

test('Today signal buttons expose pressed state',()=>{
  assert.match(app,/aria-pressed="\$\{context\[key\]===v\?'true':'false'\}"/);
});

test('Today signal groups expose accessible labels',()=>{
  assert.match(app,/class="choice-row" role="group" aria-label="\$\{title\}"/);
});

test('check-in organism is mathematically six-fold symmetric',()=>{
  assert.match(app,/Array\.from\(\{length:6\}/);
  assert.match(app,/index\*60/);
  assert.match(app,/renderSymmetricCheckinOrganism\(\)/);
});
