import test from 'node:test';
import assert from 'node:assert/strict';
import { conveneAgora } from '../src/core/agora.js';

const context={sleep:3,energy:2,time:15,challenge:'body',soreness:'none',emotionalLoad:'usual'};
const understanding={confidence:50,unknowns:[],contradictions:[],summary:'Current.'};

test('Agora applies valid calibration evidence after base confidence',()=>{
  const evidence={status:'applied',resolvedForecasts:4,adjustment:-.03};
  const result=conveneAgora(context,understanding,[],{},null,evidence);
  assert.equal(result.confidence,result.baseConfidence-3);
  assert.equal(result.confidenceCalibration.applied,true);
});

test('Agora rejects invalid calibration evidence',()=>{
  const evidence={status:'applied',resolvedForecasts:1,adjustment:.5};
  const result=conveneAgora(context,understanding,[],{},null,evidence);
  assert.equal(result.confidence,result.baseConfidence);
  assert.equal(result.calibrationEvidence,null);
});
