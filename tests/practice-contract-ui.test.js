import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('commitment shows the Practice contract before beginning',()=>{
  for(const copy of ['Practice contract','Expected effect','Enough for today','Reflection question'])assert.ok(app.includes(copy));
});
test('contract is snapshotted only when Practice starts',()=>{
  const execute=app.slice(app.indexOf('function execute(){'),app.indexOf('function resumePrompt'));
  assert.match(execute,/snapshotPracticeContract/);
  assert.match(execute,/state\.current\.practiceContract/);
});
test('resume exposes the preserved contract summary',()=>{
  assert.match(app,/resume-contract/);
  assert.match(app,/practiceContractSummary/);
});
test('contract remains visually restrained',()=>{
  assert.match(css,/\.practice-contract/);
  assert.match(css,/background:rgba\(184,148,88,.028\)/);
});
