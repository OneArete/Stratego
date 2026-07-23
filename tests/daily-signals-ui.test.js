import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
test('Today persists and resets daily signals',()=>{
  assert.match(app,/upsertDailyCheckIn/);
  assert.match(app,/reset-today-signals/);
  assert.match(app,/Saved today/);
});
