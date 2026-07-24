import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
test('daily context persists through its dedicated flow',()=>{
  assert.match(app,/upsertDailyCheckIn/);
  assert.match(app,/function checkin\(\)/);
  assert.match(app,/save-daily-context/);
  assert.doesNotMatch(app,/Saved today/);
});
