import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, migrateState, migrateDelta, STATE_SCHEMA_VERSION } from '../src/core/state-schema.js';

test('initial state has the current schema',()=>{
  const state=createInitialState();
  assert.equal(state.schemaVersion,STATE_SCHEMA_VERSION);
  assert.equal(state.productVersion,'0.37.0');
});

test('v0.8.0 legacy deltas migrate to Recovery',()=>{
  const state=migrateState({schemaVersion:3,history:[{completed:true,decision:{delta:{body:.2,legacy:.3,overall:.5}}}]});
  assert.equal(state.history[0].decision.delta.recovery,.3);
  assert.equal('legacy' in state.history[0].decision.delta,false);
});

test('delta migration recalculates overall',()=>{
  assert.deepEqual(migrateDelta({body:.2,legacy:.3,overall:99}),{body:.2,overall:.5,recovery:.3});
});
