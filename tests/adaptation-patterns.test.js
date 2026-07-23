import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deriveAdaptationPatterns,
  adaptationPatternCandidates,
  adaptationPatternSummary,
  adaptationPatternAudit
} from '../src/core/adaptation-patterns.js';

const now=new Date('2026-07-20T12:00:00Z').getTime();
const entry=(id,daysAgo,fit='right',level='regression',practiceId='recovery')=>({
  id,
  completedAt:new Date(now-daysAgo*86400000).toISOString(),
  decision:{practice:{id:practiceId}},
  adaptationAccountability:{
    at:new Date(now-daysAgo*86400000).toISOString(),
    fit,
    choices:[{phaseIndex:0,phaseName:'Main',level}]
  }
});

test('three supportive comparable sessions create a candidate',()=>{
  const patterns=adaptationPatternCandidates([entry('a',2),entry('b',4),entry('c',7)],now);
  assert.equal(patterns.length,1);
  assert.equal(patterns[0].status,'candidate');
  assert.equal(patterns[0].uniqueSessions,3);
});

test('two sessions remain insufficient',()=>{
  const patterns=deriveAdaptationPatterns([entry('a',2),entry('b',4)],now);
  assert.equal(patterns[0].status,'insufficient');
});

test('different practices do not merge',()=>{
  const patterns=deriveAdaptationPatterns([
    entry('a',2,'right','regression','recovery'),
    entry('b',3,'right','regression','strength'),
    entry('c',4,'right','regression','recovery')
  ],now);
  assert.equal(patterns.length,2);
});

test('different adaptation levels do not merge',()=>{
  const patterns=deriveAdaptationPatterns([
    entry('a',2,'right','regression'),
    entry('b',3,'right','progression')
  ],now);
  assert.equal(patterns.length,2);
});

test('worse fit does not support a pattern',()=>{
  const patterns=deriveAdaptationPatterns([
    entry('a',2,'worse'),
    entry('b',3,'right'),
    entry('c',4,'right')
  ],now);
  assert.equal(patterns[0].supportive,2);
  assert.equal(patterns[0].status,'insufficient');
});

test('evidence older than 180 days is excluded',()=>{
  const patterns=deriveAdaptationPatterns([
    entry('old',181),
    entry('a',2),
    entry('b',3)
  ],now);
  assert.equal(patterns[0].supportive,2);
});

test('candidates never influence judgement in phase 1',()=>{
  const pattern=adaptationPatternCandidates([entry('a',2),entry('b',3),entry('c',4)],now)[0];
  assert.equal(pattern.influence,0);
  assert.equal(pattern.eligibleForJudgementInfluence,false);
});

test('summary is person-readable',()=>{
  const pattern=adaptationPatternCandidates([entry('a',2),entry('b',3),entry('c',4)],now)[0];
  assert.match(adaptationPatternSummary(pattern),/easier version/);
  assert.match(adaptationPatternSummary(pattern),/3 comparable Practices/);
});

test('audit states the epistemic boundary',()=>{
  const audit=adaptationPatternAudit([entry('a',2),entry('b',3),entry('c',4)],now);
  assert.equal(audit.influential,0);
  assert.match(audit.statement,/do not yet influence judgement/);
});
