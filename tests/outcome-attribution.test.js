import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createOutcomeAttribution,
  attributionLearningAdjustment,
  calibrateLearningWithAttribution,
  attributionContradiction,
  reconcileOutcomeAttributions
} from '../src/core/outcome-attribution.js';
import { migrateV0130Phase1ToFinal } from '../src/core/state-schema.js';

const reflection={id:'r1',outcomeRecordId:'o1',judgementId:'j1',surprise:'none'};

test('creates person-authored outcome attribution',()=>{
  const a=createOutcomeAttribution({reflection,source:'practice',causalConfidence:'high'});
  assert.equal(a.integrity,'person-attributed');
  assert.equal(a.reflectionId,'r1');
});

test('unsupported source is rejected',()=>{
  assert.throws(()=>createOutcomeAttribution({reflection,source:'luck'}),/Unsupported attribution source/);
});

test('practice attribution carries more weight than external attribution',()=>{
  const direct=attributionLearningAdjustment(createOutcomeAttribution({reflection,source:'practice',causalConfidence:'high'}));
  const external=attributionLearningAdjustment(createOutcomeAttribution({reflection,source:'external',causalConfidence:'high',externalFactors:['weather']}));
  assert.ok(direct.multiplier>external.multiplier);
});

test('external factors further reduce attribution weight',()=>{
  const one=attributionLearningAdjustment(createOutcomeAttribution({reflection,source:'mixed',causalConfidence:'medium',externalFactors:['sleep']}));
  const many=attributionLearningAdjustment(createOutcomeAttribution({reflection,source:'mixed',causalConfidence:'medium',externalFactors:['sleep','work','weather']}));
  assert.ok(one.multiplier>many.multiplier);
});

test('learning weight is calibrated by causal attribution',()=>{
  const base={eligible:true,weight:.8,reason:'Base signal.'};
  const a=createOutcomeAttribution({reflection,source:'mixed',causalConfidence:'medium'});
  const result=calibrateLearningWithAttribution(base,a);
  assert.equal(result.eligible,true);
  assert.ok(result.weight<.8);
});

test('unclear high-confidence attribution is contradictory',()=>{
  const a=createOutcomeAttribution({reflection,source:'unclear',causalConfidence:'high'});
  const c=attributionContradiction(reflection,a);
  assert.equal(c.present,true);
});

test('reconciliation removes orphan and duplicate attribution records',()=>{
  const a=createOutcomeAttribution({reflection});
  const state=reconcileOutcomeAttributions({
    structuredReflections:[reflection],
    outcomeAttributions:[a,{...a},{...a,id:'orphan',reflectionId:'missing'}]
  });
  assert.equal(state.outcomeAttributions.length,1);
});

test('phase 1 state migrates to schema 21 attribution shape',()=>{
  const migrated=migrateV0130Phase1ToFinal({schemaVersion:20});
  assert.equal(migrated.schemaVersion,21);
  assert.equal(migrated.productVersion,'0.13.0');
  assert.deepEqual(migrated.outcomeAttributions,[]);
});
