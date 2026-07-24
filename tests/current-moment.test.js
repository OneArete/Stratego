import test from 'node:test';
import assert from 'node:assert/strict';
import {CURRENT_MOMENTS,nextMissingSignal,resolveCurrentMoment,currentMomentStatement} from '../src/core/current-moment.js?v=0476p1';

test('a new day resolves to arrival and asks for the first explicit signal',()=>{
  const result=resolveCurrentMoment({contextEvidence:{signals:{},completed:0,sufficient:false},story:{stage:'opened'}});
  assert.equal(result.moment,CURRENT_MOMENTS.ARRIVAL);
  assert.equal(result.nextSignal,'sleep');
  assert.equal(result.action,'focus-signals');
});

test('partial context resumes at the next unanswered signal',()=>{
  assert.equal(nextMissingSignal({sleep:3,energy:2}),'time');
  const result=resolveCurrentMoment({contextEvidence:{signals:{sleep:3},completed:1,sufficient:false}});
  assert.equal(result.moment,CURRENT_MOMENTS.UNDERSTANDING);
  assert.equal(currentMomentStatement(result.moment),'Let’s finish understanding today.');
});

test('closed day has no action',()=>{
  const result=resolveCurrentMoment({story:{stage:'complete'}});
  assert.equal(result.moment,CURRENT_MOMENTS.CLOSURE);
  assert.equal(result.action,null);
});
