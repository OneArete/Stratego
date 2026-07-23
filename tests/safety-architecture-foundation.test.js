import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSafetyEnvelope,safetyEnvelopeAudit,safetyEnvelopeSummary,SAFETY_ARCHITECTURE_VERSION} from '../src/core/safety-architecture.js?v=0390p1';

test('clear envelope is explicit',()=>{
  const envelope=buildSafetyEnvelope({context:{},decision:{advisors:[],agora:{blockedPractices:[],cautions:[]}}});
  assert.equal(envelope.status,'clear');
  assert.equal(envelope.version,SAFETY_ARCHITECTURE_VERSION);
});

test('blocked Practice creates a constrained envelope',()=>{
  const envelope=buildSafetyEnvelope({decision:{advisors:[],agora:{blockedPractices:[{practiceId:'strength',reason:'Significant soreness',source:'canonical-practice-eligibility',matchedContraindications:['significant-soreness']}],cautions:[]}}});
  assert.equal(envelope.status,'constrained');
  assert.equal(envelope.blockedPractices.length,1);
});

test('critical advisor risk is preserved',()=>{
  const envelope=buildSafetyEnvelope({decision:{advisors:[{advisor:'Body',riskFlags:[{domain:'physical',severity:'critical',description:'Risk',reversibility:'difficult'}]}],agora:{blockedPractices:[],cautions:[]}}});
  assert.equal(envelope.criticalRisks.length,1);
  assert.equal(envelope.difficultToReverse.length,1);
});

test('caution alone does not create a new constraint',()=>{
  const envelope=buildSafetyEnvelope({decision:{advisors:[],agora:{blockedPractices:[],cautions:[{advisor:'Recovery',position:'Caution',reason:'Low energy'}]}}});
  assert.equal(envelope.status,'caution');
  assert.equal(envelope.operatingBoundary.rankingChange,0);
});

test('Phase 1 operating boundary is zero change',()=>{
  const envelope=buildSafetyEnvelope({decision:{advisors:[],agora:{blockedPractices:[],cautions:[]}}});
  assert.deepEqual(envelope.operatingBoundary,{behaviourChange:0,rankingChange:0,confidenceChange:0,durationChange:0,executionChange:0});
});

test('audit and summary are person-readable',()=>{
  const envelope=buildSafetyEnvelope({decision:{advisors:[],agora:{blockedPractices:[],cautions:[]}}});
  assert.equal(safetyEnvelopeAudit(envelope).status,'clear');
  assert.match(safetyEnvelopeSummary(envelope),/^clear/);
});
