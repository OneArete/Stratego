import test from 'node:test';
import assert from 'node:assert/strict';
import {conveneAgora} from '../src/core/agora.js';

const understanding={confidence:70,energy:.6,contradictions:[],unknowns:[]};
const base={sleep:3,energy:2,time:15,challenge:'body',soreness:'none',emotionalLoad:'usual'};

test('explicit blocked status excludes Strength',()=>{
  const decision=conveneAgora({...base,soreness:'significant'},understanding,[],{},null,null);
  assert.ok(decision.agora.blockedPractices.some(item=>item.practiceId==='strength'));
  assert.notEqual(decision.practice.id,'strength');
});

test('blocked exclusion is sourced from canonical eligibility',()=>{
  const decision=conveneAgora({...base,soreness:'significant'},understanding,[],{},null,null);
  const blocked=decision.agora.blockedPractices.find(item=>item.practiceId==='strength');
  assert.equal(blocked.source,'canonical-practice-eligibility');
  assert.deepEqual(blocked.matchedContraindications,['significant-soreness']);
});

test('caution does not exclude a Practice',()=>{
  const decision=conveneAgora({...base,energy:1},understanding,[],{},null,null);
  const strength=decision.agora.eligibilityTrace.find(item=>item.practiceId==='strength');
  assert.equal(strength.status,'caution');
  assert.equal(strength.selectionEffect,'none');
  assert.ok(!decision.agora.blockedPractices.some(item=>item.practiceId==='strength'));
});

test('eligibility trace covers every Practice',()=>{
  const decision=conveneAgora(base,understanding,[],{},null,null);
  assert.equal(decision.agora.eligibilityTrace.length,5);
});

test('governance distinguishes block from caution',()=>{
  const decision=conveneAgora(base,understanding,[],{},null,null);
  assert.match(decision.agora.eligibilityGovernance,/Only explicit blocked status excludes/);
  assert.match(decision.agora.eligibilityGovernance,/Caution does not change ranking/);
});
