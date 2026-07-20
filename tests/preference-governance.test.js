import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createPreferenceCandidate,
  upsertPreferenceCandidate,
  evaluatePreferenceStatus,
  preferenceInfluence,
  applyPreferenceCorrection,
  expirePreferences,
  contextSimilarity,
  preferenceAudit
} from '../src/core/preference-governance.js';
import { migrateV0110Phase1ToPhase2 } from '../src/core/state-schema.js';

const choice={
  id:'c1',judgementId:'j1',action:'choose-alternative',
  recommendedPracticeId:'walk',selectedPracticeId:'recovery'
};
const context={sleep:3,energy:2,challenge:'body',soreness:'mild',emotionalLoad:'usual'};

test('only explicit alternative choice creates preference candidate',()=>{
  const candidate=createPreferenceCandidate({choice,context});
  assert.equal(candidate.status,'candidate');
  assert.equal(candidate.preferredPracticeId,'recovery');
  assert.throws(()=>createPreferenceCandidate({choice:{...choice,action:'accept'},context}),/Only an explicit alternative/);
});

test('same contextual preference accumulates evidence instead of duplicating',()=>{
  const first=createPreferenceCandidate({choice,context});
  const second=createPreferenceCandidate({choice:{...choice,id:'c2'},context});
  const model=upsertPreferenceCandidate(upsertPreferenceCandidate([],first),second);
  assert.equal(model.length,1);
  assert.equal(model[0].evidenceCount,2);
});

test('three observations can confirm a consistent contextual preference',()=>{
  let model=[];
  for(let i=0;i<3;i++)model=upsertPreferenceCandidate(model,createPreferenceCandidate({choice:{...choice,id:`c${i}`},context}));
  assert.equal(model[0].status,'confirmed');
});

test('candidate preference has deliberately smaller influence than confirmed preference',()=>{
  const candidate=createPreferenceCandidate({choice,context});
  const confirmed={...candidate,status:'confirmed',evidenceCount:3,confirmations:2};
  const c=preferenceInfluence(candidate,context);
  const f=preferenceInfluence(confirmed,context);
  assert.equal(c.applies,true);
  assert.ok(f.weight>c.weight);
});

test('different context prevents preference from influencing judgement',()=>{
  const candidate=createPreferenceCandidate({choice,context});
  const result=preferenceInfluence(candidate,{...context,challenge:'family',soreness:'significant',emotionalLoad:'heavy'});
  assert.equal(result.applies,false);
  assert.ok(result.similarity<.72);
});

test('person can confirm, reject and reopen preference',()=>{
  const candidate=createPreferenceCandidate({choice,context});
  let model=applyPreferenceCorrection([candidate],{preferenceId:candidate.id,action:'confirm'});
  assert.equal(model[0].status,'confirmed');
  model=applyPreferenceCorrection(model,{preferenceId:candidate.id,action:'reject',note:'This was only because I was ill.'});
  assert.equal(model[0].status,'rejected');
  assert.equal(model[0].correction.note,'This was only because I was ill.');
  model=applyPreferenceCorrection(model,{preferenceId:candidate.id,action:'reopen'});
  assert.equal(model[0].status,'candidate');
});

test('stale candidate expires and audit counts states',()=>{
  const candidate={...createPreferenceCandidate({choice,context,at:'2025-01-01T00:00:00.000Z'}),expiresAt:'2025-05-01T00:00:00.000Z'};
  const model=expirePreferences([candidate],new Date('2026-01-01T00:00:00.000Z').getTime());
  assert.equal(model[0].status,'expired');
  assert.deepEqual(preferenceAudit(model),{total:1,candidate:0,confirmed:0,rejected:0,expired:1});
  assert.ok(contextSimilarity(context,context)===1);
});

test('phase 1 state migrates to schema 13 preference model',()=>{
  const migrated=migrateV0110Phase1ToPhase2({schemaVersion:12});
  assert.equal(migrated.schemaVersion,13);
  assert.equal(migrated.productVersion,'0.11.0');
  assert.deepEqual(migrated.preferenceModel,[]);
});
