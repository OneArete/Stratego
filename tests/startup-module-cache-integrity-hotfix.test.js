import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const agora=readFileSync(new URL('../src/core/agora.js',import.meta.url),'utf8');
const sw=readFileSync(new URL('../service-worker.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');

test('Practice Library uses namespace imports rather than fragile named imports',()=>{
  assert.match(app,/import \* as PracticeLibrary/);
  assert.match(agora,/import \* as PracticeLibrary/);
  assert.doesNotMatch(app,/import \{[^\n]*assessPracticeEligibility[^\n]*\} from '\.\/data\/codex\.js'/);
});

test('transitive Practice Library import is cache-busted',()=>{
  assert.match(app,/codex\.js\?v=0390p1/);
  assert.match(agora,/codex\.js\?v=0390p1/);
});

test('Service Worker uses network-first for mutable modules',()=>{
  assert.match(sw,/url\.pathname\.endsWith\('\.js'\)/);
  assert.match(sw,/fetch\(request, \{cache:'no-store'\}\)/);
  assert.match(sw,/strategos-shell-v0\.39\.0-living-human-graph/);
});

test('entry assets use hotfix cache tokens',()=>{
  assert.match(index,/src\/app\.js\?v=0390p1/);
  assert.match(index,/styles\.css\?v=0390p1/);
});

test('compatibility fallback preserves the significant-soreness safeguard',()=>{
  assert.match(agora,/practice\?\.id==='strength'&&context\.soreness==='significant'/);
});
