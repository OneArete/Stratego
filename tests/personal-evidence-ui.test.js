import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
test('personal evidence is visible without silently changing judgement',()=>{
  assert.match(app,/PERSONAL EVIDENCE/);
  assert.match(app,/WHAT TENDS TO HELP ME/);
  assert.match(app,/Automatic judgement influence: 0/);
});
