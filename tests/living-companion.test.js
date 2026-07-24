import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLivingCompanion,timeGreeting } from '../src/core/living-companion.js';

test('Living Companion gives one clear check-in action before context exists',()=>{
  const model=buildLivingCompanion({context:{},story:{stage:'opened'}});
  assert.equal(model.mode,'listen');
  assert.equal(model.judgement,'Let’s understand today.');
  assert.equal(model.action,'focus-signals');
  assert.equal(model.actionLabel,'Start today’s check-in');
});

test('Living Companion exposes one continuation action for active continuity',()=>{
  const model=buildLivingCompanion({hasContinuity:true,judgement:{judgement:'Protect recovery.',confidence:72},story:{stage:'judgement'}});
  assert.equal(model.action,'continue-flow');
  assert.equal(model.actionLabel,'Continue');
  assert.equal(model.judgement,'Continue where you left off.');
});

test('Living Companion recognises a completed day without inventing urgency',()=>{
  const model=buildLivingCompanion({story:{stage:'complete'}});
  assert.equal(model.judgement,'Day completed.');
  assert.equal(model.action,null);
  assert.equal(model.continuity,'There is continuity.');
});

test('complete context leads directly to recommendation deliberation',()=>{
  const context={sleep:3,energy:2,time:30,challenge:'recovery',soreness:'mild',emotionalLoad:'usual'};
  const model=buildLivingCompanion({context,story:{stage:'check-in'}});
  assert.equal(model.judgement,'I understand today.');
  assert.equal(model.action,'consult');
  assert.equal(model.actionLabel,'See today’s recommendation');
});

test('time greeting remains deterministic when an hour is supplied',()=>{
  assert.equal(timeGreeting(8),'Good morning');
  assert.equal(timeGreeting(14),'Good afternoon');
  assert.equal(timeGreeting(21),'Good evening');
});
