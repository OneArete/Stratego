import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveStartupDestination,
  resolveContinuityDestination,
  buildContinuityNotice,
  shouldShowContinuityCard
} from '../src/core/startup-continuity.js';

const base={profile:{name:'Pedro'},onboardingVersion:1};

const _d=new Date();const todayKey=_d.getFullYear()+'-'+String(_d.getMonth()+1).padStart(2,'0')+'-'+String(_d.getDate()).padStart(2,'0');
const baseWithCheckin={...base,dailyCheckIns:[{day:todayKey,signals:{sleep:3,energy:2,time:30,challenge:'strength',soreness:'none',emotionalLoad:'low'},source:'person-confirmed'}]};

test('new person routes to onboarding',()=>{
  assert.equal(resolveStartupDestination({}).route,'onboarding');
});

test('returning person with no check-in today goes directly to check-in',()=>{
  assert.equal(resolveStartupDestination(base).route,'checkin');
  assert.equal(resolveStartupDestination(base).reason,'daily-checkin-required');
});

test('returning person who already checked in today goes to Today',()=>{
  assert.equal(resolveStartupDestination(baseWithCheckin).route,'today');
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
