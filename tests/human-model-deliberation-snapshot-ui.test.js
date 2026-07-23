import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

test('consult preserves a Human Model snapshot before deliberation',()=>{
  const thinking=app.slice(app.indexOf('function thinking'),app.indexOf('function completePersonChoice'));
  assert.match(thinking,/buildHumanModelDeliberationSnapshot/);
  assert.match(thinking,/candidate\.humanModelSnapshot/);
});

test('judgement exposes the evidence boundary',()=>{
  assert.ok(app.includes('Human Model evidence boundary'));
  assert.ok(app.includes('Judgement influence:'));
});

test('Understanding audit exposes deliberation snapshot integrity',()=>{
  assert.ok(app.includes('HUMAN MODEL DELIBERATION SNAPSHOT'));
  assert.ok(app.includes('Rejected evidence influence: 0'));
});

test('Journey preserves the Human Model evidence used at judgement time',()=>{
  assert.ok(app.includes('Human Model evidence at judgement'));
});

test('rejected evidence remains outside active evidence',()=>{
  assert.ok(app.includes('preserved outside the active evidence set'));
});
