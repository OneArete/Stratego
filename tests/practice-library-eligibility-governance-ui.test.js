import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const agora=readFileSync(new URL('../src/core/agora.js',import.meta.url),'utf8');

test('judgement explains canonical eligibility exclusions',()=>{
  assert.ok(app.includes('Excluded by declared conditions'));
  assert.ok(app.includes('Caution states do not alter ranking'));
});

test('Agora imports canonical eligibility assessment',()=>{
  assert.match(agora,/assessPracticeEligibility/);
  assert.match(agora,/canonical-practice-eligibility/);
});

test('manual hard-coded Strength blocker is removed',()=>{
  assert.doesNotMatch(agora,/if\(context\.soreness==='significant'\) blocked\.push/);
});

test('footer remains frozen',()=>{
  const nav=app.slice(app.indexOf('const nav='),app.indexOf('const ROUTES='));
  for(const label of ['Today','Understanding','Journey','Settings'])assert.ok(nav.includes(label));
});
