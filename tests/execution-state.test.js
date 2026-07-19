import test from 'node:test';
import assert from 'node:assert/strict';
import {createExecutionState,remainingSeconds,pauseExecution,resumeExecution,startPhase,closeExecution,isResumable,EXECUTION_STATUS} from '../src/core/execution-state.js';

const phases=[['One',60,'',[]],['Two',30,'',[]]];

test('remaining time is derived from timestamps',()=>{
  const execution=createExecutionState(phases,{now:1_000_000});
  assert.equal(remainingSeconds(execution,{now:1_025_000}),35);
});

test('pause time does not consume phase time',()=>{
  let execution=createExecutionState(phases,{now:1_000_000});
  execution=pauseExecution(execution,{now:1_020_000});
  assert.equal(remainingSeconds(execution,{now:1_050_000}),40);
  execution=resumeExecution(execution,{now:1_050_000});
  assert.equal(remainingSeconds(execution,{now:1_060_000}),30);
});

test('phase transition creates a fresh phase clock',()=>{
  let execution=createExecutionState(phases,{now:1_000_000});
  execution=startPhase(execution,phases,1,{now:1_100_000});
  assert.equal(execution.phaseIndex,1);
  assert.equal(execution.phaseDuration,30);
  assert.equal(remainingSeconds(execution,{now:1_105_000}),25);
});

test('abandonment closes a resumable execution',()=>{
  let execution=createExecutionState(phases,{now:1_000_000});
  assert.equal(isResumable(execution),true);
  execution=closeExecution(execution,EXECUTION_STATUS.ABANDONED,{now:1_010_000,reason:'person-ended'});
  assert.equal(isResumable(execution),false);
  assert.equal(execution.reason,'person-ended');
});
