import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HUMAN_MODEL_VERSION,
  HUMAN_MODEL_DIMENSIONS,
  createHumanModel,
  updateHumanModel,
  humanModelSnapshot,
  humanModelAudit,
  humanModelDimensionSummary
} from '../src/core/human-model.js';

test('onboarding creates a versioned Human Model with confirmed name',()=>{
  const model=createHumanModel({profile:{name:'Pedro'},at:'2026-07-21T10:00:00Z'});
  assert.equal(model.version,HUMAN_MODEL_VERSION);
  assert.equal(model.facts[0].key,'identity.preferredName');
  assert.equal(model.facts[0].confidence,'confirmed');
});

test('Today signals remain observations rather than permanent facts',()=>{
  const model=updateHumanModel(createHumanModel({profile:{name:'Pedro'}}),{
    context:{sleep:3,energy:2,time:15,challenge:'body',soreness:'mild',emotionalLoad:'usual'},
    source:'today-signals',
    at:'2026-07-21T10:00:00Z'
  });
  assert.equal(model.facts.filter(item=>item.key.includes('sleep')).length,0);
  assert.ok(model.observations.some(item=>item.key==='recovery.sleepSignal'));
});

test('latest observation per key becomes current',()=>{
  let model=createHumanModel({});
  model=updateHumanModel(model,{context:{sleep:2,energy:1,time:5,challenge:'mind',soreness:'none',emotionalLoad:'heavy'},at:'2026-07-20T10:00:00Z'});
  model=updateHumanModel(model,{context:{sleep:4,energy:3,time:30,challenge:'body',soreness:'none',emotionalLoad:'light'},at:'2026-07-21T10:00:00Z'});
  const snapshot=humanModelSnapshot(model);
  assert.equal(snapshot.currentObservations.find(item=>item.key==='recovery.sleepSignal').value,4);
});

test('unknown dimensions remain explicit',()=>{
  const model=createHumanModel({profile:{name:'Pedro'}});
  const audit=humanModelAudit(model);
  assert.ok(audit.unknowns>0);
  assert.ok(audit.dimensionsCovered<HUMAN_MODEL_DIMENSIONS.length);
});

test('Phase 1 has zero decision influence',()=>{
  const model=updateHumanModel(createHumanModel({}),{context:{sleep:3,energy:2,time:15,challenge:'body',soreness:'none',emotionalLoad:'usual'}});
  const audit=humanModelAudit(model);
  assert.equal(audit.judgementInfluence,0);
  assert.equal(audit.practiceSelectionInfluence,0);
  assert.equal(audit.safetyInfluence,0);
});

test('dimension summary covers the complete canonical dimension set',()=>{
  assert.equal(humanModelDimensionSummary(createHumanModel({})).length,HUMAN_MODEL_DIMENSIONS.length);
});
