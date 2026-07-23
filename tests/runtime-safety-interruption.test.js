import test from 'node:test';
import assert from 'node:assert/strict';
import {createSafetyInterruption,resolveSafetyInterruption,activeSafetyInterruption,safetyRuntimeGate,safetyInterruptionAudit} from '../src/core/safety-architecture.js?v=0390p1';

test('raising a concern creates an active interruption',()=>{
  const event=createSafetyInterruption({judgementId:'j1',practiceId:'strength',phaseIndex:1,at:'2026-07-22T10:00:00Z'});
  assert.equal(event.status,'active'); assert.equal(event.phaseIndex,1);
});
test('active interruption closes runtime gate',()=>{
  const event=createSafetyInterruption({judgementId:'j1'});
  assert.equal(safetyRuntimeGate([event]).canRun,false); assert.equal(activeSafetyInterruption([event]).id,event.id);
});
test('resume resolves interruption',()=>{
  const resolved=resolveSafetyInterruption(createSafetyInterruption({judgementId:'j1'}),{action:'resume'});
  assert.equal(resolved.resolution,'resume'); assert.equal(safetyRuntimeGate([resolved]).canRun,true);
});
test('end resolves interruption',()=>{
  assert.equal(resolveSafetyInterruption(createSafetyInterruption({judgementId:'j1'}),{action:'end'}).resolution,'end');
});
test('audit distinguishes outcomes',()=>{
  const resumed=resolveSafetyInterruption(createSafetyInterruption({judgementId:'j1'}),{action:'resume'});
  const ended=resolveSafetyInterruption(createSafetyInterruption({judgementId:'j2'}),{action:'end'});
  const active=createSafetyInterruption({judgementId:'j3'});
  const audit=safetyInterruptionAudit([resumed,ended,active]);
  assert.deepEqual([audit.total,audit.resumed,audit.ended,audit.active],[3,1,1,1]);
});
