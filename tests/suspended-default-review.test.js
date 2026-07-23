import test from 'node:test';
import assert from 'node:assert/strict';
import {
  attachConfirmedDefaultHealth,
  confirmedDefaultHealthSummary,
  confirmedDefaultRecentOutcomes
} from '../src/core/adaptation-patterns.js';

const pattern={id:'p1',reviewStatus:'confirmed'};
const history=[
  {
    id:'a',completedAt:'2026-07-20T10:00:00Z',
    adaptationAccountability:{
      at:'2026-07-20T10:00:00Z',fit:'worse',
      choices:[{phaseName:'Main',level:'regression',source:'confirmed-pattern',patternId:'p1'}]
    }
  },
  {
    id:'b',completedAt:'2026-07-19T10:00:00Z',
    adaptationAccountability:{
      at:'2026-07-19T10:00:00Z',fit:'worse',
      choices:[{phaseName:'Main',level:'regression',source:'confirmed-pattern',patternId:'p1'}]
    }
  }
];

test('suspended confirmed default receives review-required effective status',()=>{
  const result=attachConfirmedDefaultHealth([pattern],history)[0];
  assert.equal(result.effectiveStatus,'review-required');
  assert.equal(result.confirmedDefaultHealth.suspended,true);
});

test('candidate pattern is not evaluated as an automatic default',()=>{
  const result=attachConfirmedDefaultHealth([{id:'p1',reviewStatus:'candidate'}],history)[0];
  assert.equal(result.confirmedDefaultHealth,null);
  assert.equal(result.effectiveStatus,'candidate');
});

test('health summary explains pause and evidence count',()=>{
  const result=attachConfirmedDefaultHealth([pattern],history)[0];
  const summary=confirmedDefaultHealthSummary(result);
  assert.match(summary,/2 of the recent comparable uses/);
  assert.match(summary,/Automatic use is paused/);
});

test('recent outcomes receive person-readable labels',()=>{
  const result=attachConfirmedDefaultHealth([pattern],history)[0];
  const outcomes=confirmedDefaultRecentOutcomes(result);
  assert.equal(outcomes[0].label,'Worse than suggested');
  assert.equal(outcomes.length,2);
});
