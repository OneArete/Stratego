import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyPracticeDoseEvidenceReview,
  mergePracticeDoseEvidenceReviews,
  reconcilePracticeDoseEvidenceReviews,
  practiceDoseEvidenceReviewAudit
} from '../src/core/practice-session.js';

const item={id:'practice-dose-evidence-recovery-full',status:'candidate',practiceId:'recovery',doseBand:'full'};

test('person can confirm dose evidence',()=>{
  const reviews=applyPracticeDoseEvidenceReview([],{evidenceId:item.id,action:'confirm',at:'2026-07-21T10:00:00Z'});
  const merged=mergePracticeDoseEvidenceReviews([item],reviews)[0];
  assert.equal(merged.reviewStatus,'confirmed');
  assert.equal(merged.personConfirmed,true);
});

test('person can reject misleading dose evidence',()=>{
  const reviews=applyPracticeDoseEvidenceReview([],{evidenceId:item.id,action:'reject'});
  assert.equal(mergePracticeDoseEvidenceReviews([item],reviews)[0].reviewStatus,'rejected');
});

test('reopen returns dose evidence to candidate',()=>{
  let reviews=applyPracticeDoseEvidenceReview([],{evidenceId:item.id,action:'reject'});
  reviews=applyPracticeDoseEvidenceReview(reviews,{evidenceId:item.id,action:'reopen'});
  assert.equal(mergePracticeDoseEvidenceReviews([item],reviews)[0].reviewStatus,'candidate');
});

test('review retains zero automatic influence',()=>{
  const reviews=applyPracticeDoseEvidenceReview([],{evidenceId:item.id,action:'confirm'});
  const merged=mergePracticeDoseEvidenceReviews([item],reviews)[0];
  assert.equal(merged.durationInfluence,0);
  assert.equal(merged.contractInfluence,0);
  assert.equal(merged.judgementInfluence,0);
  assert.equal(merged.eligibleForDurationChange,false);
});

test('reconciliation removes orphaned and duplicate reviews',()=>{
  const reviews=[
    {evidenceId:item.id,status:'confirmed'},
    {evidenceId:item.id,status:'rejected'},
    {evidenceId:'missing',status:'confirmed'}
  ];
  const reconciled=reconcilePracticeDoseEvidenceReviews(reviews,[item]);
  assert.equal(reconciled.length,1);
  assert.equal(reconciled[0].status,'confirmed');
});

test('audit counts statuses and zero influence',()=>{
  const merged=mergePracticeDoseEvidenceReviews(
    [item,{...item,id:'second'}],
    [{evidenceId:item.id,status:'confirmed'}]
  );
  const audit=practiceDoseEvidenceReviewAudit(merged);
  assert.equal(audit.confirmed,1);
  assert.equal(audit.candidate,1);
  assert.equal(audit.durationInfluence,0);
});
