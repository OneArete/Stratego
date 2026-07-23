import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPhaseGuidance,
  parseGuidance,
  selectGuidanceLevel,
  guidanceRecommendation,
  shouldShowSafetyPanel
} from '../src/core/practice-guidance.js';

test('guidance parser separates technique regression progression and caution',()=>{
  const parsed=parseGuidance([
    'Technique: Keep the ribs quiet.',
    'Regression: Reduce the range.',
    'Progression: Add a slower lowering phase.',
    'Caution: Stop if pain increases.'
  ]);
  assert.deepEqual(parsed.technique,['Keep the ribs quiet.']);
  assert.deepEqual(parsed.regression,['Reduce the range.']);
  assert.deepEqual(parsed.progression,['Add a slower lowering phase.']);
  assert.deepEqual(parsed.cautions,['Stop if pain increases.']);
});

test('unlabelled guidance remains technique',()=>{
  assert.deepEqual(parseGuidance(['Move with control.']).technique,['Move with control.']);
});

test('high soreness selects regression guidance',()=>{
  assert.equal(selectGuidanceLevel({soreness:'high',energy:'steady'}),'regression');
});

test('advanced experience selects progression when context permits',()=>{
  assert.equal(selectGuidanceLevel({experience:'advanced',soreness:'none',energy:'steady'}),'progression');
});

test('recommendation falls back to technique',()=>{
  const result=guidanceRecommendation({technique:['Control the movement.'],regression:[]},'regression');
  assert.equal(result.level,'technique');
});

test('context adds conservative caution and stop signals',()=>{
  const guidance=buildPhaseGuidance({
    phase:['Movement',60,'',[]],
    practice:{id:'strength',name:'Strength'},
    context:{soreness:'high',energy:'low'}
  });
  assert.ok(guidance.cautions.length>=2);
  assert.ok(guidance.stopSignals.some(item=>/sharp pain/.test(item)));
});

test('guided voice cue uses phase summary and first technique cue',()=>{
  const guidance=buildPhaseGuidance({
    phase:['Breathing',60,'Slow the breath',['Technique: Exhale gently.']]
  });
  assert.match(guidance.voiceCue,/Breathing/);
  assert.match(guidance.voiceCue,/Exhale gently/);
});

test('safety panel appears whenever caution or stop signals exist',()=>{
  assert.equal(shouldShowSafetyPanel({cautions:[],stopSignals:['Stop.']}),true);
});
