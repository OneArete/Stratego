import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyPracticeContractCalibrationReview,
  mergePracticeContractCalibrationReviews,
  reconcilePracticeContractCalibrationReviews,
  practiceContractCalibrationReviewAudit
} from '../src/core/practice-session.js';

const item={id:'practice-contract-calibration-recovery',status:'candidate',practiceId:'recovery'};

test('person can confirm a calibration candidate',()=>{
  const reviews=applyPracticeContractCalibrationReview([],{calibrationId:item.id,action:'confirm',at:'2026-07-21T10:00:00Z'});
  const merged=mergePracticeContractCalibrationReviews([item],reviews)[0];
  assert.equal(merged.reviewStatus,'confirmed');
  assert.equal(merged.personConfirmed,true);
});

test('person can reject a misleading calibration',()=>{
  const reviews=applyPracticeContractCalibrationReview([],{calibrationId:item.id,action:'reject'});
  assert.equal(mergePracticeContractCalibrationReviews([item],reviews)[0].reviewStatus,'rejected');
});

test('reopen returns calibration to candidate',()=>{
  let reviews=applyPracticeContractCalibrationReview([],{calibrationId:item.id,action:'reject'});
  reviews=applyPracticeContractCalibrationReview(reviews,{calibrationId:item.id,action:'reopen'});
  assert.equal(mergePracticeContractCalibrationReviews([item],reviews)[0].reviewStatus,'candidate');
});

test('review never creates contract or judgement influence',()=>{
  const reviews=applyPracticeContractCalibrationReview([],{calibrationId:item.id,action:'confirm'});
  const merged=mergePracticeContractCalibrationReviews([item],reviews)[0];
  assert.equal(merged.contractInfluence,0);
  assert.equal(merged.judgementInfluence,0);
  assert.equal(merged.eligibleForContractChange,false);
});

test('reconciliation removes orphaned and duplicate reviews',()=>{
  const reviews=[
    {calibrationId:item.id,status:'confirmed'},
    {calibrationId:item.id,status:'rejected'},
    {calibrationId:'missing',status:'confirmed'}
  ];
  const reconciled=reconcilePracticeContractCalibrationReviews(reviews,[item]);
  assert.equal(reconciled.length,1);
  assert.equal(reconciled[0].status,'confirmed');
});

test('review audit counts statuses and zero influence',()=>{
  const merged=mergePracticeContractCalibrationReviews(
    [item,{...item,id:'second'}],
    [{calibrationId:item.id,status:'confirmed'}]
  );
  const audit=practiceContractCalibrationReviewAudit(merged);
  assert.equal(audit.confirmed,1);
  assert.equal(audit.candidate,1);
  assert.equal(audit.contractInfluence,0);
});
