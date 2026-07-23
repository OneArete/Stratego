import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPracticeContractRevisionProposals,
  applyPracticeContractRevisionDecision,
  effectivePracticeContractRevision,
  reconcilePracticeContractRevisionDecisions,
  buildPracticeContract
} from '../src/core/practice-session.js';

const calibration={
  id:'practice-contract-calibration-recovery',
  practiceId:'recovery',
  direction:'often-misaligned',
  total:4,
  expectedEffectSamples:['A modest improvement in steadiness.'],
  evidenceBoundary:'3 contracts'
};
const reviews=[{calibrationId:calibration.id,status:'confirmed'}];

test('only person-confirmed calibration creates a revision proposal',()=>{
  assert.equal(buildPracticeContractRevisionProposals([calibration],[],[]).length,0);
  assert.equal(buildPracticeContractRevisionProposals([calibration],reviews,[]).length,1);
});

test('proposal changes expected effect only after explicit acceptance',()=>{
  const proposal=buildPracticeContractRevisionProposals([calibration],reviews,[])[0];
  const before=buildPracticeContract({judgement:{practice:{id:'recovery',name:'Recovery'},duration:5}});
  assert.notEqual(before.expectedEffect,proposal.proposedExpectedEffect);
  const decisions=applyPracticeContractRevisionDecision([],{proposal,action:'accept',at:'2026-07-21T10:00:00Z'});
  const revision=effectivePracticeContractRevision(decisions,'recovery');
  const after=buildPracticeContract({judgement:{practice:{id:'recovery',name:'Recovery'},duration:5},revision});
  assert.equal(after.expectedEffect,proposal.proposedExpectedEffect);
  assert.equal(after.revisionId,proposal.id);
});

test('accepted revision is scoped to the same Practice',()=>{
  const proposal=buildPracticeContractRevisionProposals([calibration],reviews,[])[0];
  const decisions=applyPracticeContractRevisionDecision([],{proposal,action:'accept'});
  assert.equal(effectivePracticeContractRevision(decisions,'connection'),null);
});

test('decline prevents the proposed wording from applying',()=>{
  const proposal=buildPracticeContractRevisionProposals([calibration],reviews,[])[0];
  const decisions=applyPracticeContractRevisionDecision([],{proposal,action:'decline'});
  assert.equal(effectivePracticeContractRevision(decisions,'recovery'),null);
});

test('reconciliation removes decisions without a live proposal',()=>{
  const proposal=buildPracticeContractRevisionProposals([calibration],reviews,[])[0];
  const decisions=[
    ...applyPracticeContractRevisionDecision([],{proposal,action:'accept'}),
    {proposalId:'missing',status:'accepted'}
  ];
  assert.equal(reconcilePracticeContractRevisionDecisions(decisions,[proposal]).length,1);
});

test('revision keeps zero judgement influence',()=>{
  const proposal=buildPracticeContractRevisionProposals([calibration],reviews,[])[0];
  const decisions=applyPracticeContractRevisionDecision([],{proposal,action:'accept'});
  assert.equal(decisions[0].judgementInfluence,0);
});
