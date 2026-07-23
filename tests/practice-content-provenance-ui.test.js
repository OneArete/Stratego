import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

test('Practice start snapshots canonical content',()=>{
  const execute=app.slice(app.indexOf('function execute(){'),app.indexOf('function resumePrompt'));
  assert.match(execute,/snapshotPracticeContent/);
  assert.match(execute,/state\.current\.adjusted/);
});

test('Journey exposes Practice content provenance',()=>{
  assert.ok(app.includes('Practice content provenance'));
  assert.ok(app.includes('journey-practice-content'));
});

test('Understanding Audit exposes content version lineage',()=>{
  assert.ok(app.includes('PRACTICE CONTENT PROVENANCE'));
  assert.ok(app.includes('legacy without snapshot'));
});

test('content provenance does not alter Agora selection',()=>{
  const consult=app.slice(app.indexOf('function consult'),app.indexOf('function completePersonChoice'));
  assert.doesNotMatch(consult,/practiceContentSnapshot/);
});
