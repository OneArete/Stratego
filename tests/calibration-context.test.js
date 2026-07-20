import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calibrationContextKey,
  selectCalibrationCohort,
  calibrationRecencyWeight,
  weightedCalibrationSummary,
  contextCalibrationCorrection,
  calibrationCohortSummary
} from '../src/core/calibration-context.js';
import { migrateV0150Phase1ToPhase3 } from '../src/core/state-schema.js';

const now=new Date('2026-07-20T10:00:00.000Z').getTime();
const forecast=(id,{
  domain='Body',
  practiceId='walk',
  challenge='body',
  direction='matched',
  score=.8,
  daysAgo=10
}={})=>({
  id,
  status:'resolved',
  domain,
  practiceId,
  challenge,
  resolvedAt:new Date(now-daysAgo*86400000).toISOString(),
  calibration:{
    exact:direction==='matched',
    direction,
    score
  }
});

test('context key includes domain practice and challenge',()=>{
  assert.equal(calibrationContextKey({domain:'Body',practiceId:'walk',challenge:'body'}),'Body|walk|body');
});

test('exact cohort is preferred when four comparable forecasts exist',()=>{
  const forecasts=[0,1,2,3].map(i=>forecast(`f${i}`));
  const cohort=selectCalibrationCohort(forecasts,{domain:'Body',practiceId:'walk',challenge:'body',now});
  assert.equal(cohort.scope,'exact');
  assert.equal(cohort.forecasts.length,4);
});

test('domain cohort is fallback when exact cohort is too small',()=>{
  const forecasts=[
    forecast('f1',{practiceId:'walk'}),
    forecast('f2',{practiceId:'walk'}),
    forecast('f3',{practiceId:'strength'}),
    forecast('f4',{practiceId:'strength'})
  ];
  const cohort=selectCalibrationCohort(forecasts,{domain:'Body',practiceId:'walk',challenge:'body',now});
  assert.equal(cohort.scope,'domain');
  assert.equal(cohort.forecasts.length,4);
});

test('unrelated domains are excluded',()=>{
  const forecasts=[0,1,2,3].map(i=>forecast(`f${i}`,{domain:'Mind',challenge:'mind'}));
  const cohort=selectCalibrationCohort(forecasts,{domain:'Body',practiceId:'walk',challenge:'body',now});
  assert.equal(cohort.scope,'insufficient');
});

test('older forecasts receive less or no weight',()=>{
  assert.equal(calibrationRecencyWeight(forecast('fresh',{daysAgo:10}),now),1);
  assert.equal(calibrationRecencyWeight(forecast('old',{daysAgo:120}),now),.65);
  assert.equal(calibrationRecencyWeight(forecast('expired',{daysAgo:220}),now),0);
});

test('weighted overestimation creates negative correction',()=>{
  const forecasts=[0,1,2,3].map(i=>forecast(`f${i}`,{direction:i<3?'overestimated':'matched'}));
  const cohort={scope:'exact',forecasts};
  const correction=contextCalibrationCorrection(cohort,now);
  assert.equal(correction.adjustment,-.03);
  assert.ok(weightedCalibrationSummary(forecasts,now).overestimatedRatio>=.5);
});

test('cohort summary exposes scope',()=>{
  const cohort={scope:'exact',forecasts:[forecast('f1'),forecast('f2'),forecast('f3'),forecast('f4')]};
  const correction=contextCalibrationCorrection(cohort,now);
  assert.match(calibrationCohortSummary(cohort,correction),/same practice and context/);
});

test('phase 2 state migrates to schema 26 forecast provenance',()=>{
  const migrated=migrateV0150Phase1ToPhase3({
    schemaVersion:25,
    judgementForecasts:[{id:'f1',contextKey:'body|none|usual'}]
  });
  assert.equal(migrated.schemaVersion,26);
  assert.equal(migrated.judgementForecasts[0].domain,'unknown');
  assert.equal(migrated.judgementForecasts[0].challenge,'body');
});
