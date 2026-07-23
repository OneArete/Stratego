import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

test('calibration candidates expose person review actions',()=>{
  assert.ok(app.includes('Confirm this calibration'));
  assert.ok(app.includes('This is misleading'));
  assert.ok(app.includes('Reopen for review'));
});

test('review handler persists status without changing judgement',()=>{
  const start=app.indexOf('if(t.dataset.contractCalibrationAction)');
  const end=app.indexOf('if(t.dataset.transferAction)',start);
  const handler=app.slice(start,end);
  assert.match(handler,/applyPracticeContractCalibrationReview/);
  assert.match(handler,/persist\(\)/);
  assert.doesNotMatch(handler,/decision|judgement|practiceContract=/);
});

test('Understanding reports calibration review counts',()=>{
  assert.ok(app.includes('contractCalibrationReviewAudit.confirmed'));
  assert.ok(app.includes('0 influential'));
});

test('load reconciliation protects calibration review integrity',()=>{
  const reconcile=app.slice(app.indexOf('function reconcileLoadedState'),app.indexOf('let state='));
  assert.match(reconcile,/reconcilePracticeContractCalibrationReviews/);
});
