import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPracticeExitModel,
  canResumePractice,
  normalisePracticeExitReason
} from '../src/core/practice-exit.js';

const phases=[['Prepare',60,'',[]],['Work',120,'',[]]];

test('exit model explains current phase and completion',()=>{
  const model=buildPracticeExitModel({
    phases,
    execution:{
      status:'paused',
      phaseIndex:1,
      phaseStartedAt:'2026-07-20T10:00:00.000Z',
      phaseDuration:120,
      pausedAt:'2026-07-20T10:01:00.000Z',
      totalPausedDuration:0
    }
  });
  assert.equal(model.percent,67);
  assert.match(model.statement,/Work/);
  assert.match(model.recordStatement,/67% completion/);
});

test('discard statement excludes Journey and learning',()=>{
  const model=buildPracticeExitModel({phases,execution:{status:'paused',phaseIndex:0,phaseStartedAt:'invalid',phaseDuration:60}});
  assert.match(model.discardStatement,/removes this session from Journey/);
  assert.match(model.discardStatement,/Practice learning/);
});

test('only active and paused sessions can resume',()=>{
  assert.equal(canResumePractice({status:'active'}),true);
  assert.equal(canResumePractice({status:'paused'}),true);
  assert.equal(canResumePractice({status:'completed'}),false);
});

test('exit reasons are bounded',()=>{
  assert.equal(normalisePracticeExitReason('person-discarded'),'person-discarded');
  assert.equal(normalisePracticeExitReason('unknown'),'person-ended');
});
