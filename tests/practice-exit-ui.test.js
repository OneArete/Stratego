import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

test('Practice closure uses an in-app screen instead of confirm',()=>{
  const handlers=app.slice(app.indexOf("if(a==='pause')"),app.indexOf("if(['today'"));
  assert.doesNotMatch(handlers,/confirm\('End this practice/);
  assert.doesNotMatch(handlers,/confirm\('Discard this interrupted/);
  assert.ok(app.includes('function practiceExit(){'));
});

test('exit screen preserves all three person choices',()=>{
  assert.ok(app.includes('data-action="continue-practice"'));
  assert.ok(app.includes('data-action="record-practice-exit"'));
  assert.ok(app.includes('data-action="discard-practice-session"'));
});

test('opening exit pauses an active Practice',()=>{
  const start=app.indexOf('function practiceExit(){');
  const end=app.indexOf('function runPhase(',start);
  assert.match(app.slice(start,end),/pauseExecution\(execution\)/);
});

test('discard does not add the session to Journey history',()=>{
  const start=app.indexOf('function discardPracticeSession');
  const end=app.indexOf('function abandonPractice',start);
  const block=app.slice(start,end);
  assert.doesNotMatch(block,/state\.history\.unshift/);
  assert.match(block,/discarded:true/);
});

test('end and record retains existing accountable abandonment path',()=>{
  assert.match(app,/record-practice-exit'\)return abandonPractice/);
});
