import test from 'node:test';
import assert from 'node:assert/strict';
import {createStructuredReflection,reflectionLearningSignal,reflectionContradiction,reflectionCompleteness,reconcileStructuredReflections} from '../src/core/reflection-integrity.js';
import {migrateV0120ToV0130Phase1} from '../src/core/state-schema.js';

const outcome={id:'o1',judgementId:'j1'};

test('creates structured person reflection',()=>{
  const r=createStructuredReflection({outcomeRecord:outcome,effect:'better',goalFit:'strong',burden:'low',surprise:'none',confidence:'high'});
  assert.equal(r.integrity,'structured-person-reflection');
  assert.equal(r.outcomeRecordId,'o1');
});

test('unsupported reflection values are rejected',()=>{
  assert.throws(()=>createStructuredReflection({outcomeRecord:outcome,effect:'great'}),/Unsupported effect/);
});

test('learning signal is calibrated by confidence, goal fit and burden',()=>{
  const strong=createStructuredReflection({outcomeRecord:outcome,effect:'better',goalFit:'strong',burden:'low',confidence:'high'});
  const weak=createStructuredReflection({outcomeRecord:outcome,effect:'better',goalFit:'poor',burden:'high',confidence:'low'});
  assert.ok(reflectionLearningSignal(strong,{completionRatio:1}).weight>reflectionLearningSignal(weak,{completionRatio:1}).weight);
});

test('fallback reflection remains bounded',()=>{
  const r=createStructuredReflection({outcomeRecord:outcome,effect:'right',goalFit:'strong',burden:'low',confidence:'high'});
  const signal=reflectionLearningSignal(r,{completionRatio:1,wasFallback:true});
  assert.equal(signal.eligible,true);
  assert.ok(signal.weight<=.6);
});

test('blocked friction prevents reflection-led learning',()=>{
  const r=createStructuredReflection({outcomeRecord:outcome,effect:'better',goalFit:'strong',burden:'low'});
  assert.equal(reflectionLearningSignal(r,{completionRatio:1,frictionOutcome:'blocked'}).eligible,false);
});

test('contradictory reflection is preserved',()=>{
  const r=createStructuredReflection({outcomeRecord:outcome,effect:'better',goalFit:'poor',burden:'low',surprise:'material'});
  const c=reflectionContradiction(r);
  assert.equal(c.present,true);
  assert.equal(c.severity,'high');
});

test('completeness and reconciliation are deterministic',()=>{
  const r=createStructuredReflection({outcomeRecord:outcome,effect:'right',goalFit:'unknown',burden:'moderate',surprise:'none',confidence:'medium'});
  assert.equal(reflectionCompleteness(r).complete,false);
  const state=reconcileStructuredReflections({outcomeRecords:[outcome],structuredReflections:[r,{...r}]});
  assert.equal(state.structuredReflections.length,1);
});

test('v0.12.0 state migrates to schema 20 structured reflection shape',()=>{
  const migrated=migrateV0120ToV0130Phase1({schemaVersion:19});
  assert.equal(migrated.schemaVersion,20);
  assert.equal(migrated.productVersion,'0.13.0');
  assert.deepEqual(migrated.structuredReflections,[]);
});
