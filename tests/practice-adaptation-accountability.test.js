import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAdaptationAccountability,
  hasPersonAdaptations,
  adaptationReflectionPrompt,
  adaptationAccountabilitySummary
} from '../src/core/practice-adaptation-accountability.js';

test('accountability record preserves phase-specific person choices',()=>{
  const record=buildAdaptationAccountability({
    phaseAdaptations:{
      0:{level:'regression',selectedAt:'2026-07-20T10:00:00Z'},
      2:{level:'progression',selectedAt:'2026-07-20T10:05:00Z'}
    },
    phases:[['Warm up'],['Main'],['Close']],
    fit:'better'
  });
  assert.equal(record.choiceCount,2);
  assert.equal(record.choices[0].phaseName,'Warm up');
  assert.equal(record.choices[1].level,'progression');
});

test('single adaptation does not become preference learning',()=>{
  const record=buildAdaptationAccountability({
    phaseAdaptations:{0:{level:'regression'}},
    phases:[['Main']]
  });
  assert.equal(record.eligibleForPreferenceLearning,false);
});

test('adaptation prompt appears only when choices exist',()=>{
  assert.equal(hasPersonAdaptations({phaseAdaptations:{}}),false);
  assert.equal(hasPersonAdaptations({phaseAdaptations:{0:{level:'technique'}}}),true);
  assert.equal(adaptationReflectionPrompt({phaseAdaptations:{}},[]),null);
});

test('prompt explains cautious interpretation',()=>{
  const prompt=adaptationReflectionPrompt({phaseAdaptations:{0:{level:'technique'}}},[['Main']]);
  assert.match(prompt.description,/does not turn a single choice into a permanent preference/);
});

test('summary is person-readable',()=>{
  const record=buildAdaptationAccountability({
    phaseAdaptations:{0:{level:'regression'}},
    phases:[['Main']],
    fit:'right'
  });
  assert.match(adaptationAccountabilitySummary(record),/Main: easier/);
  assert.match(adaptationAccountabilitySummary(record),/about right/);
});
