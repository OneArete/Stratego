import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

test('Understanding exposes explicit contract revision choice',()=>{
  assert.ok(app.includes('PRACTICE CONTRACT REVISION'));
  assert.ok(app.includes('Use this wording'));
  assert.ok(app.includes('Keep current wording'));
});

test('revision handler requires a concrete proposal',()=>{
  const start=app.indexOf('if(t.dataset.contractRevisionAction)');
  const end=app.indexOf('if(t.dataset.contractCalibrationAction)',start);
  const handler=app.slice(start,end);
  assert.match(handler,/proposal=proposals\.find/);
  assert.match(handler,/if\(!proposal\)return/);
});

test('judgement contract reads only an accepted revision',()=>{
  const judgement=app.slice(app.indexOf('function judgement(){'),app.indexOf('async function requestWakeLock'));
  assert.match(judgement,/effectivePracticeContractRevision/);
  assert.match(judgement,/revision:acceptedContractRevision/);
});

test('revision UI states zero judgement influence',()=>{
  assert.ok(app.includes('Judgement influence: none'));
});
