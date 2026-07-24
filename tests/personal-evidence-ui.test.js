import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
test('personal evidence remains available without competing with Today flow',()=>{
  assert.match(app,/PERSONAL EVIDENCE/);
  assert.match(app,/Automatic judgement influence: 0/);
  assert.doesNotMatch(app,/WHAT TENDS TO HELP ME/);
});
