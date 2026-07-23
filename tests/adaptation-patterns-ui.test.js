import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('Understanding Agency exposes adaptation pattern governance',()=>{
  assert.ok(app.includes('ADAPTATION PATTERNS'));
  assert.ok(app.includes('Repeated in-session choices, without silent influence'));
});

test('UI states that candidates have no current influence',()=>{
  assert.ok(app.includes('Current judgement influence: none'));
});

test('patterns are derived from completed history',()=>{
  assert.match(app,/adaptationPatternCandidates\(state\.history\)/);
});

test('adaptation pattern cards remain visually restrained',()=>{
  assert.match(css,/\.adaptation-pattern-item/);
  assert.match(css,/background:rgba\(255,255,255,.012\)/);
});
