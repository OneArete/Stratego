import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

test('alternative choice no longer uses a browser prompt',()=>{
  const handler=app.slice(app.indexOf('if(t.dataset.choiceAction)'),app.indexOf('if(t.dataset.learningAction)'));
  assert.doesNotMatch(handler,/prompt\(/);
});

test('non-accept choices open an inline explanation panel',()=>{
  assert.ok(app.includes('id="choice-reason-panel"'));
  assert.ok(app.includes('data-choice-reason-action="continue"'));
  assert.ok(app.includes('data-choice-reason-action="cancel"'));
});

test('continuing an alternative choice completes the same choice transaction',()=>{
  assert.match(app,/completePersonChoice\(\{\.\.\.choice,reason\}\)/);
  assert.match(app,/rerenderJudgementAt\('#commitment-panel'\)/);
});

test('choice completion clears pending state before navigation',()=>{
  const helper=app.slice(app.indexOf('function completePersonChoice'),app.indexOf('function judgement'));
  assert.match(helper,/pendingChoice=null/);
  assert.match(helper,/persist\(\)/);
});

test('accept remains a direct action without explanation step',()=>{
  assert.match(app,/action==='accept'\)return completePersonChoice/);
});
