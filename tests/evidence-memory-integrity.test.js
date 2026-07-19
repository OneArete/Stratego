import test from 'node:test';
import assert from 'node:assert/strict';
import { assessEvidenceDiversity, detectContradictions } from '../src/core/evidence-integrity.js';
import { normalizeAdvisorMemories, effectiveMemoryWeight, learnFromReflection } from '../src/core/advisor-memory.js';
import { migrateV081ToV090 } from '../src/core/state-schema.js';
import { buildUnderstanding } from '../src/core/understanding.js';
import { conveneAgora } from '../src/core/agora.js';

test('v0.8.1 numeric memory weights migrate to structured evidence',()=>{
  const state=migrateV081ToV090({schemaVersion:4,advisorMemories:{Body:{weights:{strength:.12},updatedAt:'2026-01-01T00:00:00.000Z'}}});
  assert.equal(state.schemaVersion,5);
  assert.equal(state.advisorMemories.Body.weights.strength.value,.12);
  assert.equal(state.advisorMemories.Body.weights.strength.observations,1);
});

test('memory weights decay with age',()=>{
  const recent=effectiveMemoryWeight({value:.2,observations:3,lastObservedAt:'2026-07-18T00:00:00.000Z'},new Date('2026-07-19T00:00:00.000Z').getTime());
  const old=effectiveMemoryWeight({value:.2,observations:3,lastObservedAt:'2025-07-19T00:00:00.000Z'},new Date('2026-07-19T00:00:00.000Z').getTime());
  assert.ok(recent>old);
});

test('contradictory outcome reduces prior positive memory without erasing it',()=>{
  const memories=normalizeAdvisorMemories({Body:{weights:{strength:{value:.2,observations:3,positive:3,negative:0,neutral:0,lastObservedAt:new Date().toISOString(),contexts:{}}}}});
  const entry={reflection:'worse',context:{challenge:'body',soreness:'none',emotionalLoad:'usual'},decision:{practice:{id:'strength',name:'Strength'},advisors:[{advisor:'Body',position:'Support',confidence:80,scores:{strength:.8}}]}};
  const next=learnFromReflection(memories,entry);
  assert.ok(next.Body.weights.strength.value<.2);
  assert.equal(next.Body.weights.strength.negative,1);
  assert.equal(next.Body.notes[0].status,'candidate');
});

test('evidence diversity distinguishes narrow and diverse bases',()=>{
  const narrow=assessEvidenceDiversity([{advisor:'Body',evidence:[{family:'current_signal',independent:true}]},{advisor:'Mind',evidence:[{family:'current_signal',independent:true}]}]);
  const diverse=assessEvidenceDiversity([{advisor:'Body',evidence:[{family:'current_signal',independent:true}]},{advisor:'Mind',evidence:[{family:'person_history',independent:true}]},{advisor:'Recovery',evidence:[{family:'deterministic_rule',independent:true}]}]);
  assert.equal(narrow.level,'Narrow');
  assert.equal(diverse.level,'Diverse');
});

test('high energy and significant soreness create a preserved contradiction',()=>{
  const contradictions=detectContradictions({energy:3,soreness:'significant'}, {}, []);
  assert.ok(contradictions.some(x=>x.id==='energy-vs-soreness'));
});

test('Agora exposes evidence diversity and contradictions',()=>{
  const context={sleep:3,energy:3,time:15,challenge:'body',soreness:'significant',emotionalLoad:'usual'};
  const result=conveneAgora(context,buildUnderstanding(context),[],{});
  assert.ok(result.evidenceDiversity);
  assert.ok(result.contradictions.some(x=>x.id==='energy-vs-soreness'));
  assert.ok(result.agora.evidenceDiversity);
});
