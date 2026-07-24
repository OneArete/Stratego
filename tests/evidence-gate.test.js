import test from 'node:test';
import assert from 'node:assert/strict';
import { dailyContextEvidence,currentDayJudgement,evidenceGate } from '../src/core/evidence-gate.js';

const now=new Date('2026-07-24T10:00:00');
const complete={sleep:3,energy:2,time:30,challenge:'recovery',soreness:'mild',emotionalLoad:'usual'};

test('Evidence Gate blocks deliberation when current-day context is absent',()=>{
  const gate=evidenceGate({checkIns:[],judgements:[{createdAt:'2026-07-23T09:00:00',judgement:'Old advice'}],now});
  assert.equal(gate.canDeliberate,false);
  assert.equal(gate.judgement,null);
  assert.deepEqual(gate.context.signals,{});
});

test('Evidence Gate ignores historical judgements even when history exists',()=>{
  assert.equal(currentDayJudgement([{createdAt:'2026-07-23T09:00:00',status:'proposed'}],now),null);
});

test('Evidence Gate permits deliberation only after explicit current-day evidence',()=>{
  const checkIns=[{day:'2026-07-24',signals:complete,source:'person-confirmed'}];
  const gate=evidenceGate({checkIns,judgements:[],now});
  assert.equal(gate.canDeliberate,true);
  assert.equal(gate.context.completed,6);
});

test('Evidence Gate exposes only a current-day judgement after sufficient context',()=>{
  const checkIns=[{day:'2026-07-24',signals:complete,source:'person-confirmed'}];
  const judgements=[{createdAt:'2026-07-23T09:00:00',status:'proposed',judgement:'Old advice'},{createdAt:'2026-07-24T09:00:00',status:'proposed',judgement:'Protect recovery.'}];
  const gate=evidenceGate({checkIns,judgements,now});
  assert.equal(gate.judgement.judgement,'Protect recovery.');
});

test('partial records remain insufficient',()=>{
  const evidence=dailyContextEvidence([{day:'2026-07-24',signals:{sleep:2}}],now);
  assert.equal(evidence.sufficient,false);
  assert.equal(evidence.completed,1);
});
