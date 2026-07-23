import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

test('Human Model evidence exposes explicit review actions',()=>{
  assert.ok(app.includes('This is not accurate'));
  assert.ok(app.includes('Confirm'));
  assert.ok(app.includes('Reopen'));
});

test('correction uses a dedicated screen rather than a native prompt',()=>{
  const screen=app.slice(app.indexOf('function humanModelCorrection'),app.indexOf('function correctUnderstanding'));
  assert.match(screen,/human-model-correction-note/);
  assert.doesNotMatch(screen,/prompt\(/);
});

test('saved correction rejects the evidence and persists',()=>{
  const start=app.indexOf("if(a==='save-human-model-correction')");
  const end=app.indexOf("if(a==='save-correction')",start);
  const handler=app.slice(start,end);
  assert.match(handler,/action:'reject'/);
  assert.match(handler,/persist\(\)/);
});

test('load reconciliation protects review integrity',()=>{
  const reconcile=app.slice(app.indexOf('function reconcileLoadedState'),app.indexOf('let state='));
  assert.match(reconcile,/reconcileHumanModelReviews/);
});

test('review remains non-influential',()=>{
  assert.ok(app.includes('humanModelReviewStatus.statement'));
  assert.ok(app.includes('Judgement influence: 0'));
  assert.ok(app.includes('Practice selection influence: 0'));
  assert.ok(app.includes('Safety influence: 0'));
});
