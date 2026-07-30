import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildUnderstanding } from '../src/core/understanding.js';
import { conveneAgora } from '../src/core/agora.js';
import { effectiveMemoryWeight, normalizeAdvisorMemories, CANDIDATE_INFLUENCE } from '../src/core/advisor-memory.js';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const base={sleep:3,energy:2,time:15,challenge:'body',soreness:'none',emotionalLoad:'usual'};

test('a candidate (unreviewed) advisor learning already has non-zero influence — this is the behaviour being disclosed',()=>{
  const memories=normalizeAdvisorMemories({Body:{weights:{strength:{value:.2,observations:4,positive:3,neutral:0,negative:1,lastObservedAt:new Date().toISOString(),contexts:{},learningStatus:'candidate'}}}});
  const weight=effectiveMemoryWeight(memories.Body.weights.strength);
  assert.ok(weight>0,'a candidate weight must already be non-zero — it is not waiting for confirmation');
  assert.ok(weight<.2,'candidate influence must be reduced relative to the raw learned value');
});

test('confirmed advisor learning carries full weight; rejected carries none',()=>{
  const confirmed=normalizeAdvisorMemories({Body:{weights:{strength:{value:.2,observations:4,positive:4,neutral:0,negative:0,lastObservedAt:new Date().toISOString(),contexts:{},learningStatus:'confirmed'}}}});
  const rejected=normalizeAdvisorMemories({Body:{weights:{strength:{value:.2,observations:4,positive:4,neutral:0,negative:0,lastObservedAt:new Date().toISOString(),contexts:{},learningStatus:'rejected'}}}});
  assert.equal(effectiveMemoryWeight(confirmed.Body.weights.strength),.2);
  assert.equal(effectiveMemoryWeight(rejected.Body.weights.strength),0);
});

test('Understanding discloses that candidate learning already influences Practice scoring, not just after confirmation',()=>{
  assert.match(app,/ACCOUNTABLE LEARNING/);
  assert.match(app,/A candidate learning already carries reduced weight/);
  assert.match(app,/it is not waiting for your confirmation to begin influencing recommendations/);
});

test('the disclosed percentage matches the actual CANDIDATE_INFLUENCE constant, not a hardcoded guess',()=>{
  assert.match(app,/up to \$\{Math\.round\(CANDIDATE_INFLUENCE\*100\)\}%/);
  assert.equal(CANDIDATE_INFLUENCE,.45);
});

test('conveneAgora surfaces per-advisor memory adjustments on the winning practice for judgement-time disclosure',()=>{
  const memories={Body:{weights:{strength:{value:.2,observations:4,positive:3,neutral:0,negative:1,lastObservedAt:new Date().toISOString(),contexts:{},learningStatus:'confirmed'}},notes:[],experience:4,confidence:60,coverage:40}};
  const result=conveneAgora(base,buildUnderstanding(base),[],memories);
  const bodyAdvisor=result.advisors.find(a=>a.advisor==='Body');
  assert.ok(bodyAdvisor.memory);
  assert.ok(Array.isArray(bodyAdvisor.memory.applied));
  const appliedToWinner=bodyAdvisor.memory.applied.find(item=>item.practice===result.practice.id);
  if(result.practice.id==='strength'){
    assert.ok(appliedToWinner,'when Strength wins, its memory adjustment must be present for disclosure');
    assert.equal(appliedToWinner.status,'confirmed');
  }
});

test('the judgement screen renders a Learned from experience panel driven by advisor memory, not just Learned from you (beliefs)',()=>{
  assert.match(app,/LEARNED FROM EXPERIENCE/);
  assert.match(app,/memoryAdjustments\.length/);
  assert.match(app,/reflected experience/);
  assert.match(app,/Candidate learning already carries reduced weight before review/);
});

test('advisor memory disclosure never claims a false zero — no automaticInfluence-style hardcoded zero exists for advisor memory',()=>{
  // Unlike belief-system's pre-Phase-2 bug, advisor-memory has never claimed zero influence in its own data;
  // this test guards against a future regression reintroducing a false "influence: 0" claim near this section.
  const sectionStart=app.indexOf('ACCOUNTABLE LEARNING');
  const sectionEnd=app.indexOf('</section>',sectionStart);
  const section=app.slice(sectionStart,sectionEnd);
  assert.doesNotMatch(section,/influence: 0/i);
});
