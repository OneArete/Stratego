import test from 'node:test';
import assert from 'node:assert/strict';
import {
  reconcileLongitudinalState,
  calculateDeltaTotal,
  createMonthlyCouncilSnapshot,
  upsertMonthlyCouncilReport,
  journeyRecords
} from '../src/core/longitudinal-integrity.js';
import { migrateV090Phase3ToFinal } from '../src/core/state-schema.js';

const judgement=(id,status='proposed')=>({
  id,status,createdAt:'2026-07-01T10:00:00.000Z',
  practice:{id:'walk',name:'Walk'},
  judgement:'Walk deliberately.',
  confidence:70,
  validity:{status:status==='reviewed'?'closed':'current',validUntil:'2026-07-02T10:00:00.000Z'},
  delta:{overall:.2}
});

test('reconciliation removes duplicate judgements and history entries',()=>{
  const j=judgement('j1','reviewed');
  const entry={judgementId:'j1',decision:j,reflection:'right',completedAt:'2026-07-01T11:00:00.000Z'};
  const {state,report}=reconcileLongitudinalState({
    judgements:[j,{...j}],
    history:[entry,{...entry}],
    advisorMemories:{}
  },new Date('2026-07-01T12:00:00.000Z').getTime());
  assert.equal(state.judgements.length,1);
  assert.equal(state.history.length,1);
  assert.equal(report.duplicateJudgementsRemoved,1);
  assert.equal(report.duplicateHistoryRemoved,1);
});

test('history completion repairs judgement status and validity',()=>{
  const j=judgement('j2','completed');
  const {state}=reconcileLongitudinalState({
    judgements:[j],
    history:[{decision:j,reflection:'better',completedAt:'2026-07-01T11:00:00.000Z'}],
    advisorMemories:{}
  },new Date('2026-07-01T12:00:00.000Z').getTime());
  assert.equal(state.judgements[0].status,'reviewed');
  assert.equal(state.judgements[0].validity.status,'closed');
  assert.equal(state.history[0].judgementId,'j2');
});

test('closed or impossible current state is cleared',()=>{
  const j=judgement('j3','reviewed');
  const closed=reconcileLongitudinalState({
    judgements:[j],history:[],current:{decision:j,context:{}},advisorMemories:{}
  },new Date('2026-07-01T12:00:00.000Z').getTime());
  assert.equal(closed.state.current,null);
  assert.equal(closed.report.staleCurrentCleared,true);

  const missing=reconcileLongitudinalState({
    judgements:[],history:[],current:{decision:judgement('missing'),context:{}},advisorMemories:{}
  });
  assert.equal(missing.state.current,null);
});

test('delta total is recalculated from canonical history',()=>{
  const history=[
    {judgementId:'delta-1',decision:{id:'delta-1',delta:{overall:.2}}},
    {judgementId:'delta-2',decision:{id:'delta-2',delta:{overall:-.05}}},
    {judgementId:'delta-3',decision:{id:'delta-3',delta:{overall:'invalid'}}}
  ];
  assert.equal(calculateDeltaTotal(history),.15);
  const {state}=reconcileLongitudinalState({history,judgements:[],advisorMemories:{},deltaTotal:99});
  assert.equal(state.deltaTotal,.15);
});

test('monthly council snapshot is deterministic for a month',()=>{
  const state={advisorMemories:{},history:[]};
  const now=new Date('2026-07-19T12:00:00.000Z');
  const snapshot=createMonthlyCouncilSnapshot(state,now);
  assert.equal(snapshot.id,'council-2026-07');
  assert.equal(snapshot.monthKey,'2026-07');
  assert.equal(snapshot.status,'snapshot');
});

test('monthly council report is updated rather than duplicated',()=>{
  const state={advisorMemories:{},history:[]};
  const now=new Date('2026-07-19T12:00:00.000Z');
  let reports=upsertMonthlyCouncilReport([],state,now);
  reports=upsertMonthlyCouncilReport(reports,state,new Date('2026-07-20T12:00:00.000Z'));
  assert.equal(reports.length,1);
  assert.equal(reports[0].monthKey,'2026-07');
});

test('Journey records link reviewed judgements to canonical history',()=>{
  const j=judgement('j4','reviewed');
  const records=journeyRecords({
    judgements:[j],
    history:[{judgementId:'j4',decision:j,reflection:'better',completedAt:'2026-07-01T11:00:00.000Z'}]
  });
  assert.equal(records.length,1);
  assert.equal(records[0].historyLinked,true);
  assert.equal(records[0].reflection,'better');
});

test('phase 3 state migrates to schema 8 integrity shape',()=>{
  const migrated=migrateV090Phase3ToFinal({
    schemaVersion:7,
    history:[{decision:{id:'j5'}}],
    councilReports:[]
  });
  assert.equal(migrated.schemaVersion,8);
  assert.equal(migrated.history[0].judgementId,'j5');
  assert.ok(migrated.integrity);
});
