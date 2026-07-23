import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CODEX,
  PRACTICE_LIBRARY_VERSION,
  validatePracticeLibrary,
  practiceLibraryCatalog,
  practiceLibrarySummary
} from '../src/data/codex.js';

test('every current Practice satisfies the canonical library contract',()=>{
  const audit=validatePracticeLibrary(CODEX);
  assert.equal(audit.invalid,0);
  assert.equal(audit.valid,CODEX.length);
});

test('Practice identifiers remain unique',()=>{
  const ids=CODEX.map(item=>item.id);
  assert.equal(new Set(ids).size,ids.length);
});

test('library metadata is additive and selection-compatible',()=>{
  for(const practice of CODEX){
    assert.ok(practice.durationOptions.length);
    assert.ok(practice.phases.length);
    assert.ok(practice.goals.length);
    assert.ok(practice.contraindications.length);
    assert.equal(practice.contentVersion,1);
  }
});

test('catalog exposes stable transparency fields',()=>{
  const catalog=practiceLibraryCatalog(CODEX);
  assert.deepEqual(Object.keys(catalog[0]),[
    'id','name','domain','goals','intensity','levels','equipment',
    'contraindications','evidenceStatus','contentVersion','durationOptions','phaseCount'
  ]);
});

test('summary reports the current library shape',()=>{
  const summary=practiceLibrarySummary(practiceLibraryCatalog(CODEX));
  assert.equal(summary.practices,5);
  assert.ok(summary.domains>=4);
  assert.match(summary.statement,/5 Practices/);
});

test('library contract version is explicit',()=>{
  assert.equal(PRACTICE_LIBRARY_VERSION,1);
});
