import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
test('weekly direction remains person controlled in Journey, not duplicated on Today',()=>{
  assert.match(app,/CARRY INTO THIS WEEK/);
  assert.match(app,/save-weekly-intention/);
  assert.match(app,/clear-weekly-intention/);
  assert.doesNotMatch(app,/THIS WEEK'S DIRECTION/);
});
