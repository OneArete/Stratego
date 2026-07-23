import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const agora=readFileSync(new URL('../src/core/agora.js',import.meta.url),'utf8');

test('Understanding exposes contextual Practice eligibility',()=>{
  assert.ok(app.includes('CONTEXTUAL PRACTICE ELIGIBILITY'));
  assert.ok(app.includes('PRACTICE ELIGIBILITY AUDIT'));
});

test('judgement shows non-eligible library assessment',()=>{
  const judgement=app.slice(app.indexOf('function judgement(){'),app.indexOf('async function requestWakeLock'));
  assert.match(judgement,/assessPracticeEligibility/);
  assert.ok(judgement.includes('Canonical eligibility assessment'));
});

test('Phase 3 governs explicit blocked states through the canonical assessment',()=>{
  assert.match(agora,/assessPracticeEligibility/);
  assert.match(agora,/canonical-practice-eligibility/);
  assert.doesNotMatch(agora,/if\(context\.soreness==='significant'\) blocked\.push/);
});

test('footer remains frozen at four destinations',()=>{
  const nav=app.slice(app.indexOf('const nav='),app.indexOf('const ROUTES='));
  for(const label of ['Today','Understanding','Journey','Settings'])assert.ok(nav.includes(label));
});
