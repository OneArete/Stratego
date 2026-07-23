import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
test('weekly direction is visible and remains person controlled',()=>{
  assert.match(app,/THIS WEEK'S DIRECTION/);
  assert.match(app,/CARRY INTO THIS WEEK/);
  assert.match(app,/save-weekly-intention/);
  assert.match(app,/clear-weekly-intention/);
  assert.match(app,/automatic judgement influence 0/i);
});
