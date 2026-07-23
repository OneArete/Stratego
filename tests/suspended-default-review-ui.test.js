import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('Understanding exposes review-required confirmed defaults',()=>{
  assert.match(app,/attachConfirmedDefaultHealth/);
  assert.ok(app.includes('Automatic use paused'));
  assert.ok(app.includes('Recent automatic uses'));
});

test('paused default offers accountable actions',()=>{
  assert.ok(app.includes('Stop using this default'));
  assert.ok(app.includes('Return to candidate'));
});

test('summary counts paused defaults separately',()=>{
  assert.match(app,/suspendedAdaptationDefaults/);
  assert.ok(app.includes('paused · 0 influential'));
});

test('review-required state is visually distinct but restrained',()=>{
  assert.match(css,/\.adaptation-pattern-item\.review-required/);
  assert.match(css,/rgba\(181,92,92,.035\)/);
});
