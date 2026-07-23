import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyAdaptationPatternReview,
  adaptationPatternReviewFor,
  mergeAdaptationPatternReviews,
  adaptationPatternReviewAudit,
  adaptationPatternReviewSummary,
  reconcileAdaptationPatternReviews
} from '../src/core/adaptation-patterns.js';

const patterns=[
  {id:'p1',status:'candidate'},
  {id:'p2',status:'candidate'}
];

test('person can confirm a candidate',()=>{
  const reviews=applyAdaptationPatternReview([],{patternId:'p1',action:'confirm',at:'2026-07-20T10:00:00Z'});
  assert.equal(reviews[0].status,'confirmed');
  assert.equal(reviews[0].judgementInfluence,0);
});

test('person can reject with a correction note',()=>{
  const reviews=applyAdaptationPatternReview([],{patternId:'p1',action:'reject',note:'This was temporary.'});
  assert.equal(reviews[0].status,'rejected');
  assert.equal(reviews[0].note,'This was temporary.');
});

test('reopen returns a rejected pattern to candidate review',()=>{
  let reviews=applyAdaptationPatternReview([],{patternId:'p1',action:'reject'});
  reviews=applyAdaptationPatternReview(reviews,{patternId:'p1',action:'reopen'});
  assert.equal(adaptationPatternReviewFor(reviews,'p1').status,'candidate');
});

test('latest review replaces earlier review for same pattern',()=>{
  let reviews=applyAdaptationPatternReview([],{patternId:'p1',action:'confirm'});
  reviews=applyAdaptationPatternReview(reviews,{patternId:'p1',action:'reject'});
  assert.equal(reviews.filter(item=>item.patternId==='p1').length,1);
  assert.equal(reviews[0].status,'rejected');
});

test('merged patterns preserve zero judgement influence',()=>{
  const reviews=applyAdaptationPatternReview([],{patternId:'p1',action:'confirm'});
  const merged=mergeAdaptationPatternReviews(patterns,reviews);
  assert.equal(merged[0].reviewStatus,'confirmed');
  assert.equal(merged[0].influence,0);
  assert.equal(merged[0].eligibleForJudgementInfluence,false);
});

test('review audit reports statuses but no influence',()=>{
  const reviews=[
    ...applyAdaptationPatternReview([],{patternId:'p1',action:'confirm'}),
    ...applyAdaptationPatternReview([],{patternId:'p2',action:'reject'})
  ];
  const audit=adaptationPatternReviewAudit(patterns,reviews);
  assert.equal(audit.confirmed,1);
  assert.equal(audit.rejected,1);
  assert.equal(audit.influential,0);
});

test('review summary remains person-readable',()=>{
  const reviews=applyAdaptationPatternReview([],{patternId:'p1',action:'reject',note:'Travel week.'});
  const pattern=mergeAdaptationPatternReviews(patterns,reviews)[0];
  assert.match(adaptationPatternReviewSummary(pattern),/Travel week/);
});

test('reconciliation drops orphan and duplicate reviews',()=>{
  const reviews=[
    {patternId:'p1',status:'confirmed'},
    {patternId:'p1',status:'rejected'},
    {patternId:'missing',status:'confirmed'}
  ];
  const result=reconcileAdaptationPatternReviews(reviews,patterns);
  assert.equal(result.length,1);
  assert.equal(result[0].patternId,'p1');
});
