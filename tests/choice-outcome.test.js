import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createOutcomeRecord,
  markOutcomeStarted,
  markOutcomeCompleted,
  markOutcomeAbandoned,
  attachOutcomeReflection,
  learningEligibility,
  reconcileOutcomeRecords,
  OUTCOME_STAGES
} from '../src/core/choice-outcome.js';
import { migrateV0110Phase2ToPhase3 } from '../src/core/state-schema.js';

const judgement={id:'j1',practice:{id:'walk'}};
const choice={id:'c1',judgementId:'j1',action:'accept',recommendedPracticeId:'walk',selectedPracticeId:'walk',at:'2026-07-19T10:00:00.000Z'};

test('choice creates outcome record without claiming execution',()=>{
  const record=createOutcomeRecord({judgement,choice});
  assert.equal(record.stage,OUTCOME_STAGES.CHOSEN);
  assert.equal(record.startedPracticeId,null);
  assert.equal(record.completionRatio,0);
});

test('starting records the actual executed practice',()=>{
  const record=markOutcomeStarted(createOutcomeRecord({judgement,choice}),'walk');
  assert.equal(record.stage,OUTCOME_STAGES.STARTED);
  assert.equal(record.startedPracticeId,'walk');
  assert.equal(record.integrity,'choice-matched');
});

test('different executed practice is preserved as mismatch',()=>{
  const record=markOutcomeStarted(createOutcomeRecord({judgement,choice}),'recovery');
  assert.equal(record.integrity,'choice-execution-mismatch');
});

test('completion records ratio and actual practice',()=>{
  let record=markOutcomeStarted(createOutcomeRecord({judgement,choice}),'walk');
  record=markOutcomeCompleted(record,{practiceId:'walk',completedPhases:3,totalPhases:4});
  assert.equal(record.stage,OUTCOME_STAGES.COMPLETED);
  assert.equal(record.completionRatio,.75);
});

test('abandonment remains distinct from completion',()=>{
  let record=markOutcomeStarted(createOutcomeRecord({judgement,choice}),'walk');
  record=markOutcomeAbandoned(record,{reason:'person-ended',completedPhases:1,totalPhases:4});
  assert.equal(record.stage,OUTCOME_STAGES.ABANDONED);
  assert.equal(record.completionRatio,.25);
  assert.equal(record.closureReason,'person-ended');
});

test('reflection requires material execution before learning',()=>{
  let record=markOutcomeStarted(createOutcomeRecord({judgement,choice}),'walk');
  record=markOutcomeCompleted(record,{practiceId:'walk',completedPhases:4,totalPhases:4});
  record=attachOutcomeReflection(record,'better');
  const eligibility=learningEligibility(record);
  assert.equal(record.stage,OUTCOME_STAGES.REFLECTED);
  assert.equal(eligibility.eligible,true);
  assert.equal(eligibility.weight,1);
});

test('mismatch or low completion cannot become learning',()=>{
  let mismatch=markOutcomeStarted(createOutcomeRecord({judgement,choice}),'recovery');
  mismatch=markOutcomeCompleted(mismatch,{practiceId:'recovery',completedPhases:4,totalPhases:4});
  mismatch=attachOutcomeReflection(mismatch,'right');
  assert.equal(learningEligibility(mismatch).eligible,false);

  let partial=markOutcomeStarted(createOutcomeRecord({judgement,choice}),'walk');
  partial=markOutcomeAbandoned(partial,{completedPhases:1,totalPhases:4});
  partial=attachOutcomeReflection(partial,'worse');
  assert.equal(learningEligibility(partial).eligible,false);
});

test('schema 14 migration and outcome reconciliation are deterministic',()=>{
  const migrated=migrateV0110Phase2ToPhase3({schemaVersion:13});
  assert.equal(migrated.schemaVersion,14);
  assert.deepEqual(migrated.outcomeRecords,[]);
  const record=createOutcomeRecord({judgement,choice});
  const reconciled=reconcileOutcomeRecords({outcomeRecords:[record,{...record}]});
  assert.equal(reconciled.outcomeRecords.length,1);
});
