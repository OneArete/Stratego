import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createFrictionPlan,
  markFrictionEncountered,
  frictionReadiness,
  suggestedResponse,
  canBeginWithFriction,
  reconcileFrictionPlans
} from '../src/core/friction-plan.js';
import { migrateV0120Phase1ToPhase2 } from '../src/core/state-schema.js';

const commitment={id:'c1',judgementId:'j1',practiceId:'walk',status:'active'};

test('creates context-linked friction plan',()=>{
  const plan=createFrictionPlan({commitment,frictionType:'time',description:'Meeting may overrun.',response:'Do five minutes.',fallback:'Two-minute walk.'});
  assert.equal(plan.commitmentId,'c1');
  assert.equal(plan.frictionType,'time');
});

test('unsupported friction type is rejected',()=>{
  assert.throws(()=>createFrictionPlan({commitment,frictionType:'invalid'}),/Unsupported friction type/);
});

test('concrete response and fallback produce readiness',()=>{
  const plan=createFrictionPlan({commitment,description:'Low energy.',response:'Reduce intensity.',fallback:'One round.'});
  const readiness=frictionReadiness(plan);
  assert.equal(readiness.ready,true);
  assert.ok(readiness.score>=.6);
});

test('vague friction plan blocks start',()=>{
  const plan=createFrictionPlan({commitment,description:'Maybe difficult.'});
  const gate=canBeginWithFriction(commitment,plan);
  assert.equal(gate.canBegin,false);
});

test('absence of identified friction does not block start',()=>{
  const gate=canBeginWithFriction(commitment,null);
  assert.equal(gate.canBegin,true);
});

test('friction outcome remains distinct',()=>{
  const plan=createFrictionPlan({commitment,frictionType:'emotion',description:'Avoidance.',response:'Two-minute entry.'});
  const closed=markFrictionEncountered(plan,{outcome:'partly-managed',note:'Started late.'});
  assert.equal(closed.status,'closed');
  assert.equal(closed.outcome,'partly-managed');
  assert.equal(closed.encountered,true);
});

test('suggestions and reconciliation are deterministic',()=>{
  assert.ok(suggestedResponse('uncertainty').includes('first observable action'));
  const plan=createFrictionPlan({commitment,description:'Obstacle',response:'Response'});
  const state=reconcileFrictionPlans({commitments:[commitment],frictionPlans:[plan,{...plan}]});
  assert.equal(state.frictionPlans.length,1);
});

test('phase 1 state migrates to schema 17 friction model',()=>{
  const migrated=migrateV0120Phase1ToPhase2({schemaVersion:16});
  assert.equal(migrated.schemaVersion,17);
  assert.equal(migrated.productVersion,'0.12.0');
  assert.deepEqual(migrated.frictionPlans,[]);
});
