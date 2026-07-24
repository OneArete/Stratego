import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

test('daily check-in reveals one question at a time',()=>{
  assert.match(app,/const nextKey=nextMissingSignal\(context\)/);
  assert.match(app,/const prompt=nextKey\?questions\[nextKey\]:null/);
  assert.doesNotMatch(app,/\$\{question\('How did you sleep\?'[\s\S]*\$\{question\('Energy'/);
});

test('Today is organism + one sentence + one action — no Why details, no greeting, no continuity text',()=>{
  // v0.49.0: Today collapsed to exactly organism + h1(judgement) + action button
  assert.match(app,/moment-language.*h1.*\$\{esc\(model\.judgement\)\}/s);
  assert.doesNotMatch(app,/moment-greeting/,'greeting removed — one sentence only');
  assert.doesNotMatch(app,/moment-why/,'Why details removed — architecture invisible to user');
  assert.doesNotMatch(app,/moment-continuity/,'continuity text removed — one action only');
});
