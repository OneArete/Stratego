import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createHumanModel,
  updateHumanModel,
  applyHumanModelEvidenceReview,
  buildHumanModelDeliberationSnapshot,
  humanModelDeliberationEvidence,
  humanModelDeliberationSnapshotAudit
} from '../src/core/human-model.js';

function reviewedModel(){
  let model=updateHumanModel(createHumanModel({profile:{name:'Pedro'}}),{
    context:{sleep:3,energy:2,time:15,challenge:'body',soreness:'mild',emotionalLoad:'usual'},
    at:'2026-07-21T10:00:00Z'
  });
  const sleep=model.observations.find(item=>item.key==='recovery.sleepSignal');
  const soreness=model.observations.find(item=>item.key==='body.sorenessSignal');
  model=applyHumanModelEvidenceReview(model,{evidenceId:sleep.id,action:'confirm',at:'2026-07-21T10:01:00Z'});
  model=applyHumanModelEvidenceReview(model,{evidenceId:soreness.id,action:'reject',note:'Incorrect tap',at:'2026-07-21T10:02:00Z'});
  return model;
}

test('deliberation snapshot separates active and rejected evidence',()=>{
  const snapshot=buildHumanModelDeliberationSnapshot(reviewedModel(),{at:'2026-07-21T10:03:00Z'});
  assert.equal(snapshot.confirmedObservations.length,1);
  assert.equal(snapshot.rejectedEvidence.length,1);
  assert.ok(snapshot.reportedObservations.length>0);
});

test('rejected evidence is excluded from active deliberation evidence',()=>{
  const snapshot=buildHumanModelDeliberationSnapshot(reviewedModel());
  const active=humanModelDeliberationEvidence(snapshot);
  assert.ok(!active.some(item=>item.key==='body.sorenessSignal'));
  assert.ok(snapshot.rejectedEvidence.some(item=>item.key==='body.sorenessSignal'));
});

test('snapshot preserves the evidence state at decision time',()=>{
  const model=reviewedModel();
  const snapshot=buildHumanModelDeliberationSnapshot(model,{at:'2026-07-21T10:03:00Z'});
  model.observations[0].value='changed later';
  assert.notEqual(snapshot.reportedObservations[0]?.value,'changed later');
});

test('snapshot boundary has zero operational influence',()=>{
  const audit=humanModelDeliberationSnapshotAudit(buildHumanModelDeliberationSnapshot(reviewedModel()));
  assert.equal(audit.judgementInfluence,0);
  assert.equal(audit.practiceSelectionInfluence,0);
  assert.equal(audit.safetyInfluence,0);
});

test('missing snapshot is explicit',()=>{
  const audit=humanModelDeliberationSnapshotAudit(null);
  assert.equal(audit.status,'missing');
  assert.equal(audit.activeEvidenceCount,0);
});
