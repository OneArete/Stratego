import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalisePracticeContext,
  selectGuidanceLevel,
  buildGuidanceDecision,
  buildPhaseGuidance
} from '../src/core/practice-guidance.js';

test('Today numeric energy values are normalised',()=>{
  assert.equal(normalisePracticeContext({energy:1}).energy,'low');
  assert.equal(normalisePracticeContext({energy:2}).energy,'steady');
  assert.equal(normalisePracticeContext({energy:3}).energy,'high');
});

test('Today significant soreness maps to high soreness',()=>{
  assert.equal(normalisePracticeContext({soreness:'significant'}).soreness,'high');
});

test('actual Today low energy selects regression',()=>{
  assert.equal(selectGuidanceLevel({energy:1,soreness:'none'}),'regression');
});

test('actual Today significant soreness selects regression',()=>{
  assert.equal(selectGuidanceLevel({energy:3,soreness:'significant'}),'regression');
});

test('guidance decision explains why adaptation occurred',()=>{
  const guidance=buildPhaseGuidance({
    phase:['Movement',60,'',[
      'Technique: Move with control.',
      'Regression: Reduce the range.'
    ]],
    context:{energy:1,soreness:'significant'}
  });
  const decision=buildGuidanceDecision({
    guidance,
    context:{energy:1,soreness:'significant'}
  });
  assert.equal(decision.appliedLevel,'regression');
  assert.match(decision.reason,/significant soreness/);
  assert.match(decision.reason,/low energy/);
});

test('missing regression falls back honestly to technique',()=>{
  const guidance=buildPhaseGuidance({
    phase:['Breathing',60,'',['Technique: Exhale gently.']]
  });
  const decision=buildGuidanceDecision({
    guidance,
    context:{energy:1}
  });
  assert.equal(decision.requestedLevel,'regression');
  assert.equal(decision.appliedLevel,'technique');
});

test('heavy emotional load remains available to safety logic',()=>{
  assert.equal(normalisePracticeContext({emotionalLoad:'heavy'}).emotionalLoad,'heavy');
});
