import test from 'node:test';
import assert from 'node:assert/strict';
import {
  derivePracticeDoseEvidence,
  practiceDoseEvidenceCandidates,
  practiceDoseEvidenceSummary,
  practiceDoseEvidenceAudit
} from '../src/core/practice-session.js';

const now=new Date('2026-07-21T12:00:00Z').getTime();
const entry=(id,index,ratio,status='aligned')=>({
  id,
  completedAt:new Date(now-(index+1)*86400000).toISOString(),
  decision:{practice:{id:'recovery'}},
  practiceContract:{practiceId:'recovery',durationMinutes:10},
  outcomeRecord:{completionRatio:ratio},
  practiceContractOutcome:{
    practiceId:'recovery',
    resolvedAt:new Date(now-(index+1)*86400000).toISOString(),
    status,
    effect:status==='misaligned'?'worse':'right',
    goalFit:status==='aligned'?'strong':'partial',
    burden:'moderate'
  }
});

test('three same-band outcomes form a dose evidence candidate',()=>{
  const history=[entry('a',0,1),entry('b',1,.95),entry('c',2,.9)];
  const items=practiceDoseEvidenceCandidates(history,now);
  assert.equal(items.length,1);
  assert.equal(items[0].doseBand,'full');
});

test('dose bands remain separate',()=>{
  const history=[entry('a',0,1),entry('b',1,.7),entry('c',2,.3)];
  const items=derivePracticeDoseEvidence(history,now);
  assert.equal(items.length,3);
});

test('average actual minutes are derived from planned dose',()=>{
  const history=[entry('a',0,.5),entry('b',1,.7),entry('c',2,.8)];
  const item=practiceDoseEvidenceCandidates(history,now)[0];
  assert.equal(item.averageActualMinutes,6.7);
});

test('mostly aligned direction requires two thirds alignment',()=>{
  const history=[entry('a',0,1,'aligned'),entry('b',1,1,'aligned'),entry('c',2,1,'partially-aligned')];
  assert.equal(practiceDoseEvidenceCandidates(history,now)[0].direction,'mostly-aligned');
});

test('dose evidence has zero automatic influence',()=>{
  const history=[entry('a',0,1),entry('b',1,1),entry('c',2,1)];
  const item=practiceDoseEvidenceCandidates(history,now)[0];
  assert.equal(item.eligibleForDurationChange,false);
  assert.equal(item.eligibleForContractChange,false);
  assert.equal(item.eligibleForJudgementInfluence,false);
});

test('summary and audit state the boundary',()=>{
  const history=[entry('a',0,1),entry('b',1,1),entry('c',2,1)];
  const item=practiceDoseEvidenceCandidates(history,now)[0];
  assert.match(practiceDoseEvidenceSummary(item),/full planned dose/);
  assert.match(practiceDoseEvidenceAudit(history,now).statement,/changes neither duration, contracts nor judgements/);
});
