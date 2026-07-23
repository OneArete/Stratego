import test from 'node:test';
import assert from 'node:assert/strict';
import {buildExplainRecord,explainRecordAudit,explainRecordSummary,validateExplainRecord,EXPLAIN_ENGINE_VERSION} from '../src/core/explain.js?v=0390p1';

const decision={
  id:'j1',
  judgement:'Recovery is the strongest fit.',
  confidence:74,
  practice:{id:'recovery',name:'Recovery'},
  advisors:[
    {advisor:'Recovery',position:'Support',reason:'Energy is limited.',scores:{recovery:10}},
    {advisor:'Body',position:'Caution',reason:'Physical load should stay low.',scores:{recovery:7}}
  ],
  understanding:{summary:'Recovery demand is currently elevated.'},
  unknowns:['Whether energy will improve later.'],
  boundaries:{
    runnerUp:{id:'walk',name:'Walk'},
    changeConditions:['Higher energy would widen the options.']
  }
};

test('canonical record separates epistemic classes',()=>{
  const record=buildExplainRecord(decision,{context:{sleep:2,energy:1,time:15,challenge:'recovery'}});
  assert.equal(record.version,EXPLAIN_ENGINE_VERSION);
  assert.ok(record.observations.length>0);
  assert.ok(record.inferences.length>0);
  assert.equal(record.unknowns.length,1);
  assert.equal(record.alternatives.length,1);
  assert.equal(record.changeConditions.length,1);
});

test('observations and inferences have different sources',()=>{
  const record=buildExplainRecord(decision,{context:{sleep:2,energy:1,time:15,challenge:'recovery'}});
  assert.equal(record.observations[0].source,'person-reported-context');
  assert.equal(record.inferences[0].source,'Strategos-reasoning');
});

test('record preserves provenance without behaviour influence',()=>{
  const record=buildExplainRecord({...decision,humanModelSnapshot:{createdAt:'2026-07-22T09:00:00Z'},safetyEnvelope:{createdAt:'2026-07-22T09:01:00Z'}},{context:{}});
  assert.equal(record.provenance.humanModelSnapshotAt,'2026-07-22T09:00:00Z');
  assert.equal(record.provenance.safetyEnvelopeAt,'2026-07-22T09:01:00Z');
  assert.equal(record.provenance.behaviourInfluence,0);
});

test('record validation detects canonical integrity',()=>{
  const record=buildExplainRecord(decision,{context:{}});
  assert.equal(validateExplainRecord(record).valid,true);
  assert.equal(validateExplainRecord({...record,judgementId:null}).valid,false);
});

test('audit and summary are person-readable',()=>{
  const record=buildExplainRecord(decision,{context:{}});
  assert.equal(explainRecordAudit(record).status,'preserved');
  assert.match(explainRecordSummary(record),/observed/);
});
