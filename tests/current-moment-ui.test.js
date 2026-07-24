import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

test('daily check-in reveals one question at a time',()=>{
  assert.match(app,/const nextKey=nextMissingSignal\(context\)/);
  assert.match(app,/const prompt=nextKey\?questions\[nextKey\]:null/);
  assert.doesNotMatch(app,/\$\{question\('How did you sleep\?'[\s\S]*\$\{question\('Energy'/);
});

test('Why is gated by a real current-day judgement',()=>{
  assert.match(app,/const why=gate\.judgement&&model\.reasons\?\.length/);
});
