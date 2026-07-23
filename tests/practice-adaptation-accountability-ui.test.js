import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
const accountability=readFileSync(new URL('../src/core/practice-adaptation-accountability.js',import.meta.url),'utf8');

test('reflection asks about adaptation fit only when relevant',()=>{
  assert.match(app,/adaptationPrompt\?/);
  assert.ok(app.includes('reflection-adaptation-fit'));
});

test('history entry stores adaptation accountability',()=>{
  assert.match(app,/adaptationAccountability/);
  assert.match(accountability,/eligibleForPreferenceLearning:false/);
});

test('journal states adaptation is not yet a stable preference',()=>{
  assert.ok(app.includes('Not yet treated as a stable preference.'));
});

test('adaptation accountability is visually subordinate',()=>{
  assert.match(css,/\.adaptation-accountability-note/);
  assert.match(css,/background:rgba\(184,148,88,.04\)/);
});
