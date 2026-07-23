import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  CODEX,
  validatePracticeLibrary,
  assessPracticeEligibility,
  snapshotPracticeContent,
  assessPracticeContentProvenance
} from '../src/data/codex.js';
import {conveneAgora} from '../src/core/agora.js';

const here=dirname(fileURLToPath(import.meta.url));
const app=readFileSync(resolve(here,'../src/app.js'),'utf8');

test('all current Practices satisfy the canonical contract',()=>{
  const audit=validatePracticeLibrary(CODEX);
  assert.equal(audit.invalid,0);
  assert.equal(audit.valid,CODEX.length);
});

test('explicit contraindication produces blocked eligibility',()=>{
  const strength=CODEX.find(item=>item.id==='strength');
  const result=assessPracticeEligibility(strength,{
    soreness:'significant',
    energy:2,
    time:15,
    emotionalLoad:'usual'
  });
  assert.equal(result.status,'blocked');
  assert.deepEqual(result.matchedContraindications,['significant-soreness']);
});

test('caution remains non-excluding',()=>{
  const strength=CODEX.find(item=>item.id==='strength');
  const result=assessPracticeEligibility(strength,{
    soreness:'none',
    energy:1,
    time:15,
    emotionalLoad:'usual'
  });
  assert.equal(result.status,'caution');
  assert.equal(result.selectionInfluence,0);
});

test('Agora excludes only explicit blocked states',()=>{
  const understanding={confidence:70,energy:.6,contradictions:[],unknowns:[]};
  const decision=conveneAgora({
    sleep:3,
    energy:2,
    time:15,
    challenge:'body',
    soreness:'significant',
    emotionalLoad:'usual'
  },understanding,[],{},null,null);

  assert.ok(decision.agora.blockedPractices.some(item=>item.practiceId==='strength'));
  assert.notEqual(decision.practice.id,'strength');
});

test('exact executable content is preserved at Practice start',()=>{
  const practice=CODEX.find(item=>item.id==='recovery');
  const snapshot=snapshotPracticeContent(practice,{
    durationMinutes:15,
    phases:practice.phases,
    at:'2026-07-21T10:00:00Z'
  });
  assert.equal(snapshot.practiceId,'recovery');
  assert.equal(snapshot.phaseCount,practice.phases.length);
  assert.equal(snapshot.source,'canonical-practice-library');
});

test('historical content remains distinguishable from current content',()=>{
  const practice=CODEX.find(item=>item.id==='recovery');
  const snapshot={...snapshotPracticeContent(practice),contentVersion:0};
  const provenance=assessPracticeContentProvenance(snapshot,CODEX);
  assert.equal(provenance.status,'historical');
});

test('Practice Library governance stays in existing sources',()=>{
  assert.equal(existsSync(resolve(here,'../src/core/practice-library-governance.js')),false);
  assert.match(app,/snapshotPracticeContent/);
  assert.match(app,/Practice content provenance/);
});

test('startup and frozen footer remain protected',()=>{
  const nav=app.slice(app.indexOf('const nav='),app.indexOf('const ROUTES='));
  for(const label of ['Today','Understanding','Journey','Settings']){
    assert.ok(nav.includes(label));
  }
  assert.match(app,/resolveStartupDestination/);
});
