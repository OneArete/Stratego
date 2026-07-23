import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPracticeContract,practiceContractSummary,snapshotPracticeContract} from '../src/core/practice-session.js';

test('Practice contract names intended effect and enough condition',()=>{
  const contract=buildPracticeContract({judgement:{id:'j1',duration:15,intention:'Recover deliberately.',practice:{id:'recovery',name:'Recovery',domain:'Recovery',phases:[]}}});
  assert.equal(contract.practiceName,'Recovery');
  assert.match(contract.expectedEffect,/steadiness|recovery/);
  assert.match(contract.enough,/15 minutes/);
  assert.match(contract.certainty,/not a promised outcome/);
});
test('contract carries a reflection question',()=>{
  const contract=buildPracticeContract({judgement:{practice:{name:'Connection',domain:'Relationships'},duration:10}});
  assert.match(contract.review,/contact|understanding/);
});
test('low energy adds a conservative boundary',()=>{
  const contract=buildPracticeContract({judgement:{practice:{name:'Movement',domain:'Body'},duration:10},context:{energy:1}});
  assert.ok(contract.stopConditions.some(item=>/energy is low/.test(item)));
});
test('significant soreness adds least-demanding guidance',()=>{
  const contract=buildPracticeContract({judgement:{practice:{name:'Movement',domain:'Body'},duration:10},context:{soreness:'significant'}});
  assert.ok(contract.stopConditions.some(item=>/least demanding valid version/.test(item)));
});
test('snapshot preserves the pre-action contract',()=>{
  const contract=buildPracticeContract({judgement:{id:'j1',practice:{id:'focus',name:'Focus'},duration:5}});
  const snapshot=snapshotPracticeContract(contract,'2026-07-21T10:00:00Z');
  assert.equal(snapshot.createdAt,'2026-07-21T10:00:00Z');
  assert.equal(snapshot.editableDuringPractice,false);
  assert.equal(snapshot.judgementId,'j1');
});
test('summary remains concise',()=>{
  const contract=buildPracticeContract({judgement:{practice:{name:'Recovery'},duration:5}});
  assert.match(practiceContractSummary(contract),/Recovery · 5 min/);
});
