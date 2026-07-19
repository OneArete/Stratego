import test from 'node:test';
import assert from 'node:assert/strict';
import {
  compareDecisionContexts,
  createJudgementValidity,
  assessJudgementValidity,
  assessCandidateStability,
  markJudgementsForReview,
  supersedeJudgement,
  JUDGEMENT_VALIDITY
} from '../src/core/judgement-stability.js';
import { migrateV090Phase2ToPhase3 } from '../src/core/state-schema.js';

const base={sleep:3,energy:2,time:15,challenge:'body',soreness:'none',emotionalLoad:'usual'};

test('small context variation does not force review',()=>{
  const comparison=compareDecisionContexts(base,{...base,time:30});
  assert.equal(comparison.materialChange,false);
  assert.ok(comparison.similarity>.8);
});

test('significant soreness is a material and critical context change',()=>{
  const comparison=compareDecisionContexts(base,{...base,soreness:'significant'});
  assert.equal(comparison.materialChange,true);
  assert.equal(comparison.criticalChange,true);
});

test('judgement expires after its validity window',()=>{
  const judgement={createdAt:'2026-07-01T00:00:00.000Z',validity:createJudgementValidity(base,'2026-07-01T00:00:00.000Z',24)};
  const result=assessJudgementValidity(judgement,base,new Date('2026-07-03T00:00:00.000Z').getTime());
  assert.equal(result.status,JUDGEMENT_VALIDITY.EXPIRED);
});

test('material context change marks judgement for review',()=>{
  const judgement={createdAt:new Date().toISOString(),validity:createJudgementValidity(base)};
  const result=assessJudgementValidity(judgement,{...base,challenge:'family'});
  assert.equal(result.status,JUDGEMENT_VALIDITY.REVIEW_REQUIRED);
});

test('minor input fluctuation cannot churn a judgement without confidence advantage',()=>{
  const previous={practice:{id:'walk'},confidence:72};
  const candidate={practice:{id:'focus'},confidence:76};
  const result=assessCandidateStability(previous,candidate,base,{...base,time:30});
  assert.equal(result.action,'retain-previous');
});

test('material context change permits a different judgement',()=>{
  const previous={practice:{id:'strength'},confidence:80};
  const candidate={practice:{id:'recovery'},confidence:74};
  const result=assessCandidateStability(previous,candidate,base,{...base,soreness:'significant'});
  assert.equal(result.action,'use-candidate');
});

test('person correction marks active judgements for review but not closed ones',()=>{
  const judgements=[
    {id:'active',status:'proposed',createdAt:new Date().toISOString()},
    {id:'closed',status:'reviewed',createdAt:new Date().toISOString()}
  ];
  const updated=markJudgementsForReview(judgements,'Correction');
  assert.equal(updated[0].validity.status,JUDGEMENT_VALIDITY.REVIEW_REQUIRED);
  assert.equal(updated[1].validity,undefined);
});

test('superseded judgement records its successor',()=>{
  const updated=supersedeJudgement({id:'old',createdAt:new Date().toISOString()},'new');
  assert.equal(updated.validity.status,JUDGEMENT_VALIDITY.SUPERSEDED);
  assert.equal(updated.validity.supersededBy,'new');
});

test('phase 2 state migrates judgements to schema 7 validity records',()=>{
  const migrated=migrateV090Phase2ToPhase3({
    schemaVersion:6,
    judgements:[{id:'j1',status:'proposed',createdAt:'2026-07-01T00:00:00.000Z'}],
    history:[]
  });
  assert.equal(migrated.schemaVersion,7);
  assert.equal(migrated.judgements[0].validity.status,'current');
  assert.ok(migrated.judgements[0].validity.validUntil);
});
