import test from 'node:test';
import assert from 'node:assert/strict';
import {
  reconcileFollowThroughState,
  followThroughSnapshot,
  canLearnFromFollowThrough,
  followThroughSummary
} from '../src/core/follow-through-integrity.js';
import { migrateV0120Phase3ToFinal } from '../src/core/state-schema.js';

function state(){
  return {
    commitments:[{id:'c1',judgementId:'j1',choiceId:'ch1',practiceId:'walk',status:'completed'}],
    frictionPlans:[{id:'f1',commitmentId:'c1',status:'closed',outcome:'managed'}],
    fallbackPlans:[{id:'fb1',commitmentId:'c1',frictionPlanId:'f1',originalPracticeId:'walk',fallbackPracticeId:'walk-fallback',status:'completed',completedRatio:1,reductionRatio:.5,integrity:'fallback-completed'}],
    outcomeRecords:[{id:'o1',stage:'reflected',chosenPracticeId:'walk-fallback',startedPracticeId:'walk-fallback',completionRatio:1}]
  };
}

test('reconciliation removes orphan friction and fallback records',()=>{
  const s=state();
  s.frictionPlans.push({id:'orphan-f',commitmentId:'missing'});
  s.fallbackPlans.push({id:'orphan-fb',commitmentId:'missing',originalPracticeId:'a',fallbackPracticeId:'b'});
  const {state:next,report}=reconcileFollowThroughState(s);
  assert.equal(next.frictionPlans.length,1);
  assert.equal(next.fallbackPlans.length,1);
  assert.equal(report.orphanFrictionRemoved,1);
  assert.equal(report.orphanFallbacksRemoved,1);
});

test('duplicates are removed deterministically',()=>{
  const s=state();
  s.frictionPlans.push({...s.frictionPlans[0]});
  s.fallbackPlans.push({...s.fallbackPlans[0]});
  const {state:next,report}=reconcileFollowThroughState(s);
  assert.equal(next.frictionPlans.length,1);
  assert.equal(next.fallbackPlans.length,1);
  assert.equal(report.duplicateFrictionRemoved,1);
  assert.equal(report.duplicateFallbacksRemoved,1);
});

test('fallback identical to original is declined',()=>{
  const s=state();
  s.fallbackPlans[0].fallbackPracticeId='walk';
  const {state:next,report}=reconcileFollowThroughState(s);
  assert.equal(next.fallbackPlans[0].status,'declined');
  assert.equal(report.invalidFallbacksDeclined,1);
});

test('terminal commitment closes stale active friction',()=>{
  const s=state();
  s.frictionPlans[0].status='active';
  const {state:next,report}=reconcileFollowThroughState(s);
  assert.equal(next.frictionPlans[0].status,'closed');
  assert.equal(next.frictionPlans[0].outcome,'not-relevant');
  assert.equal(report.staleActiveFrictionClosed,1);
});

test('completed fallback produces bounded learning',()=>{
  const s=state();
  const result=canLearnFromFollowThrough({
    outcomeRecord:s.outcomeRecords[0],
    frictionPlan:s.frictionPlans[0],
    fallbackPlan:s.fallbackPlans[0]
  });
  assert.equal(result.eligible,true);
  assert.ok(result.weight<=.6);
});

test('blocked friction prevents original-practice learning',()=>{
  const s=state();
  const result=canLearnFromFollowThrough({
    outcomeRecord:{...s.outcomeRecords[0],chosenPracticeId:'walk',startedPracticeId:'walk'},
    frictionPlan:{...s.frictionPlans[0],outcome:'blocked'}
  });
  assert.equal(result.eligible,false);
});

test('snapshot and summary expose reconciliation state',()=>{
  const s=state();
  const snapshot=followThroughSnapshot(s);
  assert.equal(snapshot.completedFallbacks,1);
  assert.equal(snapshot.managedFriction,1);
  assert.ok(followThroughSummary(s).includes('completed fallbacks'));
});

test('phase 3 state migrates to schema 19 follow-through integrity shape',()=>{
  const migrated=migrateV0120Phase3ToFinal({schemaVersion:18});
  assert.equal(migrated.schemaVersion,19);
  assert.equal(migrated.productVersion,'0.12.0');
  assert.ok(migrated.followThroughIntegrity);
});
