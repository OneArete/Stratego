import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPracticeDoseRevisionProposals,
  applyPracticeDoseRevisionDecision,
  effectivePracticeDoseRevision,
  applyPracticeDoseRevisionToJudgement,
  reconcilePracticeDoseRevisionDecisions
} from '../src/core/practice-session.js';

const evidence={
  id:'practice-dose-evidence-recovery-partial',
  practiceId:'recovery',
  doseBand:'partial',
  direction:'mostly-aligned',
  total:4,
  averageActualMinutes:7,
  observations:[
    {plannedMinutes:10},
    {plannedMinutes:10},
    {plannedMinutes:10},
    {plannedMinutes:10}
  ]
};
const reviews=[{evidenceId:evidence.id,status:'confirmed'}];

test('only confirmed dose evidence creates a proposal',()=>{
  assert.equal(buildPracticeDoseRevisionProposals([evidence],[],[]).length,0);
  assert.equal(buildPracticeDoseRevisionProposals([evidence],reviews,[]).length,1);
});

test('partial aligned evidence proposes average actual duration',()=>{
  const proposal=buildPracticeDoseRevisionProposals([evidence],reviews,[])[0];
  assert.equal(proposal.previousDurationMinutes,10);
  assert.equal(proposal.proposedDurationMinutes,7);
});

test('duration changes only after explicit acceptance',()=>{
  const proposal=buildPracticeDoseRevisionProposals([evidence],reviews,[])[0];
  const judgement={duration:10,practice:{id:'recovery',name:'Recovery'}};
  assert.equal(applyPracticeDoseRevisionToJudgement(judgement,null).duration,10);
  const decisions=applyPracticeDoseRevisionDecision([],{proposal,action:'accept',at:'2026-07-21T10:00:00Z'});
  const revision=effectivePracticeDoseRevision(decisions,'recovery');
  const revised=applyPracticeDoseRevisionToJudgement(judgement,revision);
  assert.equal(revised.duration,7);
  assert.equal(revised.baseDuration,10);
});

test('accepted revision is scoped to the same Practice',()=>{
  const proposal=buildPracticeDoseRevisionProposals([evidence],reviews,[])[0];
  const decisions=applyPracticeDoseRevisionDecision([],{proposal,action:'accept'});
  assert.equal(effectivePracticeDoseRevision(decisions,'connection'),null);
});

test('decline keeps current duration',()=>{
  const proposal=buildPracticeDoseRevisionProposals([evidence],reviews,[])[0];
  const decisions=applyPracticeDoseRevisionDecision([],{proposal,action:'decline'});
  assert.equal(effectivePracticeDoseRevision(decisions,'recovery'),null);
});

test('reconciliation removes orphaned duration decisions',()=>{
  const proposal=buildPracticeDoseRevisionProposals([evidence],reviews,[])[0];
  const decisions=[
    ...applyPracticeDoseRevisionDecision([],{proposal,action:'accept'}),
    {proposalId:'missing',status:'accepted'}
  ];
  assert.equal(reconcilePracticeDoseRevisionDecisions(decisions,[proposal]).length,1);
});
