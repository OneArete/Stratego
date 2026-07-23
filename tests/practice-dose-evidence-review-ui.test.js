import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

test('dose candidates expose explicit person review actions',()=>{
  assert.ok(app.includes('Confirm dose pattern'));
  assert.ok(app.includes('This is misleading'));
  assert.ok(app.includes('Reopen for review'));
});

test('dose review handler persists status only',()=>{
  const start=app.indexOf('if(t.dataset.doseEvidenceAction)');
  const end=app.indexOf('if(t.dataset.contractRevisionAction)',start);
  const handler=app.slice(start,end);
  assert.match(handler,/applyPracticeDoseEvidenceReview/);
  assert.match(handler,/persist\(\)/);
  assert.doesNotMatch(handler,/duration=|decision=|practiceContract=/);
});

test('Understanding reports dose review counts',()=>{
  assert.ok(app.includes('practiceDoseReviewAudit.confirmed'));
  assert.ok(app.includes('0 influential'));
});

test('load reconciliation protects dose review integrity',()=>{
  const reconcile=app.slice(app.indexOf('function reconcileLoadedState'),app.indexOf('let state='));
  assert.match(reconcile,/reconcilePracticeDoseEvidenceReviews/);
});
