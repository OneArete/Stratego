import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('Practice screen renders technique, easier, harder and safety disclosure',()=>{
  for(const label of ['Technique','Easier version','Harder version','Safety']){
    assert.ok(app.includes(label));
  }
});

test('recommended guidance is selected from current context',()=>{
  assert.match(app,/buildGuidanceDecision/);
  assert.match(app,/guidanceDecision\.recommendation/);
});

test('guided voice uses structured phase guidance',()=>{
  assert.match(app,/phaseGuidance\.voiceCue/);
});

test('safety treatment remains visually distinct but restrained',()=>{
  assert.match(css,/\.safety-guide/);
  assert.match(css,/rgba\(181,92,92,.26\)/);
});

test('guidance remains progressively disclosed',()=>{
  assert.ok(app.includes('class="exercise-guide safety-guide"'));
  assert.ok(app.includes('<details class="exercise-guide"'));
});
