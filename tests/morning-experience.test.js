import test from 'node:test';
import assert from 'node:assert/strict';
import { morningSignalProgress,buildMorningExperience } from '../src/core/morning-experience.js';

test('morning experience stays focused on incomplete context',()=>{
 const progress=morningSignalProgress({sleep:3,energy:2});
 assert.equal(progress.completed,2);
 assert.equal(progress.complete,false);
 const view=buildMorningExperience({context:{sleep:3,energy:2},name:'Pedro'});
 assert.equal(view.mode,'check-in');
 assert.equal(view.primaryActionId,'morning-context');
});

test('morning experience advances to Agora when context is complete',()=>{
 const context={sleep:3,energy:2,time:15,challenge:'body',soreness:'none',emotionalLoad:'usual'};
 const view=buildMorningExperience({context,orientation:{title:'Advance deliberately.',primary:'Context is balanced.'}});
 assert.equal(view.mode,'ready');
 assert.equal(view.primaryActionId,'consult');
});

test('an active judgement becomes the morning focal point',()=>{
 const view=buildMorningExperience({context:{},judgement:{judgement:'Protect recovery.',practice:{name:'Recovery Reset'}}});
 assert.equal(view.mode,'judgement');
 assert.equal(view.practice,'Recovery Reset');
 assert.equal(view.primaryActionId,'currentJudgement');
});
