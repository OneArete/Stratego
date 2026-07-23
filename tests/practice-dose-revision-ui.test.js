import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

test('Understanding exposes explicit duration proposal choice',()=>{
  assert.ok(app.includes('PRACTICE DURATION PROPOSAL'));
  assert.ok(app.includes('Use this duration'));
  assert.ok(app.includes('Keep current duration'));
});

test('duration proposal handler requires a live proposal',()=>{
  const start=app.indexOf('if(t.dataset.doseRevisionAction)');
  const end=app.indexOf('if(t.dataset.doseEvidenceAction)',start);
  const handler=app.slice(start,end);
  assert.match(handler,/proposal=proposals\.find/);
  assert.match(handler,/if\(!proposal\)return/);
});

test('judgement receives only an accepted person-authorised duration',()=>{
  const judgement=app.slice(app.indexOf('function judgement(){'),app.indexOf('async function requestWakeLock'));
  assert.match(judgement,/effectivePracticeDoseRevision/);
  assert.match(judgement,/applyPracticeDoseRevisionToJudgement/);
});

test('proposal states contract wording remains unchanged',()=>{
  assert.ok(app.includes('Contract wording: unchanged'));
});
