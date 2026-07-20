import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createFallbackPlan,
  acceptFallback,
  declineFallback,
  startFallback,
  completeFallback,
  abandonFallback,
  fallbackOutcomeRecord,
  fallbackLearningEligibility,
  reconcileFallbackPlans
} from '../src/core/adaptive-fallback.js';
import { migrateV0120Phase2ToPhase3 } from '../src/core/state-schema.js';

const commitment={id:'c1',judgementId:'j1',practiceId:'walk'};
const original={id:'walk',name:'Walk'};
const fallback={id:'walk-fallback',name:'Walk — reduced'};

test('creates fallback distinct from original',()=>{
  const plan=createFallbackPlan({commitment,originalPractice:original,fallbackPractice:fallback,reductionRatio:.5});
  assert.equal(plan.integrity,'distinct-from-original');
  assert.equal(plan.originalPracticeId,'walk');
  assert.equal(plan.fallbackPracticeId,'walk-fallback');
});

test('fallback requires explicit acceptance before start',()=>{
  const plan=createFallbackPlan({commitment,originalPractice:original,fallbackPractice:fallback});
  assert.throws(()=>startFallback(plan),/accepted before start/);
  const started=startFallback(acceptFallback(plan));
  assert.equal(started.status,'started');
});

test('declined fallback remains distinct and inactive',()=>{
  const plan=declineFallback(createFallbackPlan({commitment,originalPractice:original,fallbackPractice:fallback}));
  assert.equal(plan.status,'declined');
});

test('completed fallback records its own completion ratio',()=>{
  let plan=createFallbackPlan({commitment,originalPractice:original,fallbackPractice:fallback});
  plan=startFallback(acceptFallback(plan));
  plan=completeFallback(plan,{completedRatio:.8});
  assert.equal(plan.status,'completed');
  assert.equal(plan.completedRatio,.8);
});

test('abandoned fallback never becomes completed',()=>{
  let plan=createFallbackPlan({commitment,originalPractice:original,fallbackPractice:fallback});
  plan=startFallback(acceptFallback(plan));
  plan=abandonFallback(plan,{completedRatio:.3});
  assert.equal(plan.status,'abandoned');
  assert.equal(plan.integrity,'fallback-abandoned');
});

test('fallback learning is bounded and requires reflection',()=>{
  let plan=createFallbackPlan({commitment,originalPractice:original,fallbackPractice:fallback,reductionRatio:.5});
  plan=startFallback(acceptFallback(plan));
  plan=completeFallback(plan,{completedRatio:1});
  const eligible=fallbackLearningEligibility(plan,'better');
  assert.equal(eligible.eligible,true);
  assert.ok(eligible.weight<=.6);
  assert.equal(fallbackLearningEligibility(plan,null).eligible,false);
});

test('fallback outcome identifies executed practice separately',()=>{
  let plan=createFallbackPlan({commitment,originalPractice:original,fallbackPractice:fallback});
  plan=startFallback(acceptFallback(plan));
  plan=completeFallback(plan,{completedRatio:1});
  const outcome=fallbackOutcomeRecord(plan,'right');
  assert.equal(outcome.wasFallback,true);
  assert.equal(outcome.originalPracticeId,'walk');
  assert.equal(outcome.executedPracticeId,'walk-fallback');
});

test('schema 18 migration and reconciliation are deterministic',()=>{
  const migrated=migrateV0120Phase2ToPhase3({schemaVersion:17});
  assert.equal(migrated.schemaVersion,18);
  assert.deepEqual(migrated.fallbackPlans,[]);
  const plan=createFallbackPlan({commitment,originalPractice:original,fallbackPractice:fallback});
  const reconciled=reconcileFallbackPlans({commitments:[commitment],fallbackPlans:[plan,{...plan}]});
  assert.equal(reconciled.fallbackPlans.length,1);
});
