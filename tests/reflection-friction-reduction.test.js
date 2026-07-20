import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

test('reflection no longer uses browser prompt',()=>{
  const reflection=app.slice(app.indexOf('function reflect(){'),app.indexOf('function journal('));
  assert.doesNotMatch(reflection,/prompt\(/);
});

test('essential reflection is visible before optional detail',()=>{
  assert.ok(app.includes('class="reflection-essential"'));
  assert.ok(app.includes('class="reflection-detail"'));
  assert.ok(app.indexOf('reflection-essential')<app.indexOf('reflection-detail'));
});

test('reflection draft autosaves on input and change',()=>{
  assert.match(app,/addEventListener\('input'/);
  assert.match(app,/addEventListener\('change'/);
  assert.match(app,/updateReflectionDraft/);
});

test('friction is captured inline',()=>{
  assert.ok(app.includes('id="reflection-friction"'));
  assert.ok(app.includes("frictionOutcome=state.reflectionDraft?.values?.frictionOutcome"));
});
