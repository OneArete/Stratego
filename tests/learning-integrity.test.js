import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeAdvisorMemories,
  learnFromReflection,
  learningReviewItems,
  updateLearningStatus,
  effectiveMemoryWeight,
  expireStaleLearnings
} from '../src/core/advisor-memory.js';
import { migrateV090Phase1ToPhase2 } from '../src/core/state-schema.js';

function entry(reflection,context={}){
  return {
    reflection,
    context:{challenge:'body',soreness:'none',emotionalLoad:'usual',...context},
    decision:{
      practice:{id:'strength',name:'Strength'},
      advisors:[{advisor:'Body',position:'Support',confidence:78,scores:{strength:.8}}]
    }
  };
}

test('repeated consistent evidence in a similar context confirms learning',()=>{
  let memories=normalizeAdvisorMemories({});
  memories=learnFromReflection(memories,entry('better'));
  memories=learnFromReflection(memories,entry('better'));
  memories=learnFromReflection(memories,entry('right'));
  const learning=learningReviewItems(memories)[0];
  assert.equal(learning.status,'confirmed');
  assert.equal(learning.confirmationSource,'repeated-evidence');
  assert.equal(memories.Body.weights.strength.learningStatus,'confirmed');
});

test('different contexts remain separate candidate learnings',()=>{
  let memories=normalizeAdvisorMemories({});
  memories=learnFromReflection(memories,entry('better',{challenge:'body'}));
  memories=learnFromReflection(memories,entry('better',{challenge:'work'}));
  memories=learnFromReflection(memories,entry('better',{challenge:'family'}));
  const learnings=learningReviewItems(memories);
  assert.equal(learnings.length,3);
  assert.ok(learnings.every(item=>item.status==='candidate'));
});

test('person rejection stops learning from influencing judgement',()=>{
  let memories=normalizeAdvisorMemories({});
  memories=learnFromReflection(memories,entry('better'));
  const learning=learningReviewItems(memories)[0];
  memories=updateLearningStatus(memories,{advisor:'Body',learningId:learning.id,status:'rejected',correction:'This only worked because I was on holiday.'});
  assert.equal(memories.Body.notes[0].status,'rejected');
  assert.equal(memories.Body.notes[0].correction.note,'This only worked because I was on holiday.');
  assert.equal(effectiveMemoryWeight(memories.Body.weights.strength),0);
});

test('person confirmation promotes candidate learning immediately',()=>{
  let memories=normalizeAdvisorMemories({});
  memories=learnFromReflection(memories,entry('right'));
  const learning=learningReviewItems(memories)[0];
  memories=updateLearningStatus(memories,{advisor:'Body',learningId:learning.id,status:'confirmed'});
  assert.equal(memories.Body.notes[0].status,'confirmed');
  assert.equal(memories.Body.notes[0].confirmationSource,'person');
  assert.equal(memories.Body.weights.strength.learningStatus,'confirmed');
});

test('stale candidate learning expires and loses influence',()=>{
  const old='2025-01-01T00:00:00.000Z';
  const memories=normalizeAdvisorMemories({Body:{
    weights:{strength:{value:.2,observations:2,positive:2,neutral:0,negative:0,lastObservedAt:old,contexts:{'body|none|usual':2},learningStatus:'candidate'}},
    notes:[{id:'old-learning',practice:'strength',contextKey:'body|none|usual',status:'candidate',evidenceCount:2,outcomeCounts:{positive:2,neutral:0,negative:0},contexts:{'body|none|usual':2},at:old,lastObservedAt:old,reviewAfter:'2025-05-01T00:00:00.000Z',learning:'Old candidate'}]
  }});
  const expired=expireStaleLearnings(memories,new Date('2026-01-01T00:00:00.000Z').getTime());
  assert.equal(expired.Body.notes[0].status,'expired');
  assert.equal(effectiveMemoryWeight(expired.Body.weights.strength,new Date('2026-01-01T00:00:00.000Z').getTime()),0);
});

test('phase 1 memory migrates to schema 6 accountable learning shape',()=>{
  const migrated=migrateV090Phase1ToPhase2({
    schemaVersion:5,
    advisorMemories:{Body:{
      weights:{strength:{value:.1,observations:1,positive:1,neutral:0,negative:0,lastObservedAt:null,contexts:{}}},
      notes:[{id:'n1',status:'candidate',at:'2026-07-01T00:00:00.000Z',context:{challenge:'body',soreness:'none',emotionalLoad:'usual',practice:'strength'}}]
    }}
  });
  assert.equal(migrated.schemaVersion,6);
  assert.equal(migrated.advisorMemories.Body.weights.strength.learningStatus,'candidate');
  assert.equal(migrated.advisorMemories.Body.notes[0].contextKey,'body|none|usual');
});
