import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const companion=readFileSync(new URL('../src/core/living-companion.js',import.meta.url),'utf8');

test('splash begin uses startup resolver',()=>{
  assert.match(app,/if\(a==='begin'\)\{const destination=resolveStartupDestination\(state\)/);
});

test('startup resolver is separate from explicit continuity resolver',()=>{
  assert.match(app,/resolveContinuityDestination/);
});

test('Today exposes continuity as its single primary action',()=>{
  assert.ok(companion.includes("action:'continue-flow'"));
  assert.ok(companion.includes("actionLabel:'Continue'"));
  assert.doesNotMatch(app,/class="continuity-card"/);
});

test('continue action uses continuity resolver, not startup resolver',()=>{
  assert.match(app,/if\(a==='continue-flow'\)\{const destination=resolveContinuityDestination\(state\)/);
});
