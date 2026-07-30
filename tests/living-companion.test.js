import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLivingCompanion,timeGreeting } from '../src/core/living-companion.js';

test('Living Companion gives one clear check-in action before context exists',()=>{
  const model=buildLivingCompanion({context:{},story:{stage:'opened'}});
  assert.equal(model.mode,'listen');
  assert.equal(model.judgement,'What is today asking of you?');
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
  assert.equal(model.judgement,'Today is closed.');
  assert.equal(model.action,null);
  assert.equal(model.continuity,'There is continuity.');
});

test('complete context leads directly to recommendation deliberation',()=>{
  const context={sleep:3,energy:2,time:30,challenge:'recovery',soreness:'mild',emotionalLoad:'usual'};
  const model=buildLivingCompanion({context,story:{stage:'check-in'}});
  assert.equal(model.judgement,'Strategos has what it needs.');
  assert.equal(model.action,'consult');
  assert.equal(model.actionLabel,'See today’s recommendation');
});

test('time greeting remains deterministic when an hour is supplied',()=>{
  assert.equal(timeGreeting(8),'Good morning');
  assert.equal(timeGreeting(14),'Good afternoon');
  assert.equal(timeGreeting(21),'Good evening');
});

// --- v0.60.0 — Organism as emotional hook: day-close reveal ---

test('a completed day with no practice or highlight falls back to the original honest statement',()=>{
  const model=buildLivingCompanion({story:{stage:'complete'}});
  assert.equal(model.judgement,'Today is closed.');
  assert.equal(model.action,null);
  assert.equal(model.continuity,'There is continuity.');
  assert.deepEqual(model.reasons,['The day has been deliberately closed.']);
  assert.equal(model.settled,true);
});

test('a completed day names the practice actually completed and its reflection',()=>{
  const model=buildLivingCompanion({story:{stage:'complete',practice:{name:'Strength',reflection:'better'}}});
  assert.equal(model.judgement,'Today is closed.');
  assert.match(model.reasons[0],/^You completed Strength today\. It went better than expected\.$/);
});

test('a completed day surfaces the graph highlight alongside the practice, when both exist',()=>{
  const model=buildLivingCompanion({story:{stage:'complete',practice:{name:'Walk',reflection:'right'}},highlight:{label:'Recovery',trend:'growing',statement:'Recovery is growing today.'}});
  assert.equal(model.reasons.length,2);
  assert.match(model.reasons[0],/^You completed Walk today\. It went as expected\.$/);
  assert.equal(model.reasons[1],'Recovery is growing today.');
});

test('a completed day with no practice but a graph highlight still says something specific',()=>{
  const model=buildLivingCompanion({story:{stage:'complete'},highlight:{label:'Mind',trend:'easing',statement:'Mind is easing today.'}});
  assert.deepEqual(model.reasons,['Mind is easing today.']);
});
