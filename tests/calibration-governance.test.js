import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCalibrationEvidence,
  verifyCalibrationEvidence,
  applyCalibrationToConfidence,
  calibrationGovernanceSummary
} from '../src/core/calibration-governance.js';

const resolved=(direction='matched',score=.8)=>({
  status:'resolved',
  calibration:{
    exact:direction==='matched',
    direction,
    score
  }
});

test('fewer than four forecasts cannot alter confidence',()=>{
  const evidence=buildCalibrationEvidence([resolved(),resolved(),resolved()]);
  assert.equal(evidence.status,'insufficient');
  assert.equal(evidence.adjustment,0);
});

test('repeated overestimation creates bounded negative correction',()=>{
  const evidence=buildCalibrationEvidence([
    resolved('overestimated',.4),
    resolved('overestimated',.4),
    resolved('overestimated',.4),
    resolved('matched',.8)
  ]);
  assert.equal(evidence.status,'applied');
  assert.equal(evidence.adjustment,-.03);
});

test('strong repeated calibration creates smaller positive correction',()=>{
  const evidence=buildCalibrationEvidence([
    resolved('matched',.9),
    resolved('matched',.9),
    resolved('matched',.9),
    resolved('matched',.9)
  ]);
  assert.equal(evidence.adjustment,.015);
});

test('verification rejects adjustment outside boundary',()=>{
  const result=verifyCalibrationEvidence({
    status:'applied',
    resolvedForecasts:4,
    adjustment:.04
  });
  assert.equal(result.valid,false);
});

test('verification rejects correction with insufficient history',()=>{
  const result=verifyCalibrationEvidence({
    status:'applied',
    resolvedForecasts:2,
    adjustment:-.03
  });
  assert.equal(result.valid,false);
});

test('negative correction reduces confidence by three points',()=>{
  const result=applyCalibrationToConfidence(72,{
    status:'applied',
    resolvedForecasts:4,
    adjustment:-.03
  });
  assert.equal(result.confidence,69);
  assert.equal(result.applied,true);
});

test('invalid calibration leaves confidence unchanged',()=>{
  const result=applyCalibrationToConfidence(72,{
    status:'applied',
    resolvedForecasts:1,
    adjustment:.5
  });
  assert.equal(result.confidence,72);
  assert.equal(result.applied,false);
});

test('summary is person-readable',()=>{
  const text=calibrationGovernanceSummary({
    status:'applied',
    resolvedForecasts:6,
    adjustment:-.03
  });
  assert.match(text,/Confidence reduced by 3.0 points/);
});
