import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPersonalEvidence,personalEvidenceLevel,personalEvidenceOverview } from '../src/core/personal-evidence.js?v=0390p1';

const entry=(result,i=1,practiceId='strength')=>({id:`e${i}`,result,practiceId,practiceName:'Strength',outcomeRecordId:`o${i}`,immutableContext:{context:{sleep:3}},recordedAt:`2026-07-${String(i).padStart(2,'0')}T10:00:00Z`});

test('personal evidence remains hidden below the minimum',()=>{
  const overview=personalEvidenceOverview([entry('yes',1),entry('partly',2)]);
  assert.equal(overview.visible.length,0);
  assert.equal(personalEvidenceLevel(2),'insufficient');
});

test('personal evidence aggregates only eligible person-reported outcomes',()=>{
  const summaries=buildPersonalEvidence([entry('yes',1),entry('partly',2),entry('no',3),{...entry('unknown',4),result:'unknown'}]);
  assert.equal(summaries.length,1);
  assert.equal(summaries[0].directionalOutcomes,3);
  assert.equal(summaries[0].evidenceLevel,'exploratory');
  assert.equal(summaries[0].helpRate,.5);
  assert.equal(summaries[0].automaticInfluence,0);
});
