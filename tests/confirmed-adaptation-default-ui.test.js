import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

test('Practice resolves confirmed adaptation only after judgement is already formed',()=>{
  const runPhase=app.slice(app.indexOf('function runPhase('),app.indexOf('function finishPractice'));
  assert.match(runPhase,/resolveConfirmedAdaptationDefault/);
  assert.doesNotMatch(app.slice(0,app.indexOf('function runPhase(')),/resolveConfirmedAdaptationDefault\(/);
});

test('person selection remains higher priority than confirmed default',()=>{
  const runPhase=app.slice(app.indexOf('function runPhase('),app.indexOf('function finishPractice'));
  assert.match(runPhase,/selectedLevel:selectedAdaptation/);
  assert.match(runPhase,/adaptationChoice\.personSelected/);
});

test('UI explains confirmed default and safety override',()=>{
  assert.match(app,/confirmedAdaptationDefaultSummary/);
  assert.match(app,/confirmedDefault\.safetyBlocked/);
});

test('adaptation controls remain available after a confirmed default',()=>{
  assert.match(app,/availableLevels\.map\(level=>/);
});
