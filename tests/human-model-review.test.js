import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createHumanModel,
  updateHumanModel,
  applyHumanModelEvidenceReview,
  reconcileHumanModelReviews,
  humanModelEvidenceReviewFor,
  humanModelReviewAudit
} from '../src/core/human-model.js';

function modelWithSignals(){
  return updateHumanModel(createHumanModel({profile:{name:'Pedro'}}),{
    context:{sleep:3,energy:2,time:15,challenge:'body',soreness:'none',emotionalLoad:'usual'},
    at:'2026-07-21T10:00:00Z'
  });
}

test('person can confirm a reported observation',()=>{
  const model=modelWithSignals();
  const evidence=model.observations.find(item=>item.key==='recovery.sleepSignal');
  const reviewed=applyHumanModelEvidenceReview(model,{evidenceId:evidence.id,action:'confirm'});
  assert.equal(humanModelEvidenceReviewFor(reviewed,evidence.id).status,'confirmed');
});

test('person can reject inaccurate evidence with a correction note',()=>{
  const model=modelWithSignals();
  const evidence=model.observations[0];
  const reviewed=applyHumanModelEvidenceReview(model,{evidenceId:evidence.id,action:'reject',note:'This was entered incorrectly.'});
  assert.equal(humanModelEvidenceReviewFor(reviewed,evidence.id).status,'rejected');
  assert.equal(reviewed.corrections[0].note,'This was entered incorrectly.');
});

test('reopen returns evidence to reported status',()=>{
  const model=modelWithSignals();
  const evidence=model.observations[0];
  let reviewed=applyHumanModelEvidenceReview(model,{evidenceId:evidence.id,action:'reject'});
  reviewed=applyHumanModelEvidenceReview(reviewed,{evidenceId:evidence.id,action:'reopen'});
  assert.equal(humanModelEvidenceReviewFor(reviewed,evidence.id).status,'reported');
});

test('review has zero operational influence',()=>{
  const model=modelWithSignals();
  const evidence=model.observations[0];
  const reviewed=applyHumanModelEvidenceReview(model,{evidenceId:evidence.id,action:'confirm'});
  const correction=reviewed.corrections[0];
  assert.equal(correction.judgementInfluence,0);
  assert.equal(correction.practiceSelectionInfluence,0);
  assert.equal(correction.safetyInfluence,0);
});

test('reconciliation removes orphaned and duplicate reviews',()=>{
  const model=modelWithSignals();
  const evidence=model.observations[0];
  model.corrections=[
    {evidenceId:evidence.id,action:'confirm'},
    {evidenceId:evidence.id,action:'reject'},
    {evidenceId:'missing',action:'confirm'}
  ];
  const reconciled=reconcileHumanModelReviews(model);
  assert.equal(reconciled.corrections.length,1);
});

test('review audit counts evidence states',()=>{
  const model=modelWithSignals();
  const evidence=model.observations[0];
  const reviewed=applyHumanModelEvidenceReview(model,{evidenceId:evidence.id,action:'reject'});
  const audit=humanModelReviewAudit(reviewed);
  assert.equal(audit.rejected,1);
  assert.equal(audit.judgementInfluence,0);
});
