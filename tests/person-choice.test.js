import test from 'node:test';
import assert from 'node:assert/strict';
import {CHOICE_ACTIONS,createChoiceRecord,applyChoiceToJudgement,choiceImpactOnLearning,summarizeChoice,reconcileChoiceLog} from '../src/core/person-choice.js';
import {migrateV0100ToV0110Phase1} from '../src/core/state-schema.js';

const judgement={
  id:'j1',status:'proposed',practice:{id:'walk',name:'Walk'},
  alternatives:['Recovery'],boundaries:{runnerUp:{id:'recovery',name:'Recovery'}},
  validity:{status:'current'}
};

test('person can explicitly accept a judgement',()=>{
  const choice=createChoiceRecord({judgement,action:CHOICE_ACTIONS.ACCEPT});
  const updated=applyChoiceToJudgement(judgement,choice);
  assert.equal(choice.selectedPracticeId,'walk');assert.equal(updated.status,'accepted');
});

test('person can choose a valid alternative',()=>{
  const choice=createChoiceRecord({judgement,action:CHOICE_ACTIONS.CHOOSE_ALTERNATIVE,selectedPracticeId:'recovery',reason:'I need lower load.'});
  const updated=applyChoiceToJudgement(judgement,choice);
  assert.equal(updated.status,'overridden');assert.equal(updated.override.selectedPracticeId,'recovery');
});

test('unknown alternative is rejected',()=>{
  assert.throws(()=>createChoiceRecord({judgement,action:CHOICE_ACTIONS.CHOOSE_ALTERNATIVE,selectedPracticeId:'strength'}),/not part of this judgement/);
});

test('deferral marks judgement for later review',()=>{
  const choice=createChoiceRecord({judgement,action:CHOICE_ACTIONS.DEFER});
  const updated=applyChoiceToJudgement(judgement,choice);
  assert.equal(updated.status,'deferred');assert.equal(updated.validity.status,'review-required');
});

test('decline closes judgement without inferring preference',()=>{
  const choice=createChoiceRecord({judgement,action:CHOICE_ACTIONS.DECLINE});
  const updated=applyChoiceToJudgement(judgement,choice);
  assert.equal(updated.status,'declined');assert.equal(updated.validity.status,'closed');
  assert.equal(choiceImpactOnLearning(choice).shouldLearn,false);
});

test('override is meaningful but bounded preference evidence',()=>{
  const choice=createChoiceRecord({judgement,action:CHOICE_ACTIONS.CHOOSE_ALTERNATIVE,selectedPracticeId:'recovery'});
  const impact=choiceImpactOnLearning(choice);
  assert.equal(impact.shouldLearn,true);assert.equal(impact.weight,.65);
});

test('choice log reconciliation removes duplicates',()=>{
  const choice=createChoiceRecord({judgement,action:CHOICE_ACTIONS.ACCEPT});
  const state=reconcileChoiceLog({choiceLog:[choice,{...choice}]});
  assert.equal(state.choiceLog.length,1);assert.ok(summarizeChoice(choice).includes('accepted'));
});

test('v0.10.0 state migrates to schema 12 person-choice shape',()=>{
  const migrated=migrateV0100ToV0110Phase1({schemaVersion:11,judgements:[{id:'j1'}],current:{decision:{id:'j1'}}});
  assert.equal(migrated.schemaVersion,12);assert.equal(migrated.productVersion,'0.11.0');
  assert.deepEqual(migrated.choiceLog,[]);assert.equal(migrated.judgements[0].personChoice,null);
});
