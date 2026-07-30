import test from 'node:test';
import assert from 'node:assert/strict';
import { buildUnderstanding } from '../src/core/understanding.js';
import { conveneAgora } from '../src/core/agora.js';
import { applyConfirmedBeliefAdjustments, CONFIRMED_BELIEF_MAX_ADJUSTMENT } from '../src/core/belief-system.js';

const base={sleep:3,energy:2,time:15,challenge:'body',soreness:'none',emotionalLoad:'usual'};

const confirmedBelief=(practiceId,practiceName,helpRate,confidence=0.7)=>({
  id:`belief-${practiceId}`,key:`practice-helpfulness:${practiceId}`,type:'practice-helpfulness',
  subjectId:practiceId,subjectName:practiceName,status:'confirmed',helpRate,confidence,
  statement:`${practiceName} has ${Math.round(helpRate*100)}% weighted helpfulness across 5 person-reported outcomes.`
});

test('a proposed (unconfirmed) belief has zero influence on totals',()=>{
  const totals={strength:1,recovery:1};
  const proposed={...confirmedBelief('strength','Strength',0.9),status:'proposed'};
  const result=applyConfirmedBeliefAdjustments(totals,[proposed]);
  assert.deepEqual(result.totals,totals);
  assert.equal(result.applied.length,0);
});

test('a confirmed belief with high help rate nudges its practice total upward, bounded',()=>{
  const totals={strength:1,recovery:1};
  const belief=confirmedBelief('strength','Strength',0.95,0.8);
  const result=applyConfirmedBeliefAdjustments(totals,[belief]);
  assert.ok(result.totals.strength>totals.strength);
  assert.ok(result.totals.strength-totals.strength<=CONFIRMED_BELIEF_MAX_ADJUSTMENT);
  assert.equal(result.applied.length,1);
  assert.equal(result.applied[0].practiceId,'strength');
});

test('a confirmed belief with low help rate nudges its practice total downward',()=>{
  const totals={strength:1};
  const belief=confirmedBelief('strength','Strength',0.05,0.8);
  const result=applyConfirmedBeliefAdjustments(totals,[belief]);
  assert.ok(result.totals.strength<totals.strength);
});

test('a neutral (50%) help rate produces no adjustment',()=>{
  const totals={strength:1};
  const belief=confirmedBelief('strength','Strength',0.5,0.9);
  const result=applyConfirmedBeliefAdjustments(totals,[belief]);
  assert.equal(result.totals.strength,totals.strength);
  assert.equal(result.applied.length,0);
});

test('the adjustment is scaled by belief confidence, never exceeding the bound',()=>{
  const totals={strength:1};
  const lowConfidence=applyConfirmedBeliefAdjustments(totals,[confirmedBelief('strength','Strength',1,0.1)]);
  const highConfidence=applyConfirmedBeliefAdjustments(totals,[confirmedBelief('strength','Strength',1,1)]);
  assert.ok(Math.abs(lowConfidence.applied[0].adjustment)<Math.abs(highConfidence.applied[0].adjustment));
  assert.ok(Math.abs(highConfidence.applied[0].adjustment)<=CONFIRMED_BELIEF_MAX_ADJUSTMENT+1e-9);
});

test('a belief for a practice absent from totals is ignored',()=>{
  const totals={strength:1};
  const result=applyConfirmedBeliefAdjustments(totals,[confirmedBelief('unknown-practice','Unknown',0.9)]);
  assert.equal(result.applied.length,0);
  assert.deepEqual(result.totals,totals);
});

test('confirmed belief adjustments cannot override a safety block',()=>{
  const context={...base,soreness:'significant',energy:3};
  const belief=confirmedBelief('strength','Strength',1,1);
  const result=conveneAgora(context,buildUnderstanding(context),[],{},null,null,[belief]);
  assert.notEqual(result.practice.id,'strength');
  assert.ok(result.agora.blockedPractices.some(item=>item.practiceId==='strength'));
});

test('conveneAgora surfaces applied belief adjustments on the judgement for disclosure',()=>{
  const belief=confirmedBelief('recovery','Recovery',0.9,0.8);
  const result=conveneAgora(base,buildUnderstanding(base),[],{},null,null,[belief]);
  assert.ok(Array.isArray(result.agora.beliefAdjustments));
  const applied=result.agora.beliefAdjustments.find(item=>item.practiceId==='recovery');
  assert.ok(applied);
  assert.ok(applied.adjustment>0);
});

test('conveneAgora with no confirmed beliefs produces no adjustments',()=>{
  const result=conveneAgora(base,buildUnderstanding(base),[],{});
  assert.deepEqual(result.agora.beliefAdjustments,[]);
});

test('confirmed beliefs on both sides can shift the winner when their combined swing exceeds the margin',()=>{
  // Deliberately does not assume the live top-2 margin: as CODEX grows and advisor
  // scoring is tuned, which practice sits in 2nd place (and by how much) shifts.
  // Instead, search every practice paired against the winner for one whose margin
  // sits strictly between one belief's max swing and two beliefs' combined max swing —
  // that is the only margin range where "a single belief is not enough, but two
  // opposing ones are" is actually true, which is what this test claims to prove.
  const unadjusted=conveneAgora(base,buildUnderstanding(base),[],{});
  const winnerId=unadjusted.practice.id;
  const candidates=Object.entries(unadjusted.scores)
    .filter(([id])=>id!==winnerId)
    .map(([id,score])=>({id,margin:unadjusted.scores[winnerId]-score}))
    .filter(c=>c.margin>CONFIRMED_BELIEF_MAX_ADJUSTMENT&&c.margin<CONFIRMED_BELIEF_MAX_ADJUSTMENT*2)
    .sort((a,b)=>a.margin-b.margin);
  assert.ok(candidates.length>0,'fixture assumption: at least one practice must have a margin that a single max belief cannot close but two opposing max beliefs can');
  const runnerUpId=candidates[0].id;
  const beliefs=[
    confirmedBelief(winnerId,winnerId,0,1),
    confirmedBelief(runnerUpId,runnerUpId,1,1)
  ];
  const adjusted=conveneAgora(base,buildUnderstanding(base),[],{},null,null,beliefs);
  assert.equal(adjusted.practice.id,runnerUpId,'two opposing max-confidence beliefs, whose combined swing exceeds the margin, correctly flip the ranking');
});
