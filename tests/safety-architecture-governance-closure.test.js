import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  buildSafetyEnvelope,
  safetyAcknowledgementRequirement,
  createSafetyAcknowledgement,
  safetyStartGate,
  createSafetyInterruption,
  resolveSafetyInterruption,
  safetyRuntimeGate,
  safetyInterruptionAudit
} from '../src/core/safety-architecture.js?v=0390p1';

const here=dirname(fileURLToPath(import.meta.url));
const app=readFileSync(resolve(here,'../src/app.js'),'utf8');

function constrainedEnvelope(){
  return buildSafetyEnvelope({
    context:{soreness:'significant'},
    decision:{advisors:[],agora:{blockedPractices:[{practiceId:'strength',reason:'Significant soreness'}],cautions:[]}}
  });
}

test('Safety Envelope preserves existing constraints',()=>{
  const envelope=constrainedEnvelope();
  assert.equal(envelope.status,'constrained');
  assert.equal(envelope.blockedPractices.length,1);
});

test('constrained envelope requires person acknowledgement',()=>{
  const envelope=constrainedEnvelope();
  assert.equal(safetyAcknowledgementRequirement(envelope).required,true);
  assert.equal(safetyStartGate({envelope,judgementId:'j1'}).canStart,false);
  const acknowledgement=createSafetyAcknowledgement({envelope,judgementId:'j1'});
  assert.equal(safetyStartGate({envelope,acknowledgement,judgementId:'j1'}).canStart,true);
});

test('runtime safety concern closes execution gate',()=>{
  const interruption=createSafetyInterruption({judgementId:'j1',practiceId:'strength',phaseIndex:1});
  assert.equal(safetyRuntimeGate([interruption]).canRun,false);
});

test('runtime safety interruption requires explicit resolution',()=>{
  const interruption=createSafetyInterruption({judgementId:'j1'});
  const resumed=resolveSafetyInterruption(interruption,{action:'resume'});
  assert.equal(resumed.resolution,'resume');
  assert.equal(safetyRuntimeGate([resumed]).canRun,true);
});

test('runtime safety audit preserves resumed and ended outcomes',()=>{
  const resumed=resolveSafetyInterruption(createSafetyInterruption({judgementId:'j1'}),{action:'resume'});
  const ended=resolveSafetyInterruption(createSafetyInterruption({judgementId:'j2'}),{action:'end'});
  const audit=safetyInterruptionAudit([resumed,ended]);
  assert.equal(audit.resumed,1);
  assert.equal(audit.ended,1);
});

test('Safety Architecture remains in its existing core module',()=>{
  assert.equal(existsSync(resolve(here,'../src/core/safety-governance.js')),false);
  assert.equal(existsSync(resolve(here,'../src/core/safety-architecture.js')),true);
});

test('startup and frozen footer remain protected',()=>{
  const nav=app.slice(app.indexOf('const nav='),app.indexOf('const ROUTES='));
  for(const label of ['Today','Understanding','Journey','Settings'])assert.ok(nav.includes(label));
  assert.match(app,/resolveStartupDestination/);
});
