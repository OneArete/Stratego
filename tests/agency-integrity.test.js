import test from 'node:test';
import assert from 'node:assert/strict';
import {
  reconcileAgencyState,
  agencyConsistencySnapshot,
  canCreatePreferenceFromOutcome,
  learningSourceSummary
} from '../src/core/agency-integrity.js';
import { migrateV0110Phase3ToFinal } from '../src/core/state-schema.js';

function baseState(){
  const choice={id:'c1',judgementId:'j1',action:'choose-alternative',recommendedPracticeId:'walk',selectedPracticeId:'recovery',at:'2026-07-19T10:00:00.000Z'};
  const outcome={id:'o1',judgementId:'j1',choiceId:'c1',chosenPracticeId:'recovery',startedPracticeId:'recovery',stage:'reflected',completionRatio:1,reflection:'better',integrity:'completed-and-reflected'};
  return {
    judgements:[{id:'j1',status:'reviewed',validity:{status:'closed'}}],
    choiceLog:[choice],
    outcomeRecords:[outcome],
    preferenceModel:[{id:'p1',sourceChoiceId:'c1',preferredPracticeId:'recovery',recommendedPracticeId:'walk',contextKey:'body|none|usual',status:'candidate'}]
  };
}

test('reconciliation repairs judgement-to-choice link',()=>{
  const {state,report}=reconcileAgencyState(baseState());
  assert.equal(state.judgements[0].personChoice.id,'c1');
  assert.equal(report.judgementChoiceLinksRepaired,1);
});

test('orphan choices and outcomes are removed',()=>{
  const s=baseState();
  s.choiceLog.push({id:'orphan-choice',judgementId:'missing',action:'accept'});
  s.outcomeRecords.push({id:'orphan-outcome',judgementId:'missing',choiceId:'orphan-choice'});
  const {state,report}=reconcileAgencyState(s);
  assert.equal(state.choiceLog.length,1);
  assert.equal(state.outcomeRecords.length,1);
  assert.equal(report.orphanChoicesRemoved,1);
  assert.equal(report.orphanOutcomesRemoved,1);
});

test('duplicate outcome records are removed',()=>{
  const s=baseState();
  s.outcomeRecords.push({...s.outcomeRecords[0]});
  const {state,report}=reconcileAgencyState(s);
  assert.equal(state.outcomeRecords.length,1);
  assert.equal(report.duplicateOutcomeRecordsRemoved,1);
});

test('preference without eligible source outcome is rejected',()=>{
  const s=baseState();
  s.outcomeRecords[0]={...s.outcomeRecords[0],stage:'chosen',startedPracticeId:null,completionRatio:0};
  const {state,report}=reconcileAgencyState(s);
  assert.equal(state.preferenceModel[0].status,'rejected');
  assert.equal(report.invalidPreferenceCandidatesRejected,1);
});

test('eligible reflected override can create preference',()=>{
  const s=baseState();
  assert.equal(canCreatePreferenceFromOutcome(s.choiceLog[0],s.outcomeRecords[0]),true);
  assert.equal(canCreatePreferenceFromOutcome(s.choiceLog[0],{...s.outcomeRecords[0],completionRatio:.2}),false);
});

test('terminal current state is cleared',()=>{
  const s=baseState();
  s.current={decision:{id:'j1'}};
  const {state,report}=reconcileAgencyState(s);
  assert.equal(state.current,null);
  assert.equal(report.impossibleCurrentCleared,true);
});

test('agency snapshot and learning source summary are coherent',()=>{
  const s=baseState();
  const snapshot=agencyConsistencySnapshot(s);
  const learning=learningSourceSummary(s);
  assert.equal(snapshot.status,'coherent');
  assert.equal(snapshot.reflected,1);
  assert.equal(learning.eligible,1);
  assert.ok(learning.statement.includes('1 of 1'));
});

test('phase 3 state migrates to schema 15 agency integrity shape',()=>{
  const migrated=migrateV0110Phase3ToFinal({schemaVersion:14});
  assert.equal(migrated.schemaVersion,15);
  assert.equal(migrated.productVersion,'0.11.0');
  assert.ok(migrated.agencyIntegrity);
});
