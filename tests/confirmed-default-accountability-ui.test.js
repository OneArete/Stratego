import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

test('Practice records an applied confirmed default without routing',()=>{
  const runPhase=app.slice(app.indexOf('function runPhase('),app.indexOf('function finishPractice'));
  assert.match(runPhase,/recordConfirmedAdaptationDefault/);
  assert.match(runPhase,/confirmedDefault\.pattern\.id/);
});

test('reflection accountability includes automatic defaults',()=>{
  assert.match(app,/confirmedDefaults:state\.current\.confirmedAdaptationDefaults/);
  assert.match(app,/hasAppliedAdaptations/);
});

test('Practice can explain a suspended default',()=>{
  assert.match(app,/confirmedDefault\.suspended/);
  assert.match(app,/confirmedDefault\.reason/);
});
