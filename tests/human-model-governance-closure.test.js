import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  HUMAN_MODEL_DIMENSIONS,
  createHumanModel,
  updateHumanModel,
  applyHumanModelEvidenceReview,
  buildHumanModelDeliberationSnapshot,
  humanModelDeliberationEvidence,
  humanModelFactCandidates,
  applyHumanModelFactPromotion,
  humanModelAudit
} from '../src/core/human-model.js';

const here=dirname(fileURLToPath(import.meta.url));
const app=readFileSync(resolve(here,'../src/app.js'),'utf8');

function repeatedConfirmedModel(){
  let model=createHumanModel({profile:{name:'Pedro'}});
  const dates=['2026-07-01T10:00:00Z','2026-07-08T10:00:00Z','2026-07-15T10:00:00Z'];
  for(const at of dates){
    model=updateHumanModel(model,{
      context:{sleep:3,energy:2,time:15,challenge:'body',soreness:'none',emotionalLoad:'usual'},
      at
    });
    const observation=model.observations.find(item=>item.key==='body.energySignal'&&item.observedAt===at);
    model=applyHumanModelEvidenceReview(model,{evidenceId:observation.id,action:'confirm',at});
  }
  return model;
}

test('canonical Human Model dimensions remain complete',()=>{
  assert.deepEqual(HUMAN_MODEL_DIMENSIONS,[
    'identity','body','recovery','mind','agency','purpose','relationships','context'
  ]);
});

test('reported observations remain distinct from confirmed facts',()=>{
  const model=updateHumanModel(createHumanModel({profile:{name:'Pedro'}}),{
    context:{sleep:3,energy:2,time:15,challenge:'body',soreness:'mild',emotionalLoad:'usual'}
  });
  assert.ok(model.observations.some(item=>item.key==='body.sorenessSignal'));
  assert.ok(!model.facts.some(item=>item.key==='body.sorenessSignal'));
});

test('rejected evidence remains outside the active deliberation set',()=>{
  let model=updateHumanModel(createHumanModel({}),{
    context:{sleep:3,energy:2,time:15,challenge:'body',soreness:'mild',emotionalLoad:'usual'}
  });
  const soreness=model.observations.find(item=>item.key==='body.sorenessSignal');
  model=applyHumanModelEvidenceReview(model,{evidenceId:soreness.id,action:'reject',note:'Incorrect'});
  const snapshot=buildHumanModelDeliberationSnapshot(model);
  assert.ok(snapshot.rejectedEvidence.some(item=>item.id===soreness.id));
  assert.ok(!humanModelDeliberationEvidence(snapshot).some(item=>item.id===soreness.id));
});

test('stable-fact candidate requires repeated confirmed evidence',()=>{
  const candidates=humanModelFactCandidates(repeatedConfirmedModel(),{
    now:Date.parse('2026-07-21T10:00:00Z')
  });
  const candidate=candidates.find(item=>item.key==='body.energySignal');
  assert.ok(candidate);
  assert.equal(candidate.evidenceCount,3);
});

test('stable fact requires explicit person promotion',()=>{
  const model=repeatedConfirmedModel();
  const candidate=humanModelFactCandidates(model,{
    now:Date.parse('2026-07-21T10:00:00Z')
  }).find(item=>item.key==='body.energySignal');

  assert.ok(!model.facts.some(item=>item.promotionId===candidate.id));

  const promoted=applyHumanModelFactPromotion(model,{candidate,action:'promote'});
  assert.ok(promoted.facts.some(item=>item.promotionId===candidate.id));
});

test('Human Model remains operationally non-influential',()=>{
  const audit=humanModelAudit(repeatedConfirmedModel());
  assert.equal(audit.judgementInfluence,0);
  assert.equal(audit.practiceSelectionInfluence,0);
  assert.equal(audit.safetyInfluence,0);
});

test('governance remains in the existing Human Model module',()=>{
  assert.equal(existsSync(resolve(here,'../src/core/human-model-governance.js')),false);
  assert.equal(existsSync(resolve(here,'../src/core/human-model.js')),true);
});

test('startup and frozen footer remain protected',()=>{
  const nav=app.slice(app.indexOf('const nav='),app.indexOf('const ROUTES='));
  for(const label of ['Today','Understanding','Journey','Settings']){
    assert.ok(nav.includes(label));
  }
  assert.match(app,/resolveStartupDestination/);
});
