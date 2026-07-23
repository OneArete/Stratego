import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const governance=fs.readFileSync(new URL('../docs/OUTCOME_LEDGER_GOVERNANCE.md',import.meta.url),'utf8');

test('Journey and Understanding expose the Outcome Ledger',()=>{
  assert.match(app,/OUTCOME LEDGER/);
  assert.match(app,/Frozen context · learning awaits review/);
  assert.match(app,/Automatic Human Model influence: 0/);
});

test('governance prohibits silent learning',()=>{
  assert.match(governance,/Human Model influence: 0/);
  assert.match(governance,/infer an outcome/);
  assert.match(governance,/separate, auditable learning object/);
});
