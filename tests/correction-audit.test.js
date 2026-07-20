import test from 'node:test';
import assert from 'node:assert/strict';
import {createCorrectionEvent,determineCorrectionImpact,applyCorrectionImpact,correctionAuditSummary,reconcileCorrectionAudit} from '../src/core/correction-audit.js';
import {migrateV0100Phase2ToPhase3} from '../src/core/state-schema.js';

function state(){
  return {
    judgements:[{id:'j1',status:'proposed',context:{energy:2,challenge:'body'},validity:{status:'current',contextFingerprint:{energy:2,challenge:'body'}},advisors:[{advisor:'Body',memory:{applied:[{learningId:'l1',practice:'strength'}]}}]}],
    history:[{judgementId:'j1',context:{energy:2,challenge:'body'},decision:{id:'j1',understanding:{confidence:.7}}}],
    advisorMemories:{Body:{notes:[{id:'l1',status:'confirmed',practice:'strength',context:{energy:2,challenge:'body'}}],weights:{}}},
    correctionAudit:[]
  };
}

test('correction event requires a type and records provenance',()=>{
  assert.throws(()=>createCorrectionEvent({}),/type is required/);
  const event=createCorrectionEvent({type:'signal-correction',field:'energy',previousValue:2,newValue:1,note:'Energy was overstated.'});
  assert.equal(event.field,'energy');assert.equal(event.status,'recorded');
});

test('signal correction identifies affected judgement, learning and history',()=>{
  const s=state(),event=createCorrectionEvent({type:'signal-correction',field:'energy'});
  const impact=determineCorrectionImpact(s,event);
  assert.deepEqual(impact.totals,{judgements:1,learnings:1,history:1});
});

test('learning rejection identifies direct learning and active judgement',()=>{
  const s=state(),event=createCorrectionEvent({type:'learning-rejection',sourceId:'l1'});
  const impact=determineCorrectionImpact(s,event);
  assert.equal(impact.affectedLearnings[0].id,'l1');assert.equal(impact.affectedJudgements[0].id,'j1');
});

test('applying correction marks judgement for review',()=>{
  const s=state(),event=createCorrectionEvent({type:'signal-correction',field:'energy',note:'Corrected energy.'});
  const next=applyCorrectionImpact(s,event,determineCorrectionImpact(s,event));
  assert.equal(next.judgements[0].validity.status,'review-required');
  assert.equal(next.judgements[0].validity.correctionId,event.id);
});

test('related confirmed learning is demoted to candidate after signal correction',()=>{
  const s=state(),event=createCorrectionEvent({type:'signal-correction',field:'energy'});
  const next=applyCorrectionImpact(s,event,determineCorrectionImpact(s,event));
  assert.equal(next.advisorMemories.Body.notes[0].status,'candidate');
});

test('direct learning rejection preserves correction note',()=>{
  const s=state(),event=createCorrectionEvent({type:'learning-rejection',sourceId:'l1',note:'Only worked on holiday.'});
  const next=applyCorrectionImpact(s,event,determineCorrectionImpact(s,event));
  assert.equal(next.advisorMemories.Body.notes[0].status,'rejected');
  assert.equal(next.advisorMemories.Body.notes[0].correction.note,'Only worked on holiday.');
});

test('audit summary and reconciliation are deterministic',()=>{
  const s=state(),event=createCorrectionEvent({type:'understanding-correction',sourceId:'i1'});
  const applied=applyCorrectionImpact(s,event,determineCorrectionImpact(s,event));
  applied.correctionAudit.push({...applied.correctionAudit[0]});
  const reconciled=reconcileCorrectionAudit(applied);
  assert.equal(reconciled.correctionAudit.length,1);
  assert.ok(correctionAuditSummary(reconciled.correctionAudit[0]).includes('judgement'));
});

test('phase 2 state migrates to schema 11 correction audit shape',()=>{
  const migrated=migrateV0100Phase2ToPhase3({schemaVersion:10});
  assert.equal(migrated.schemaVersion,11);assert.deepEqual(migrated.correctionAudit,[]);
});
