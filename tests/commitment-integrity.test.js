import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCommitment,
  commitmentAvailability,
  refreshExpiredCommitments,
  markCommitmentStarted,
  markCommitmentCompleted,
  cancelCommitment,
  reconcileCommitments,
  COMMITMENT_STATUS
} from '../src/core/commitment-integrity.js';
import { migrateV0110ToV0120Phase1 } from '../src/core/state-schema.js';

const judgement={id:'j1',practice:{id:'walk'}};
const choice={id:'c1',judgementId:'j1',action:'accept',selectedPracticeId:'walk'};

test('active choice creates a temporary now commitment',()=>{
  const c=createCommitment({judgement,choice,at:'2026-07-19T10:00:00.000Z'});
  assert.equal(c.status,COMMITMENT_STATUS.ACTIVE);
  assert.equal(c.startMode,'now');
  assert.equal(new Date(c.expiresAt)-new Date(c.createdAt),30*60000);
});

test('inactive choice cannot create commitment',()=>{
  assert.throws(()=>createCommitment({judgement,choice:{...choice,action:'defer'}}),/Only an active choice/);
});

test('later commitment opens and expires in bounded windows',()=>{
  const c=createCommitment({judgement,choice,startMode:'later',startAfterMinutes:60,at:'2026-07-19T10:00:00.000Z'});
  assert.equal(commitmentAvailability(c,new Date('2026-07-19T10:30:00.000Z').getTime()).status,'scheduled');
  assert.equal(commitmentAvailability(c,new Date('2026-07-19T11:30:00.000Z').getTime()).canStart,true);
  assert.equal(commitmentAvailability(c,new Date('2026-07-19T14:01:00.000Z').getTime()).status,'expired');
});

test('expired commitment requires fresh consent',()=>{
  const c=createCommitment({judgement,choice,at:'2026-07-19T10:00:00.000Z'});
  const refreshed=refreshExpiredCommitments([c],new Date('2026-07-19T11:00:00.000Z').getTime());
  assert.equal(refreshed[0].status,COMMITMENT_STATUS.EXPIRED);
});

test('commitment must be active before start',()=>{
  const c=createCommitment({judgement,choice,at:'2026-07-19T10:00:00.000Z'});
  const started=markCommitmentStarted(c,'2026-07-19T10:10:00.000Z');
  assert.equal(started.status,COMMITMENT_STATUS.STARTED);
  assert.throws(()=>markCommitmentStarted(c,'2026-07-19T11:00:00.000Z'),/expired/);
});

test('completion requires start',()=>{
  const c=createCommitment({judgement,choice,at:'2026-07-19T10:00:00.000Z'});
  assert.throws(()=>markCommitmentCompleted(c),/started before completion/);
  const completed=markCommitmentCompleted(markCommitmentStarted(c,'2026-07-19T10:10:00.000Z'),'2026-07-19T10:20:00.000Z');
  assert.equal(completed.status,COMMITMENT_STATUS.COMPLETED);
});

test('person can cancel without penalty and reconciliation removes duplicates',()=>{
  const c=createCommitment({judgement,choice});
  const cancelled=cancelCommitment(c,{reason:'Plans changed.'});
  assert.equal(cancelled.status,COMMITMENT_STATUS.CANCELLED);
  assert.equal(cancelled.cancelReason,'Plans changed.');
  const state=reconcileCommitments({commitments:[cancelled,{...cancelled}]});
  assert.equal(state.commitments.length,1);
});

test('v0.11.0 state migrates to schema 16 commitment shape',()=>{
  const migrated=migrateV0110ToV0120Phase1({schemaVersion:15});
  assert.equal(migrated.schemaVersion,16);
  assert.equal(migrated.productVersion,'0.12.0');
  assert.deepEqual(migrated.commitments,[]);
});
