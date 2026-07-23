import test from 'node:test';
import assert from 'node:assert/strict';
import {resolvePracticeContract,practiceContractOutcomeStatement} from '../src/core/practice-session.js';

const contract={version:1,judgementId:'j1',practiceId:'recovery',expectedEffect:'More steadiness.',review:'Did this help?'};

test('strong fit with acceptable burden resolves aligned',()=>{
  const outcome=resolvePracticeContract({contract,reflection:{effect:'right',goalFit:'strong',burden:'moderate'}});
  assert.equal(outcome.status,'aligned');
});

test('worse effect resolves misaligned',()=>{
  const outcome=resolvePracticeContract({contract,reflection:{effect:'worse',goalFit:'partial',burden:'moderate'}});
  assert.equal(outcome.status,'misaligned');
});

test('partial evidence remains partially aligned',()=>{
  const outcome=resolvePracticeContract({contract,reflection:{effect:'right',goalFit:'partial',burden:'moderate'}});
  assert.equal(outcome.status,'partially-aligned');
});

test('missing evidence remains uncertain',()=>{
  const outcome=resolvePracticeContract({contract,reflection:{}});
  assert.equal(outcome.status,'uncertain');
});

test('outcome preserves the original expectation',()=>{
  const outcome=resolvePracticeContract({contract,reflection:{effect:'right',goalFit:'strong',burden:'low'},at:'2026-07-21T10:00:00Z'});
  assert.equal(outcome.expectedEffect,'More steadiness.');
  assert.equal(outcome.resolvedAt,'2026-07-21T10:00:00Z');
});

test('statement is person-readable',()=>{
  assert.match(practiceContractOutcomeStatement({status:'misaligned'}),/did not match/);
});
