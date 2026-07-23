import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
test('Journey includes a preservable weekly review',()=>{
  assert.match(app,/WEEKLY REVIEW/);
  assert.match(app,/preserve-weekly-review/);
  assert.match(app,/Preserve this review/);
});
