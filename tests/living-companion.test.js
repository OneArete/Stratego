import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLivingCompanion,timeGreeting } from '../src/core/living-companion.js';

test('Living Companion preserves silence before enough context exists',()=>{
  const model=buildLivingCompanion({context:{},story:{stage:'opened'}});
  assert.equal(model.mode,'listen');
  assert.equal(model.action,'focus-signals');
  assert.match(model.continuity,/Continue your story/);
});

test('Living Companion exposes one continuation action for active continuity',()=>{
  const model=buildLivingCompanion({hasContinuity:true,judgement:{judgement:'Protect recovery.',confidence:72},story:{stage:'judgement'}});
  assert.equal(model.action,'continue-flow');
  assert.equal(model.judgement,'Protect recovery.');
  assert.equal(model.confidence,'72% confidence');
});

test('Living Companion recognises a completed day without inventing urgency',()=>{
  const model=buildLivingCompanion({story:{stage:'complete'}});
  assert.equal(model.judgement,'Day completed');
  assert.match(model.reasons.join(' '),/Nothing else needs/);
});

test('time greeting remains deterministic when an hour is supplied',()=>{
  assert.equal(timeGreeting(8),'Good morning');
  assert.equal(timeGreeting(14),'Good afternoon');
  assert.equal(timeGreeting(21),'Good evening');
});
