import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('Understanding Patterns exposes Practice contract calibration',()=>{
  assert.ok(app.includes('PRACTICE CONTRACT CALIBRATION'));
  assert.ok(app.includes('Contract change: none · Judgement influence: none'));
});

test('Understanding Audit exposes calibration counts',()=>{
  assert.ok(app.includes('CONTRACT CALIBRATION AUDIT'));
  assert.ok(app.includes('item.aligned'));
  assert.ok(app.includes('item.misaligned'));
});

test('contract calibration does not feed judgement or contract construction',()=>{
  const judgement=app.slice(app.indexOf('function judgement(){'),app.indexOf('async function requestWakeLock'));
  assert.doesNotMatch(judgement,/contractCalibrations/);
});

test('calibration presentation remains restrained',()=>{
  assert.match(css,/\.contract-calibration-item/);
  assert.match(css,/background:rgba\(255,255,255,.012\)/);
});
