import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createReflectionDraft,
  updateReflectionDraft,
  restoreReflectionDraft,
  clearReflectionDraft,
  dailyContinuityStatus,
  reconcileDailyContinuity
} from '../src/core/daily-continuity.js';
import { migrateV0150ToV0160Phase1 } from '../src/core/state-schema.js';

const current={decision:{id:'j1',practice:{id:'walk'}}};

test('creates a conservative reflection draft',()=>{
  const draft=createReflectionDraft({current});
  assert.equal(draft.judgementId,'j1');
  assert.equal(draft.values.effect,'right');
  assert.equal(draft.values.attributionSource,'unclear');
});

test('updates one draft value without losing others',()=>{
  const draft=createReflectionDraft({current});
  const next=updateReflectionDraft(draft,{effect:'better'});
  assert.equal(next.values.effect,'better');
  assert.equal(next.values.goalFit,'partial');
});

test('restores only the matching judgement draft',()=>{
  const draft=createReflectionDraft({current});
  assert.equal(restoreReflectionDraft({reflectionDraft:draft},current).judgementId,'j1');
  assert.equal(restoreReflectionDraft({reflectionDraft:draft},{decision:{id:'j2'}}),null);
});

test('clear reflection draft preserves the rest of state',()=>{
  const state=clearReflectionDraft({reflectionDraft:{id:'x'},history:[1]});
  assert.equal(state.reflectionDraft,null);
  assert.deepEqual(state.history,[1]);
});

test('paused Practice routes to resume prompt',()=>{
  const status=dailyContinuityStatus({current:{...current,execution:{status:'paused'}}});
  assert.equal(status.route,'resumePrompt');
});

test('completed Practice routes to reflection',()=>{
  const status=dailyContinuityStatus({current:{...current,execution:{status:'completed'}}});
  assert.equal(status.route,'reflect');
});

test('reconciliation removes orphan reflection draft',()=>{
  const state=reconcileDailyContinuity({reflectionDraft:{judgementId:'j1'},current:null});
  assert.equal(state.reflectionDraft,null);
});

test('v0.15 state migrates to schema 28 reflection continuity',()=>{
  const migrated=migrateV0150ToV0160Phase1({schemaVersion:27});
  assert.equal(migrated.schemaVersion,28);
  assert.equal(migrated.productVersion,'0.16.0');
  assert.equal(migrated.reflectionDraft,null);
});
