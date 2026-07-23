import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CODEX,
  PRACTICE_LIBRARY_VERSION,
  snapshotPracticeContent,
  assessPracticeContentProvenance,
  practiceContentSnapshotSummary,
  practiceContentProvenanceAudit
} from '../src/data/codex.js';

const strength=CODEX.find(item=>item.id==='strength');

test('Practice content is snapshotted with executable phases',()=>{
  const snapshot=snapshotPracticeContent(strength,{durationMinutes:15,phases:strength.phases,at:'2026-07-21T10:00:00Z'});
  assert.equal(snapshot.practiceId,'strength');
  assert.equal(snapshot.contentVersion,strength.contentVersion);
  assert.equal(snapshot.libraryVersion,PRACTICE_LIBRARY_VERSION);
  assert.equal(snapshot.phaseCount,strength.phases.length);
  assert.equal(snapshot.source,'canonical-practice-library');
});

test('snapshot is a deep historical copy',()=>{
  const snapshot=snapshotPracticeContent(strength,{phases:strength.phases});
  assert.notEqual(snapshot.phases,strength.phases);
  assert.notEqual(snapshot.phases[0][3],strength.phases[0][3]);
});

test('current content version is recognised',()=>{
  const snapshot=snapshotPracticeContent(strength);
  assert.equal(assessPracticeContentProvenance(snapshot,CODEX).status,'current');
});

test('older content version remains explicitly historical',()=>{
  const snapshot={...snapshotPracticeContent(strength),contentVersion:0};
  const result=assessPracticeContentProvenance(snapshot,CODEX);
  assert.equal(result.status,'historical');
  assert.match(result.statement,/used content v0/);
});

test('removed Practice remains historically preserved',()=>{
  const snapshot=snapshotPracticeContent(strength);
  const result=assessPracticeContentProvenance(snapshot,CODEX.filter(item=>item.id!=='strength'));
  assert.equal(result.status,'retired');
});

test('audit distinguishes snapshots from legacy history',()=>{
  const snapshot=snapshotPracticeContent(strength);
  const audit=practiceContentProvenanceAudit([
    {id:'h1',practiceContentSnapshot:snapshot},
    {id:'legacy'}
  ],CODEX);
  assert.equal(audit.total,1);
  assert.equal(audit.current,1);
  assert.equal(audit.missing,1);
  assert.match(practiceContentSnapshotSummary(snapshot),/content v1/);
});
