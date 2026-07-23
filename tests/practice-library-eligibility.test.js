import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CODEX,
  assessPracticeEligibility,
  assessPracticeLibraryEligibility,
  practiceEligibilitySummary
} from '../src/data/codex.js';

const strength=CODEX.find(item=>item.id==='strength');
const recovery=CODEX.find(item=>item.id==='recovery');

test('significant soreness blocks Strength by declared condition',()=>{
  const result=assessPracticeEligibility(strength,{soreness:'significant',energy:2,time:15,emotionalLoad:'usual'});
  assert.equal(result.status,'blocked');
  assert.deepEqual(result.matchedContraindications,['significant-soreness']);
});

test('low energy creates caution for moderate intensity',()=>{
  const result=assessPracticeEligibility(strength,{soreness:'none',energy:1,time:15,emotionalLoad:'usual'});
  assert.equal(result.status,'caution');
});

test('Recovery remains eligible in ordinary context',()=>{
  const result=assessPracticeEligibility(recovery,{soreness:'none',energy:2,time:15,emotionalLoad:'usual'});
  assert.equal(result.status,'eligible');
});

test('insufficient time creates caution without changing selection',()=>{
  const result=assessPracticeEligibility(strength,{soreness:'none',energy:2,time:5,emotionalLoad:'usual'});
  assert.equal(result.status,'caution');
  assert.equal(result.selectionInfluence,0);
});

test('library eligibility audit counts statuses',()=>{
  const audit=assessPracticeLibraryEligibility(CODEX,{soreness:'significant',energy:1,time:5,emotionalLoad:'heavy'});
  assert.equal(audit.items.length,CODEX.length);
  assert.ok(audit.blocked>=1);
  assert.equal(audit.selectionInfluence,0);
});

test('summary is person-readable',()=>{
  assert.match(practiceEligibilitySummary(assessPracticeEligibility(recovery,{})),/^eligible:/);
});
