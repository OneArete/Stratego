import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const schema=readFileSync(new URL('../src/core/state-schema.js',import.meta.url),'utf8');

test('Understanding offers confirm reject and reopen actions',()=>{
  assert.ok(app.includes('data-adaptation-pattern-action="confirm"'));
  assert.ok(app.includes('data-adaptation-pattern-action="reject"'));
  assert.ok(app.includes('data-adaptation-pattern-action="reopen"'));
});

test('review actions persist separately from derived patterns',()=>{
  assert.match(app,/state\.adaptationPatternReviews=applyAdaptationPatternReview/);
  assert.match(schema,/adaptationPatternReviews:\[\]/);
});

test('UI continues to state zero judgement influence',()=>{
  assert.ok(app.includes('Current judgement influence: none'));
  assert.ok(app.includes('0 influential'));
});

test('loaded reviews are reconciled against currently derived candidates',()=>{
  assert.match(app,/reconcileAdaptationPatternReviews/);
});
