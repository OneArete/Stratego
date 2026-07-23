import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('optional reflection explains its purpose before asking questions',()=>{
  assert.ok(app.includes('Help Strategos separate the effect of the Practice from coincidence or outside events.'));
  assert.ok(app.includes('There are no correct answers.'));
});

test('each advanced field explains what the person should assess',()=>{
  for(const copy of [
    'Compare what happened with what you expected before starting.',
    'confidence in your overall feedback, not confidence in Strategos',
    'Choose what contributed most',
    'Low is appropriate when several explanations are possible.',
    'Examples: medication, food, conversation'
  ]){
    assert.ok(app.includes(copy));
  }
});

test('ambiguous field labels are replaced with plain questions',()=>{
  assert.ok(app.includes('Was the result surprising?'));
  assert.ok(app.includes('How confident are you in this assessment?'));
  assert.ok(app.includes('How certain are you about that cause?'));
  assert.ok(app.includes('Anything else Strategos should remember?'));
});

test('optional section remains progressively disclosed',()=>{
  const block=app.slice(app.indexOf('<details class="reflection-detail">'),app.indexOf('</details>',app.indexOf('<details class="reflection-detail">'))+10);
  assert.match(block,/Optional\. Use this only when it helps/);
  assert.match(block,/structured-reflection/);
});

test('guidance remains visually subordinate',()=>{
  assert.match(css,/\.reflection-detail summary small/);
  assert.match(css,/font-size:9px/);
  assert.match(css,/background:rgba\(184,148,88,.035\)/);
});
