import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('Practice start records accepted duration provenance',()=>{
  const execute=app.slice(app.indexOf('function execute(){'),app.indexOf('function resumePrompt'));
  assert.match(execute,/recordPracticeDoseRevisionUse/);
});

test('reflection resolves accepted duration outcome',()=>{
  const save=app.slice(app.indexOf('function saveReflection'),app.indexOf('function understanding'));
  assert.match(save,/resolvePracticeDoseRevisionUse/);
});

test('repeated worse outcomes become review required',()=>{
  assert.ok(app.includes('review required'));
  assert.ok(app.includes('Return to proposal'));
});

test('Journey exposes duration accountability',()=>{
  assert.ok(app.includes('Duration accountability'));
  assert.ok(app.includes('journey-dose-revision'));
});

test('review-required duration remains visually restrained',()=>{
  assert.match(css,/\.practice-dose-revision-item\.review-required/);
});
