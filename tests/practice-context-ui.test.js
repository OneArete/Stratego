import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('Practice UI uses a single governed guidance decision',()=>{
  assert.match(app,/buildGuidanceDecision/);
  assert.doesNotMatch(app,/const guidanceLevel=selectGuidanceLevel/);
});

test('adapted guidance explains its reason',()=>{
  assert.ok(app.includes('guidanceDecision.reason'));
  assert.match(css,/\.guidance-recommendation small/);
});

test('adaptation remains conditional rather than always visible',()=>{
  assert.match(app,/guidanceDecision\.adapted\?/);
});
