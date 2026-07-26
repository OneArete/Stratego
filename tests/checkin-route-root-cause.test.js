import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync(new URL('../src/app.js', import.meta.url),'utf8');
test('check-in route cannot call an undefined completion helper',()=>{
  assert.equal(app.includes('dailyContextCompletedCount()'),false);
  assert.match(app,/function checkin\(\)\{\n  const checkinGraph=buildCheckinGraph\(context\)/);
});
