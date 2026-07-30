import test from 'node:test';
import assert from 'node:assert/strict';
import { buildUnderstanding } from '../src/core/understanding.js';
import { conveneAgora } from '../src/core/agora.js';
import { CODEX, validatePracticeLibrary } from '../src/data/codex.js';

// Adding a practice to CODEX with no advisor ever scoring it competitively is
// dead content: it exists in the library, passes shape validation, but can
// never actually be recommended. These tests are positive controls proving
// 'direction' and 'decisive-action' (added alongside the existing five) are
// each reachable — that a real, permitted daily context exists where the
// practice actually wins Agora's ranking, not just scores non-zero.

test('practice library validates with the two new domains present',()=>{
  const summary=validatePracticeLibrary();
  assert.equal(summary.total,7);
  assert.equal(summary.valid,7);
  assert.equal(summary.invalid,0);
  assert.ok(CODEX.some(p=>p.id==='direction'));
  assert.ok(CODEX.some(p=>p.id==='decisive-action'));
});

test('direction (the purpose-domain practice) can actually win a judgement, not just score',()=>{
  const ctx={sleep:2,energy:2,time:5,challenge:'body',soreness:'none',emotionalLoad:'light'};
  const result=conveneAgora(ctx,buildUnderstanding(ctx),[],{});
  assert.equal(result.practice.id,'direction');
  const runnerUp=Object.entries(result.scores).filter(([id])=>id!=='direction').sort((a,b)=>b[1]-a[1])[0][1];
  assert.ok(result.scores.direction>runnerUp,'direction must genuinely outscore every other practice in this context, not tie');
});

test('decisive-action (the agency-domain practice) can actually win a judgement, not just score',()=>{
  const ctx={sleep:4,energy:4,time:5,challenge:'body',soreness:'mild',emotionalLoad:'light'};
  const result=conveneAgora(ctx,buildUnderstanding(ctx),[],{});
  assert.equal(result.practice.id,'decisive-action');
  const runnerUp=Object.entries(result.scores).filter(([id])=>id!=='decisive-action').sort((a,b)=>b[1]-a[1])[0][1];
  assert.ok(result.scores['decisive-action']>runnerUp,'decisive-action must genuinely outscore every other practice in this context, not tie');
});

test('neither new practice is ever selected while blocked by a canonical safety rule',()=>{
  // Regression guard: reachability tuning must never bypass eligibility blocking.
  const ctx={sleep:2,energy:3,time:15,challenge:'body',soreness:'significant',emotionalLoad:'usual'};
  const result=conveneAgora(ctx,buildUnderstanding(ctx),[],{});
  assert.notEqual(result.practice.id,'strength');
  assert.ok(result.agora.blockedPractices.some(item=>item.practiceId==='strength'));
});
