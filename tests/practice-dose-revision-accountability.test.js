import test from 'node:test';
import assert from 'node:assert/strict';
import {
  recordPracticeDoseRevisionUse,
  resolvePracticeDoseRevisionUse,
  assessPracticeDoseRevisionHealth,
  effectivePracticeDoseRevisionWithHealth
} from '../src/core/practice-session.js';

const revision={
  proposalId:'dose-r1',
  evidenceId:'e1',
  practiceId:'recovery',
  status:'accepted',
  proposedDurationMinutes:7,
  previousDurationMinutes:10,
  decidedAt:'2026-07-20T10:00:00Z'
};
const contract={durationMinutes:7};

test('accepted duration use is recorded at Practice start',()=>{
  const use=recordPracticeDoseRevisionUse({revision,contract,at:'2026-07-21T10:00:00Z'});
  assert.equal(use.durationMinutes,7);
  assert.equal(use.baseDurationMinutes,10);
  assert.equal(use.status,'started');
});

test('contract outcome resolves duration fit',()=>{
  const use=recordPracticeDoseRevisionUse({revision,contract});
  const resolved=resolvePracticeDoseRevisionUse(use,{
    contractOutcome:{status:'misaligned'},
    completionRatio:.8,
    at:'2026-07-21T10:10:00Z'
  });
  assert.equal(resolved.fit,'worse');
  assert.equal(resolved.status,'resolved');
});

test('two recent worse outcomes pause accepted duration',()=>{
  const history=[0,1].map(index=>({
    practiceDoseRevisionUse:{
      proposalId:'dose-r1',
      status:'resolved',
      fit:'worse',
      completedAt:new Date(Date.now()-index*86400000).toISOString()
    }
  }));
  const health=assessPracticeDoseRevisionHealth(history,'dose-r1');
  assert.equal(health.suspended,true);
  assert.equal(health.status,'review-required');
});

test('supportive outcomes keep accepted duration active',()=>{
  const history=[0,1,2].map(index=>({
    practiceDoseRevisionUse:{
      proposalId:'dose-r1',
      status:'resolved',
      fit:index===0?'mixed':'right',
      completedAt:new Date(Date.now()-index*86400000).toISOString()
    }
  }));
  assert.equal(assessPracticeDoseRevisionHealth(history,'dose-r1').suspended,false);
});

test('health-aware resolver suppresses suspended duration',()=>{
  const decisions=[revision];
  const history=[0,1].map(index=>({
    practiceDoseRevisionUse:{
      proposalId:'dose-r1',
      status:'resolved',
      fit:'worse',
      completedAt:new Date(Date.now()-index*86400000).toISOString()
    }
  }));
  assert.equal(effectivePracticeDoseRevisionWithHealth(decisions,history,'recovery'),null);
});
