import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

test('Practice surface prioritises one cue and keeps technique optional',()=>{
  assert.match(app,/practice-primary-cue/);
  assert.match(app,/practiceExperience\.cue/);
  assert.doesNotMatch(app,/<details class="exercise-guide" open><summary>Technique<\/summary>/);
});
