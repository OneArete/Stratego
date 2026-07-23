import test from 'node:test';
import assert from 'node:assert/strict';
import {
  recordConfirmedAdaptationDefault,
  confirmedDefaultOutcomeHistory,
  assessConfirmedDefaultHealth,
  resolveConfirmedAdaptationDefault
} from '../src/core/adaptation-patterns.js';
import {
  buildAdaptationAccountability,
  hasAppliedAdaptations,
  adaptationReflectionPrompt
} from '../src/core/practice-adaptation-accountability.js';

test('applied confirmed default is recorded once per phase',()=>{
  let current={};
  current=recordConfirmedAdaptationDefault(current,{phaseIndex:0,phaseName:'Main',level:'regression',patternId:'p1',appliedAt:'2026-07-20T10:00:00Z'});
  const again=recordConfirmedAdaptationDefault(current,{phaseIndex:0,phaseName:'Main',level:'regression',patternId:'p1',appliedAt:'2026-07-20T10:01:00Z'});
  assert.equal(Object.keys(current.confirmedAdaptationDefaults).length,1);
  assert.equal(again,current);
});

test('person adaptation overrides automatic default in accountability',()=>{
  const record=buildAdaptationAccountability({
    confirmedDefaults:{0:{level:'regression',source:'confirmed-pattern',patternId:'p1'}},
    phaseAdaptations:{0:{level:'technique',source:'person'}},
    phases:[['Main']],
    fit:'right'
  });
  assert.equal(record.choices.length,1);
  assert.equal(record.choices[0].level,'technique');
  assert.equal(record.choices[0].source,'person');
});

test('automatic default remains identifiable in history',()=>{
  const record=buildAdaptationAccountability({
    confirmedDefaults:{0:{level:'regression',source:'confirmed-pattern',patternId:'p1'}},
    phases:[['Main']],
    fit:'right'
  });
  assert.equal(record.choices[0].source,'confirmed-pattern');
  assert.equal(record.choices[0].patternId,'p1');
});

test('reflection prompt explains confirmed-default review',()=>{
  const current={confirmedAdaptationDefaults:{0:{level:'regression',patternId:'p1'}}};
  assert.equal(hasAppliedAdaptations(current),true);
  const prompt=adaptationReflectionPrompt(current,[['Main']]);
  assert.match(prompt.description,/pause that default for review/);
});

const historyEntry=(id,day,fit)=>({
  id,
  completedAt:`2026-07-${String(day).padStart(2,'0')}T10:00:00Z`,
  adaptationAccountability:{
    at:`2026-07-${String(day).padStart(2,'0')}T10:00:00Z`,
    fit,
    choices:[{phaseName:'Main',level:'regression',source:'confirmed-pattern',patternId:'p1'}]
  }
});

test('default outcome history is scoped to pattern',()=>{
  const history=[
    historyEntry('a',18,'right'),
    historyEntry('b',19,'worse'),
    {...historyEntry('other',20,'worse'),adaptationAccountability:{...historyEntry('other',20,'worse').adaptationAccountability,choices:[{source:'confirmed-pattern',patternId:'p2'}]}}
  ];
  const result=confirmedDefaultOutcomeHistory(history,'p1');
  assert.equal(result.length,2);
});

test('two recent worse assessments suspend a confirmed default',()=>{
  const health=assessConfirmedDefaultHealth([
    historyEntry('a',19,'worse'),
    historyEntry('b',20,'worse')
  ],'p1');
  assert.equal(health.suspended,true);
  assert.equal(health.status,'review-required');
});

test('one worse assessment does not suspend a confirmed default',()=>{
  const health=assessConfirmedDefaultHealth([
    historyEntry('a',18,'right'),
    historyEntry('b',19,'worse')
  ],'p1');
  assert.equal(health.suspended,false);
});

test('suspended default is not applied',()=>{
  const now=new Date('2026-07-21T12:00:00Z').getTime();
  const supportive=['x','y','z'].map((id,index)=>({
    id,
    completedAt:new Date(now-(index+5)*86400000).toISOString(),
    decision:{practice:{id:'recovery'}},
    adaptationAccountability:{
      at:new Date(now-(index+5)*86400000).toISOString(),
      fit:'right',
      choices:[{phaseName:'Main',level:'regression',source:'person'}]
    }
  }));
  const patternId='adaptation-pattern-recovery-main-regression';
  const reviews=[{patternId,status:'confirmed'}];
  const recentWorse=[historyEntry('a',19,'worse'),historyEntry('b',20,'worse')].map(entry=>({
    ...entry,
    adaptationAccountability:{
      ...entry.adaptationAccountability,
      choices:entry.adaptationAccountability.choices.map(choice=>({...choice,patternId}))
    }
  }));
  const history=[...recentWorse,...supportive];
  const result=resolveConfirmedAdaptationDefault({
    history,reviews,practiceId:'recovery',phaseName:'Main',
    availableLevels:['regression','technique'],
    contextRecommendedLevel:'technique',now
  });
  assert.equal(result.applied,false);
  assert.equal(result.suspended,true);
});
