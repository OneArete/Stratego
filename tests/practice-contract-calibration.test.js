import test from 'node:test';
import assert from 'node:assert/strict';
import {
  derivePracticeContractCalibration,
  practiceContractCalibrationCandidates,
  practiceContractCalibrationSummary,
  practiceContractCalibrationAudit
} from '../src/core/practice-session.js';

const now=new Date('2026-07-21T12:00:00Z').getTime();
const entry=(id,index,status)=>({
  id,
  completedAt:new Date(now-(index+1)*86400000).toISOString(),
  decision:{practice:{id:'recovery'}},
  practiceContract:{practiceId:'recovery'},
  practiceContractOutcome:{
    practiceId:'recovery',
    resolvedAt:new Date(now-(index+1)*86400000).toISOString(),
    expectedEffect:'More steadiness.',
    status,
    effect:status==='misaligned'?'worse':'right',
    goalFit:status==='aligned'?'strong':'partial',
    burden:'moderate'
  }
});

test('three comparable resolved contracts form a calibration candidate',()=>{
  const history=[entry('a',0,'aligned'),entry('b',1,'aligned'),entry('c',2,'partially-aligned')];
  const items=practiceContractCalibrationCandidates(history,now);
  assert.equal(items.length,1);
  assert.equal(items[0].status,'candidate');
});

test('mostly aligned direction requires two thirds alignment',()=>{
  const item=derivePracticeContractCalibration([
    entry('a',0,'aligned'),entry('b',1,'aligned'),entry('c',2,'partially-aligned')
  ],now)[0];
  assert.equal(item.direction,'mostly-aligned');
});

test('frequent mismatch becomes often misaligned',()=>{
  const item=derivePracticeContractCalibration([
    entry('a',0,'misaligned'),entry('b',1,'misaligned'),entry('c',2,'aligned')
  ],now)[0];
  assert.equal(item.direction,'often-misaligned');
});

test('different Practices remain separate',()=>{
  const other=entry('d',3,'aligned');
  other.decision.practice.id='connection';
  other.practiceContract.practiceId='connection';
  other.practiceContractOutcome.practiceId='connection';
  const items=derivePracticeContractCalibration([
    entry('a',0,'aligned'),entry('b',1,'aligned'),entry('c',2,'aligned'),other
  ],now);
  assert.equal(items.length,2);
});

test('calibration candidate has no automatic influence',()=>{
  const item=derivePracticeContractCalibration([
    entry('a',0,'aligned'),entry('b',1,'aligned'),entry('c',2,'aligned')
  ],now)[0];
  assert.equal(item.eligibleForContractChange,false);
  assert.equal(item.eligibleForJudgementInfluence,false);
  assert.equal(item.judgementInfluence,0);
});

test('summary and audit remain explicit',()=>{
  const history=[entry('a',0,'aligned'),entry('b',1,'aligned'),entry('c',2,'aligned')];
  const item=practiceContractCalibrationCandidates(history,now)[0];
  assert.match(practiceContractCalibrationSummary(item),/3 of 3/);
  assert.match(practiceContractCalibrationAudit(history,now).statement,/do not alter future contracts or judgements/);
});
