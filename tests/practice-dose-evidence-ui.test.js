import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('Understanding Patterns exposes Practice dose evidence',()=>{
  assert.ok(app.includes('PRACTICE DOSE EVIDENCE'));
  assert.ok(app.includes('Duration change: none · Contract change: none · Judgement influence: none'));
});

test('Understanding Audit exposes dose counts and boundaries',()=>{
  assert.ok(app.includes('PRACTICE DOSE AUDIT'));
  assert.ok(app.includes('Duration influence: none'));
  assert.ok(app.includes('Contract influence: none'));
});

test('dose evidence does not enter judgement construction',()=>{
  const judgement=app.slice(app.indexOf('function judgement(){'),app.indexOf('async function requestWakeLock'));
  assert.doesNotMatch(judgement,/practiceDoseEvidence/);
});

test('dose evidence presentation remains restrained',()=>{
  assert.match(css,/\.practice-dose-item/);
  assert.match(css,/background:rgba\(255,255,255,.012\)/);
});
