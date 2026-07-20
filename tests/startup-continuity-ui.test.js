import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

test('splash begin uses startup resolver',()=>{
  assert.match(app,/if\(a==='begin'\)\{const destination=resolveStartupDestination\(state\)/);
});

test('startup resolver is separate from explicit continuity resolver',()=>{
  assert.match(app,/resolveContinuityDestination/);
});

test('Today exposes explicit resume action',()=>{
  assert.ok(app.includes('data-action="continue-flow"'));
  assert.ok(app.includes('class="continuity-card"'));
});

test('continue action uses continuity resolver, not startup resolver',()=>{
  assert.match(app,/if\(a==='continue-flow'\)\{const destination=resolveContinuityDestination\(state\)/);
});
