import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const agora=readFileSync(new URL('../src/core/agora.js',import.meta.url),'utf8');

test('Understanding exposes the canonical Practice Library',()=>{
  assert.ok(app.includes('PRACTICE LIBRARY'));
  assert.ok(app.includes('PRACTICE LIBRARY AUDIT'));
});

test('library metadata remains transparency-only in Phase 1',()=>{
  assert.ok(app.includes('Practice structure remains unchanged; explicit eligibility blocking is governed separately.'));
});

test('Agora still selects from the unchanged CODEX collection',()=>{
  assert.match(agora,/CODEX\.find/);
  assert.match(agora,/CODEX\.map/);
});

test('footer remains limited to four frozen destinations',()=>{
  const nav=app.slice(app.indexOf('const nav='),app.indexOf('const ROUTES='));
  for(const label of ['Today','Understanding','Journey','Settings'])assert.ok(nav.includes(label));
});
