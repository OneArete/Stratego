import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPracticeExperience,practiceExperienceAudit } from '../src/core/practice-experience.js';

test('focused Practice experience exposes one primary cue without changing authority',()=>{
  const model=buildPracticeExperience({phase:['Push',60,'Controlled repetitions'],guidance:{technique:['Keep ribs quiet','Move slowly']},snapshot:{phaseIndex:0,totalPhases:3,next:{name:'Rest'}},paused:false});
  assert.equal(model.name,'Push');
  assert.equal(model.cue,'Keep ribs quiet');
  assert.equal(model.phaseLabel,'1 of 3');
  assert.equal(model.nextLabel,'Next: Rest');
  const audit=practiceExperienceAudit(model);
  assert.equal(audit.primaryCues,1);
  assert.equal(audit.automaticProgression,0);
  assert.equal(audit.safetyOverride,0);
});

test('paused Practice uses calm explicit continuity',()=>{
  const model=buildPracticeExperience({phase:['Hold',30,'Stay steady'],snapshot:{phaseIndex:1,totalPhases:2},paused:true});
  assert.equal(model.state,'paused');
  assert.match(model.statement,/Resume when ready/);
});
