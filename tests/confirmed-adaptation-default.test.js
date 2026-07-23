import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveConfirmedAdaptationDefault,
  confirmedAdaptationDefaultSummary
} from '../src/core/adaptation-patterns.js';

const now=new Date('2026-07-20T12:00:00Z').getTime();
const history=['a','b','c'].map((id,index)=>({
  id,
  completedAt:new Date(now-(index+1)*86400000).toISOString(),
  decision:{practice:{id:'recovery'}},
  adaptationAccountability:{
    at:new Date(now-(index+1)*86400000).toISOString(),
    fit:'right',
    choices:[{phaseIndex:0,phaseName:'Main',level:'regression'}]
  }
}));
const patternId='adaptation-pattern-recovery-main-regression';
const reviews=[{patternId,status:'confirmed',source:'person',judgementInfluence:0}];

test('confirmed matching pattern supplies an in-Practice starting level',()=>{
  const result=resolveConfirmedAdaptationDefault({
    history,reviews,practiceId:'recovery',phaseName:'Main',
    availableLevels:['regression','technique'],now
  });
  assert.equal(result.applied,true);
  assert.equal(result.level,'regression');
  assert.equal(result.source,'confirmed-pattern');
});

test('unconfirmed candidate has no default effect',()=>{
  const result=resolveConfirmedAdaptationDefault({
    history,reviews:[],practiceId:'recovery',phaseName:'Main',
    availableLevels:['regression','technique'],now
  });
  assert.equal(result.applied,false);
});

test('pattern remains exact to Practice and phase',()=>{
  const wrongPractice=resolveConfirmedAdaptationDefault({
    history,reviews,practiceId:'strength',phaseName:'Main',
    availableLevels:['regression','technique'],now
  });
  const wrongPhase=resolveConfirmedAdaptationDefault({
    history,reviews,practiceId:'recovery',phaseName:'Close',
    availableLevels:['regression','technique'],now
  });
  assert.equal(wrongPractice.applied,false);
  assert.equal(wrongPhase.applied,false);
});

test('unavailable adaptation level is not invented',()=>{
  const result=resolveConfirmedAdaptationDefault({
    history,reviews,practiceId:'recovery',phaseName:'Main',
    availableLevels:['technique'],now
  });
  assert.equal(result.applied,false);
});

test('current safety regression blocks a confirmed harder default',()=>{
  const harderHistory=history.map(entry=>({
    ...entry,
    adaptationAccountability:{
      ...entry.adaptationAccountability,
      choices:[{phaseIndex:0,phaseName:'Main',level:'progression'}]
    }
  }));
  const harderReviews=[{
    patternId:'adaptation-pattern-recovery-main-progression',
    status:'confirmed'
  }];
  const result=resolveConfirmedAdaptationDefault({
    history:harderHistory,reviews:harderReviews,
    practiceId:'recovery',phaseName:'Main',
    availableLevels:['regression','technique','progression'],
    contextRecommendedLevel:'regression',now
  });
  assert.equal(result.applied,false);
  assert.equal(result.safetyBlocked,true);
});

test('summary states both confirmation and continuing person control',()=>{
  const result=resolveConfirmedAdaptationDefault({
    history,reviews,practiceId:'recovery',phaseName:'Main',
    availableLevels:['regression','technique'],now
  });
  const summary=confirmedAdaptationDefaultSummary(result);
  assert.match(summary,/you confirmed/);
  assert.match(summary,/You can change it/);
});

test('confirmed defaults never claim judgement influence',()=>{
  const result=resolveConfirmedAdaptationDefault({
    history,reviews,practiceId:'recovery',phaseName:'Main',
    availableLevels:['regression','technique'],now
  });
  assert.equal(result.pattern.eligibleForJudgementInfluence,false);
  assert.equal(result.pattern.influence,0);
});
