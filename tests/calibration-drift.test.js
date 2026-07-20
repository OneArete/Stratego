import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectCalibrationDrift,
  calibrationDriftCorrection,
  buildCalibrationAccountability,
  verifyCalibrationAccountability,
  reconcileCalibrationAccountability,
  calibrationAccountabilitySummary
} from '../src/core/calibration-drift.js';
import { migrateV0150Phase3ToPhase4 } from '../src/core/state-schema.js';

const resolved=(id,score,direction='matched',daysAgo=0)=>({
  id,
  status:'resolved',
  domain:'Body',
  practiceId:'walk',
  challenge:'body',
  resolvedAt:new Date(Date.now()-daysAgo*86400000).toISOString(),
  calibration:{score,direction,exact:direction==='matched'}
});

test('fewer than six forecasts cannot establish drift',()=>{
  const drift=detectCalibrationDrift([0,1,2,3,4].map(i=>resolved(`f${i}`,.7)),{domain:'Body',practiceId:'walk',challenge:'body'});
  assert.equal(drift.status,'insufficient');
  assert.equal(drift.drift,false);
});

test('material score deterioration detects drift',()=>{
  const forecasts=[
    resolved('r1',.3,'overestimated',1),
    resolved('r2',.35,'overestimated',2),
    resolved('r3',.4,'matched',3),
    resolved('p1',.8,'matched',10),
    resolved('p2',.85,'matched',11),
    resolved('p3',.9,'matched',12)
  ];
  const drift=detectCalibrationDrift(forecasts,{domain:'Body',practiceId:'walk',challenge:'body'});
  assert.equal(drift.drift,true);
  assert.ok(drift.delta<=-.2);
});

test('two recent overestimations also detect drift',()=>{
  const forecasts=[
    resolved('r1',.6,'overestimated',1),
    resolved('r2',.6,'overestimated',2),
    resolved('r3',.7,'matched',3),
    resolved('p1',.7,'matched',10),
    resolved('p2',.7,'matched',11),
    resolved('p3',.7,'matched',12)
  ];
  assert.equal(detectCalibrationDrift(forecasts,{domain:'Body',practiceId:'walk',challenge:'body'}).drift,true);
});

test('drift correction is bounded at minus two points',()=>{
  const correction=calibrationDriftCorrection({drift:true});
  assert.equal(correction.adjustment,-.02);
});

test('accountability record combines calibration and drift',()=>{
  const record=buildCalibrationAccountability({
    judgementId:'j1',
    calibrationEvidence:{scope:'exact',cohortKey:'Body|walk|body',cohortSize:6,adjustment:-.03},
    drift:{status:'drift-detected',drift:true,delta:-.3}
  });
  assert.equal(record.totalAdjustment,-.05);
  assert.equal(verifyCalibrationAccountability(record).valid,true);
});

test('invalid combined adjustment is rejected',()=>{
  const result=verifyCalibrationAccountability({
    judgementId:'j1',
    calibrationAdjustment:-.03,
    driftAdjustment:-.03,
    totalAdjustment:-.06
  });
  assert.equal(result.valid,false);
});

test('reconciliation removes orphan and duplicate records',()=>{
  const record={id:'a1',judgementId:'j1',calibrationAdjustment:0,driftAdjustment:0,totalAdjustment:0};
  const state=reconcileCalibrationAccountability({
    judgements:[{id:'j1'}],
    calibrationAccountability:[record,{...record},{...record,id:'orphan',judgementId:'missing'}]
  });
  assert.equal(state.calibrationAccountability.length,1);
  assert.match(calibrationAccountabilitySummary(state.calibrationAccountability).statement,/1 calibration records valid/);
});

test('phase 3 state migrates to schema 27 accountability shape',()=>{
  const migrated=migrateV0150Phase3ToPhase4({schemaVersion:26});
  assert.equal(migrated.schemaVersion,27);
  assert.equal(migrated.productVersion,'0.15.0');
  assert.deepEqual(migrated.calibrationAccountability,[]);
});
