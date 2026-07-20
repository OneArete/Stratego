import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveStartupDestination,
  resolveContinuityDestination,
  buildContinuityNotice,
  shouldShowContinuityCard
} from '../src/core/startup-continuity.js';

const base={profile:{name:'Pedro'},onboardingVersion:1};

test('new person routes to onboarding',()=>{
  assert.equal(resolveStartupDestination({}).route,'onboarding');
});

test('returning person always starts in Today',()=>{
  assert.equal(resolveStartupDestination(base).route,'today');
});

test('pending judgement does not hijack startup',()=>{
  const state={...base,current:{decision:{id:'j1'},startedAt:null}};
  assert.equal(resolveStartupDestination(state).route,'today');
  assert.equal(resolveContinuityDestination(state).route,'judgement');
});

test('paused Practice is available only through explicit continuity',()=>{
  const state={...base,current:{decision:{id:'j1'},execution:{status:'paused'}}};
  assert.equal(resolveStartupDestination(state).route,'today');
  assert.equal(resolveContinuityDestination(state).route,'resumePrompt');
});

test('active recovered Practice is available through explicit continuity',()=>{
  const state={...base,current:{decision:{id:'j1'},execution:{status:'active'}}};
  assert.equal(resolveContinuityDestination(state).reason,'practice-recovered-after-reload');
});

test('completed Practice exposes pending reflection through continuity',()=>{
  const state={...base,current:{decision:{id:'j1'},execution:{status:'completed'},completed:false}};
  assert.equal(resolveContinuityDestination(state).route,'reflect');
});

test('notice remains person-readable',()=>{
  const state={...base,current:{decision:{id:'j1'},execution:{status:'paused'}}};
  assert.match(buildContinuityNotice(state).message,/preserved/);
});

test('continuity card appears only when a flow can be resumed',()=>{
  const paused={...base,current:{decision:{id:'j1'},execution:{status:'paused'}}};
  assert.equal(shouldShowContinuityCard(paused),true);
  assert.equal(shouldShowContinuityCard(base),false);
});
