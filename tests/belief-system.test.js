import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBeliefProposals,reconcileBeliefs,reviewBelief,beliefAudit } from '../src/core/belief-system.js';

const entry=(result,i)=>({id:`e${i}`,practiceId:'strength',practiceName:'Strength',result,outcomeRecordId:`o${i}`,immutableContext:{},recordedAt:`2026-07-${10+i}T10:00:00Z`});

test('creates a reviewable belief only after repeated directional outcomes',()=>{
  assert.equal(buildBeliefProposals([entry('yes',1),entry('partly',2)]).length,0);
  const items=buildBeliefProposals([entry('yes',1),entry('partly',2),entry('no',3)]);
  assert.equal(items.length,1);assert.equal(items[0].status,'proposed');assert.equal(items[0].automaticJudgementInfluence,0);
});

test('person can confirm, reject and reopen a belief',()=>{
  let beliefs=reconcileBeliefs([], [entry('yes',1),entry('yes',2),entry('partly',3)]);
  beliefs=reviewBelief(beliefs,beliefs[0].id,{action:'confirm'});assert.equal(beliefs[0].status,'confirmed');
  beliefs=reviewBelief(beliefs,beliefs[0].id,{action:'reopen'});assert.equal(beliefs[0].status,'proposed');
  beliefs=reviewBelief(beliefs,beliefs[0].id,{action:'reject'});assert.equal(beliefAudit(beliefs).counts.rejected,1);
});
