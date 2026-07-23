import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEveningExperience,closeDailyStory } from '../src/core/evening-experience.js?v=0390p1';

test('evening experience opens only after practice reflection',()=>{
  assert.equal(buildEveningExperience({story:{stage:'judgement'}}).ready,false);
  assert.equal(buildEveningExperience({story:{stage:'reflection'}}).ready,true);
});

test('a day can close without writing',()=>{
  const result=closeDailyStory([],{day:'2026-07-23',skipped:true,at:'2026-07-23T20:00:00.000Z'});
  assert.equal(result[0].stage,'complete');
  assert.equal(result[0].eveningClosed,true);
  assert.equal(result[0].eveningReflectionSkipped,true);
});
