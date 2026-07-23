import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  buildPracticeContract,
  snapshotPracticeContract,
  resolvePracticeContract,
  practiceContractCalibrationCandidates,
  mergePracticeContractCalibrationReviews,
  buildPracticeContractRevisionProposals,
  applyPracticeContractRevisionDecision,
  effectivePracticeContractRevision
} from '../src/core/practice-session.js';

const here=dirname(fileURLToPath(import.meta.url));
const app=readFileSync(resolve(here,'../src/app.js'),'utf8');

test('Practice Contract governance stays in the existing runtime module',()=>{
  assert.match(app,/from '\.\/core\/practice-session\.js\?v=0390p1'/);
  assert.equal(existsSync(resolve(here,'../src/core/practice-contract-review.js')),false);
});

test('contract exists before Practice but snapshot exists only after start',()=>{
  const judgement=app.slice(app.indexOf('function judgement(){'),app.indexOf('async function requestWakeLock'));
  const execute=app.slice(app.indexOf('function execute(){'),app.indexOf('function resumePrompt'));
  assert.match(judgement,/buildPracticeContract/);
  assert.doesNotMatch(judgement,/snapshotPracticeContract/);
  assert.match(execute,/snapshotPracticeContract/);
});

test('resolution preserves the original expected effect',()=>{
  const contract=buildPracticeContract({
    judgement:{id:'j1',duration:5,practice:{id:'recovery',name:'Recovery'}}
  });
  const snapshot=snapshotPracticeContract(contract,'2026-07-21T10:00:00Z');
  const outcome=resolvePracticeContract({
    contract:snapshot,
    reflection:{effect:'right',goalFit:'strong',burden:'low'},
    at:'2026-07-21T10:10:00Z'
  });
  assert.equal(outcome.expectedEffect,snapshot.expectedEffect);
});

test('three resolved same-Practice contracts are required for calibration',()=>{
  const now=new Date('2026-07-21T12:00:00Z').getTime();
  const history=[0,1,2].map(index=>({
    id:`h${index}`,
    completedAt:new Date(now-(index+1)*86400000).toISOString(),
    decision:{practice:{id:'recovery'}},
    practiceContract:{practiceId:'recovery'},
    practiceContractOutcome:{
      practiceId:'recovery',
      resolvedAt:new Date(now-(index+1)*86400000).toISOString(),
      expectedEffect:'More steadiness.',
      status:'aligned',
      effect:'right',
      goalFit:'strong',
      burden:'low'
    }
  }));
  assert.equal(practiceContractCalibrationCandidates(history,now).length,1);
});

test('calibration review alone cannot alter future contracts',()=>{
  const calibration={
    id:'practice-contract-calibration-recovery',
    practiceId:'recovery',
    direction:'mostly-aligned',
    total:3,
    expectedEffectSamples:['More steadiness.'],
    status:'candidate'
  };
  const reviewed=mergePracticeContractCalibrationReviews(
    [calibration],
    [{calibrationId:calibration.id,status:'confirmed'}]
  )[0];
  assert.equal(reviewed.eligibleForContractChange,false);
  assert.equal(reviewed.eligibleForJudgementInfluence,false);
});

test('revision applies only after explicit acceptance',()=>{
  const calibration={
    id:'practice-contract-calibration-recovery',
    practiceId:'recovery',
    direction:'often-misaligned',
    total:4,
    expectedEffectSamples:['More steadiness.'],
    evidenceBoundary:'3 contracts'
  };
  const reviews=[{calibrationId:calibration.id,status:'confirmed'}];
  const proposal=buildPracticeContractRevisionProposals([calibration],reviews,[])[0];

  const before=buildPracticeContract({
    judgement:{duration:5,practice:{id:'recovery',name:'Recovery'}}
  });

  const decisions=applyPracticeContractRevisionDecision([],{proposal,action:'accept'});
  const revision=effectivePracticeContractRevision(decisions,'recovery');
  const after=buildPracticeContract({
    judgement:{duration:5,practice:{id:'recovery',name:'Recovery'}},
    revision
  });

  assert.notEqual(before.expectedEffect,proposal.proposedExpectedEffect);
  assert.equal(after.expectedEffect,proposal.proposedExpectedEffect);
});

test('accepted revision remains scoped to the same Practice',()=>{
  const decision={
    proposalId:'p1',
    practiceId:'recovery',
    status:'accepted',
    proposedExpectedEffect:'Revised wording.',
    decidedAt:'2026-07-21T10:00:00Z'
  };
  assert.equal(effectivePracticeContractRevision([decision],'connection'),null);
});

test('footer and startup remain frozen',()=>{
  const nav=app.slice(app.indexOf('const nav='),app.indexOf('const ROUTES='));
  for(const label of ['Today','Understanding','Journey','Settings']){
    assert.ok(nav.includes(label));
  }
  assert.match(app,/resolveStartupDestination/);
});
