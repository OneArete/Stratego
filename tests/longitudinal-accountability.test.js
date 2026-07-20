import test from 'node:test';
import assert from 'node:assert/strict';
import {
  verifyJudgementLongitudinalSources,
  reconcileJudgementLongitudinalIntegrity,
  buildLongitudinalAuditEntry,
  longitudinalAccountabilitySummary
} from '../src/core/longitudinal-accountability.js';
import { migrateV0143ToV0144 } from '../src/core/state-schema.js';

const judgement={
  id:'j1',
  status:'current',
  practice:{id:'walk',name:'Walk'},
  longitudinalEvidence:{
    items:[{
      patternId:'p1',
      practiceId:'walk',
      direction:'support',
      adjustment:.1,
      sourceContextKey:'body|none|usual',
      targetContextKey:'body|none|usual',
      transferStatus:'supported'
    }]
  }
};

const state={
  judgements:[judgement],
  outcomePatterns:[{id:'p1',practiceId:'walk',status:'stable'}],
  patternTransfers:[{id:'t1',patternId:'p1',targetContextKey:'body|none|usual',status:'supported'}],
  current:{decision:{id:'j1'}}
};

test('valid longitudinal sources remain valid',()=>{
  const result=verifyJudgementLongitudinalSources(judgement,state);
  assert.equal(result.valid,true);
  assert.equal(result.status,'valid');
});

test('missing pattern requires judgement review',()=>{
  const result=verifyJudgementLongitudinalSources(judgement,{...state,outcomePatterns:[]});
  assert.equal(result.valid,false);
  assert.match(result.reasons[0],/no longer exists/);
});

test('rejected transfer requires judgement review',()=>{
  const result=verifyJudgementLongitudinalSources(judgement,{
    ...state,
    patternTransfers:[{...state.patternTransfers[0],status:'rejected'}]
  });
  assert.equal(result.valid,false);
  assert.match(result.reasons.join(' '),/was rejected/);
});

test('influence above boundary is invalid',()=>{
  const result=verifyJudgementLongitudinalSources({
    ...judgement,
    longitudinalEvidence:{items:[{...judgement.longitudinalEvidence.items[0],adjustment:.2}]}
  },state);
  assert.equal(result.valid,false);
});

test('reconciliation marks active judgement review-required',()=>{
  const {state:next,report}=reconcileJudgementLongitudinalIntegrity({
    ...state,
    patternTransfers:[{...state.patternTransfers[0],status:'rejected'}]
  });
  assert.equal(next.judgements[0].status,'review-required');
  assert.equal(report.reviewRequired,1);
});

test('closed judgement keeps lifecycle status but records invalidity',()=>{
  const closed={...judgement,status:'reviewed',validity:{status:'closed'}};
  const {state:next}=reconcileJudgementLongitudinalIntegrity({
    ...state,
    judgements:[closed],
    outcomePatterns:[]
  });
  assert.equal(next.judgements[0].status,'reviewed');
  assert.equal(next.judgements[0].longitudinalIntegrity.status,'review-required');
});

test('audit entry and summary are person-readable',()=>{
  const {state:next}=reconcileJudgementLongitudinalIntegrity(state);
  const audit=buildLongitudinalAuditEntry(next.judgements[0]);
  const summary=longitudinalAccountabilitySummary(next);
  assert.equal(audit.sourceCount,1);
  assert.match(summary.statement,/1 longitudinal judgements valid/);
});

test('v0.14.3 state migrates to schema 24 accountability shape',()=>{
  const migrated=migrateV0143ToV0144({schemaVersion:23});
  assert.equal(migrated.schemaVersion,24);
  assert.equal(migrated.productVersion,'0.14.4');
  assert.ok(migrated.longitudinalAccountability);
});
