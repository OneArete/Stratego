import test from 'node:test';
import assert from 'node:assert/strict';
import {
  availableAdaptationLevels,
  resolveAdaptationChoice,
  setPhaseAdaptationChoice,
  getPhaseAdaptationChoice,
  adaptationChoiceSummary
} from '../src/core/practice-adaptation-choice.js';

const guidance={
  regression:['Use a smaller range.'],
  technique:['Move with control.'],
  progression:['Slow the lowering phase.']
};

test('available levels reflect actual guidance',()=>{
  assert.deepEqual(availableAdaptationLevels(guidance),['regression','technique','progression']);
});

test('person choice overrides recommended level',()=>{
  const choice=resolveAdaptationChoice({guidance,recommendedLevel:'regression',selectedLevel:'progression'});
  assert.equal(choice.appliedLevel,'progression');
  assert.equal(choice.personSelected,true);
  assert.equal(choice.differsFromRecommendation,true);
});

test('invalid choice falls back safely',()=>{
  const choice=resolveAdaptationChoice({guidance,recommendedLevel:'technique',selectedLevel:'unknown'});
  assert.equal(choice.appliedLevel,'technique');
  assert.equal(choice.personSelected,false);
});

test('phase adaptation is stored independently per phase',()=>{
  let current={phaseAdaptations:{}};
  current=setPhaseAdaptationChoice(current,0,'regression');
  current=setPhaseAdaptationChoice(current,1,'progression');
  assert.equal(getPhaseAdaptationChoice(current,0),'regression');
  assert.equal(getPhaseAdaptationChoice(current,1),'progression');
});

test('summary preserves person agency',()=>{
  const choice=resolveAdaptationChoice({guidance,recommendedLevel:'technique',selectedLevel:'regression'});
  assert.match(adaptationChoiceSummary(choice),/chosen by you/);
});
