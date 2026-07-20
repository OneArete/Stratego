import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDeliberationTrace,
  buildMinorityReports,
  verifyTraceIntegrity,
  summarizeMinorityReports
} from '../src/core/deliberation-trace.js';
import { migrateV0100Phase1ToPhase2 } from '../src/core/state-schema.js';

const context={sleep:3,energy:2,time:15,challenge:'body',soreness:'mild',emotionalLoad:'usual'};
const understanding={confidence:.7,unknowns:['Recent fatigue is uncertain.'],contradictions:[]};
const advisors=[
  {advisor:'Body',position:'Support',confidence:80,weight:1.1,reason:'Movement is useful.',scores:{walk:.8,recovery:.4},riskFlags:[],evidence:[{family:'current_signal'}]},
  {advisor:'Recovery',position:'Caution',confidence:76,weight:1.15,reason:'Mild soreness argues for lower load.',scores:{walk:.4,recovery:.85},riskFlags:[{severity:'moderate',description:'Load sensitivity.'}],evidence:[{family:'current_signal'}]},
  {advisor:'Mind',position:'Neutral',confidence:65,weight:1,reason:'No strong cognitive claim.',scores:{walk:.3,recovery:.3},riskFlags:[],evidence:[]}
];
const agora={blockedPractices:[],strongestCaution:{advisor:'Recovery'},evidenceDiversity:{level:'Narrow'},contradictions:[]};
const decision={practice:{id:'walk',name:'Walk'},confidence:70,confidenceLevel:'Moderate'};

test('trace records signals, understanding, every Advisor and synthesis',()=>{
  const trace=buildDeliberationTrace({context,understanding,advisors,agora,decision});
  assert.equal(trace.eventCount,6);
  assert.equal(trace.events[0].type,'signals');
  assert.equal(trace.events.at(-1).type,'synthesis');
  assert.equal(trace.events.filter(item=>item.type==='advisor').length,3);
});

test('trace event order is continuous and verifiable',()=>{
  const trace=buildDeliberationTrace({context,understanding,advisors,agora,decision});
  assert.deepEqual(trace.events.map(item=>item.order),[1,2,3,4,5,6]);
  assert.equal(verifyTraceIntegrity(trace).valid,true);
});

test('trace integrity detects missing synthesis and broken order',()=>{
  const trace=buildDeliberationTrace({context,understanding,advisors,agora,decision});
  trace.events=trace.events.filter(item=>item.type!=='synthesis');
  trace.events[1].order=1;
  const result=verifyTraceIntegrity(trace);
  assert.equal(result.valid,false);
  assert.ok(result.errors.length>=2);
});

test('cautionary Advisor becomes a preserved minority report',()=>{
  const reports=buildMinorityReports(advisors,'walk',agora);
  const recovery=reports.find(item=>item.advisor==='Recovery');
  assert.ok(recovery);
  assert.equal(recovery.position,'Caution');
  assert.equal(recovery.preferredPracticeId,'recovery');
});

test('strongest caution is ordered first',()=>{
  const reports=buildMinorityReports(advisors,'walk',agora);
  assert.equal(reports[0].advisor,'Recovery');
});

test('supporting Advisor with strong winner score is not mislabelled minority',()=>{
  const reports=buildMinorityReports(advisors,'walk',agora);
  assert.equal(reports.some(item=>item.advisor==='Body'),false);
});

test('minority summary preserves number and high severity',()=>{
  const reports=[
    {severity:'high'},
    {severity:'moderate'}
  ];
  const summary=summarizeMinorityReports(reports);
  assert.ok(summary.includes('2 minority positions'));
  assert.ok(summary.includes('1 high-severity concern'));
});

test('phase 1 state migrates to schema 10 trace-ready judgements',()=>{
  const migrated=migrateV0100Phase1ToPhase2({
    schemaVersion:9,
    judgements:[{id:'j1'}],
    history:[{decision:{id:'j1'}}],
    current:{decision:{id:'j1'}}
  });
  assert.equal(migrated.schemaVersion,10);
  assert.deepEqual(migrated.judgements[0].minorityReports,[]);
  assert.equal(migrated.judgements[0].deliberationTrace,null);
});
