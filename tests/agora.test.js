import test from 'node:test';
import assert from 'node:assert/strict';
import { buildUnderstanding } from '../src/core/understanding.js';
import { conveneAgora } from '../src/core/agora.js';

const base={sleep:3,energy:2,time:15,challenge:'body',soreness:'none',emotionalLoad:'usual'};

test('significant soreness blocks Strength',()=>{
  const context={...base,soreness:'significant',energy:3};
  const result=conveneAgora(context,buildUnderstanding(context),[],{});
  assert.notEqual(result.practice.id,'strength');
  assert.ok(result.agora.blockedPractices.some(item=>item.practiceId==='strength'));
  assert.equal(result.advisors.find(a=>a.advisor==='Body').position,'Oppose');
});

test('heavy emotional load materially changes deliberation',()=>{
  const usual=conveneAgora(base,buildUnderstanding(base),[],{});
  const heavyContext={...base,challenge:'work',emotionalLoad:'heavy'};
  const heavy=conveneAgora(heavyContext,buildUnderstanding(heavyContext),[],{});
  assert.equal(heavy.advisors.find(a=>a.advisor==='Mind').position,'Caution');
  assert.ok(heavy.scores.recovery>usual.scores.recovery);
  assert.ok(heavy.scores.focus<conveneAgora({...base,challenge:'work'},buildUnderstanding({...base,challenge:'work'}),[],{}).scores.focus);
});

test('Agora preserves strongest caution',()=>{
  const context={...base,soreness:'mild'};
  const result=conveneAgora(context,buildUnderstanding(context),[],{});
  assert.ok(result.agora.strongestCaution);
  assert.ok(result.agora.cautions.length>=1);
});

test('interface confidence is qualitative',()=>{
  const result=conveneAgora(base,buildUnderstanding(base),[],{});
  assert.ok(['Limited','Moderate','Relatively Strong'].includes(result.confidenceLevel));
});
