import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('reflection recalls the pre-action contract',()=>{
  assert.ok(app.includes('PRE-ACTION CONTRACT'));
  assert.ok(app.includes('practiceContract.review'));
});

test('saving reflection resolves the contract',()=>{
  const save=app.slice(app.indexOf('function saveReflection'),app.indexOf('function understanding'));
  assert.match(save,/resolvePracticeContract/);
  assert.match(save,/practiceContractOutcome/);
});

test('Journey exposes contract outcome progressively',()=>{
  assert.ok(app.includes('Practice contract outcome'));
  assert.ok(app.includes('journey-contract-outcome'));
});

test('contract outcome remains visually subordinate',()=>{
  assert.match(css,/\.journey-contract-outcome/);
  assert.match(css,/font-size:9px/);
});
