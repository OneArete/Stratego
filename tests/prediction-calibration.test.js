import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createJudgementForecast,
  resolveJudgementForecast,
  predictionCalibrationSummary,
  confidenceCorrection,
  reconcileJudgementForecasts,
  forecastSummary
} from '../src/core/prediction-calibration.js';
import { migrateV0144ToV0150Phase1 } from '../src/core/state-schema.js';

const judgement={id:'j1',practice:{id:'walk'}};
const context={challenge:'body',soreness:'none',emotionalLoad:'usual'};

test('creates open forecast before outcome',()=>{
  const f=createJudgementForecast({judgement,context,expectedEffect:'better',confidence:'medium'});
  assert.equal(f.status,'open');
  assert.equal(f.contextKey,'body|none|usual');
});

test('exact forecast resolves as matched',()=>{
  const f=createJudgementForecast({judgement,context,expectedEffect:'better',confidence:'high'});
  const r=resolveJudgementForecast(f,{actualEffect:'better',causalSource:'practice'});
  assert.equal(r.calibration.exact,true);
  assert.equal(r.calibration.direction,'matched');
});

test('optimistic forecast can be overestimated',()=>{
  const f=createJudgementForecast({judgement,context,expectedEffect:'better',confidence:'high'});
  const r=resolveJudgementForecast(f,{actualEffect:'worse',causalSource:'practice'});
  assert.equal(r.calibration.direction,'overestimated');
  assert.equal(r.calibration.accuracy,0);
});

test('external attribution reduces calibration score',()=>{
  const f=createJudgementForecast({judgement,context,expectedEffect:'better',confidence:'high'});
  const direct=resolveJudgementForecast(f,{actualEffect:'better',causalSource:'practice'});
  const external=resolveJudgementForecast(f,{actualEffect:'better',causalSource:'external'});
  assert.ok(direct.calibration.score>external.calibration.score);
});

test('summary counts exact and directional errors',()=>{
  const base=createJudgementForecast({judgement,context,expectedEffect:'better',confidence:'high'});
  const forecasts=[
    resolveJudgementForecast(base,{actualEffect:'better',causalSource:'practice'}),
    resolveJudgementForecast({...base,id:'f2'},{actualEffect:'right',causalSource:'practice'})
  ];
  const summary=predictionCalibrationSummary(forecasts);
  assert.equal(summary.resolved,2);
  assert.equal(summary.exact,1);
  assert.equal(summary.overestimated,1);
});

test('repeated overestimation reduces future confidence',()=>{
  const forecasts=[0,1,2,3].map(index=>resolveJudgementForecast(
    createJudgementForecast({judgement:{...judgement,id:`j${index}`},context,expectedEffect:'better',confidence:'high'}),
    {actualEffect:'right',causalSource:'practice'}
  ));
  const correction=confidenceCorrection(predictionCalibrationSummary(forecasts));
  assert.equal(correction.applies,true);
  assert.equal(correction.adjustment,-.03);
});

test('reconciliation removes orphan and duplicate forecasts',()=>{
  const forecast=createJudgementForecast({judgement,context});
  const state=reconcileJudgementForecasts({
    judgements:[judgement],
    judgementForecasts:[forecast,{...forecast},{...forecast,id:'orphan',judgementId:'missing'}]
  });
  assert.equal(state.judgementForecasts.length,1);
  assert.match(forecastSummary(forecast),/Expected right/);
});

test('v0.14.4 state migrates to schema 25 forecast shape',()=>{
  const migrated=migrateV0144ToV0150Phase1({schemaVersion:24});
  assert.equal(migrated.schemaVersion,25);
  assert.equal(migrated.productVersion,'0.15.0');
  assert.deepEqual(migrated.judgementForecasts,[]);
});
