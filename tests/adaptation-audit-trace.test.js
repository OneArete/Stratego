import test from 'node:test';
import assert from 'node:assert/strict';
import {buildAdaptationAuditTrace,adaptationAuditTraceSummary} from '../src/core/adaptation-patterns.js';

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

test('trace preserves candidate and person confirmation lineage',()=>{
  const patternId='adaptation-pattern-recovery-main-regression';
  const trace=buildAdaptationAuditTrace({
    history,
    reviews:[{patternId,status:'confirmed',reviewedAt:'2026-07-20T10:00:00Z'}],
    now
  });
  assert.equal(trace.length,1);
  assert.ok(trace[0].events.some(event=>event.type==='candidate-formed'));
  assert.ok(trace[0].events.some(event=>event.type==='person-confirmed'));
});

test('trace preserves zero judgement influence',()=>{
  const trace=buildAdaptationAuditTrace({history,reviews:[],now});
  assert.equal(trace[0].judgementInfluence,0);
});

test('trace events remain chronological',()=>{
  const patternId='adaptation-pattern-recovery-main-regression';
  const trace=buildAdaptationAuditTrace({
    history,
    reviews:[{patternId,status:'confirmed',reviewedAt:'2026-07-20T10:00:00Z'}],
    now
  })[0];
  const times=trace.events.map(event=>Date.parse(event.at));
  assert.deepEqual(times,[...times].sort((a,b)=>a-b));
});

test('summary reports lineages and influence boundary',()=>{
  const trace=buildAdaptationAuditTrace({history,reviews:[],now});
  const summary=adaptationAuditTraceSummary(trace);
  assert.equal(summary.total,1);
  assert.equal(summary.judgementInfluence,0);
  assert.match(summary.statement,/none influence judgement selection/);
});
