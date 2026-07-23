import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  resolveConfirmedAdaptationDefault,
  adaptationPatternCandidates,
  mergeAdaptationPatternReviews,
  attachConfirmedDefaultHealth,
  attachAdaptationReconfirmation
} from '../src/core/adaptation-patterns.js';
import {resolveAdaptationChoice} from '../src/core/practice-adaptation-choice.js';

const here=dirname(fileURLToPath(import.meta.url));
const app=readFileSync(resolve(here,'../src/app.js'),'utf8');

test('adaptation governance remains in the existing runtime module',()=>{
  assert.match(app,/from '\.\/core\/adaptation-patterns\.js\?v=0390p1'/);
  assert.equal(existsSync(resolve(here,'../src/core/adaptation-pattern-review.js')),false);
});

test('person choice remains explicit final input to phase adaptation',()=>{
  const runPhase=app.slice(app.indexOf('function runPhase('),app.indexOf('function finishPractice'));
  assert.match(runPhase,/selectedLevel:selectedAdaptation/);
  assert.match(runPhase,/getPhaseAdaptationChoice/);
});

test('current safety blocks a confirmed harder default',()=>{
  const now=new Date('2026-07-20T12:00:00Z').getTime();
  const history=['a','b','c'].map((id,index)=>({
    id,
    completedAt:new Date(now-(index+1)*86400000).toISOString(),
    decision:{practice:{id:'recovery'}},
    adaptationAccountability:{
      at:new Date(now-(index+1)*86400000).toISOString(),
      fit:'right',
      choices:[{phaseName:'Main',level:'progression',source:'person'}]
    }
  }));
  const patternId='adaptation-pattern-recovery-main-progression';
  const result=resolveConfirmedAdaptationDefault({
    history,
    reviews:[{patternId,status:'confirmed'}],
    practiceId:'recovery',
    phaseName:'Main',
    availableLevels:['regression','technique','progression'],
    contextRecommendedLevel:'regression',
    now
  });
  assert.equal(result.applied,false);
  assert.equal(result.safetyBlocked,true);
});

test('explicit phase choice overrides the starting recommendation',()=>{
  const guidance={
    regression:['Easier cue'],
    technique:['Standard cue'],
    progression:['Harder cue']
  };
  const choice=resolveAdaptationChoice({
    guidance,
    recommendedLevel:'regression',
    selectedLevel:'progression'
  });
  assert.equal(choice.appliedLevel,'progression');
  assert.equal(choice.personSelected,true);
});

test('adaptation patterns retain zero judgement influence through governance layers',()=>{
  const now=new Date('2026-07-20T12:00:00Z').getTime();
  const history=['a','b','c'].map((id,index)=>({
    id,
    completedAt:new Date(now-(index+1)*86400000).toISOString(),
    decision:{practice:{id:'recovery'}},
    adaptationAccountability:{
      at:new Date(now-(index+1)*86400000).toISOString(),
      fit:'right',
      choices:[{phaseName:'Main',level:'regression',source:'person'}]
    }
  }));
  const raw=adaptationPatternCandidates(history,now);
  const reviewed=mergeAdaptationPatternReviews(raw,[{patternId:raw[0].id,status:'confirmed'}]);
  const healthy=attachConfirmedDefaultHealth(reviewed,history);
  const governed=attachAdaptationReconfirmation(healthy,history);
  assert.equal(governed[0].influence,0);
  assert.equal(governed[0].eligibleForJudgementInfluence,false);
});

test('alternative Practice reason uses in-app continuation rather than browser prompt',()=>{
  const handler=app.slice(app.indexOf('if(t.dataset.choiceAction)'),app.indexOf('if(t.dataset.learningAction)'));
  assert.doesNotMatch(handler,/prompt\(/);
  assert.match(handler,/choice-reason-panel/);
});

test('returning user startup remains Today',()=>{
  assert.match(app,/resolveStartupDestination/);
  assert.match(app,/if\(a==='begin'\).*route\(destination\.route\)/);
});

test('primary footer remains frozen to four destinations',()=>{
  const nav=app.slice(app.indexOf('const nav='),app.indexOf('const ROUTES='));
  for(const destination of ['Today','Understanding','Journey','Settings']){
    assert.ok(nav.includes(destination));
  }
  assert.doesNotMatch(nav,/Manual|Guide/);
});
