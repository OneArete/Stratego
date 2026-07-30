import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

test('daily check-in reveals one question at a time',()=>{
  assert.match(app,/const nextKey=nextMissingSignal\(context\)/);
  assert.match(app,/const prompt=nextKey\?questions\[nextKey\]:null/);
  assert.doesNotMatch(app,/\$\{question\('How did you sleep\?'[\s\S]*\$\{question\('Energy'/);
});

test('Today is organism + one sentence + one action — no Why details, no greeting, no continuity text',()=>{
  // v0.49.0: Today collapsed to exactly organism + h1(judgement) + action button
  assert.match(app,/moment-language.*h1.*\$\{esc\(model\.judgement\)\}/s);
  assert.doesNotMatch(app,/moment-greeting/,'greeting removed — one sentence only');
  assert.doesNotMatch(app,/moment-why/,'Why details removed — architecture invisible to user');
  assert.doesNotMatch(app,/moment-continuity/,'continuity text removed — one action only');
});

test('v0.60.0: the closed-day organism gets a one-time settle reveal, driven by the same graph data it renders',()=>{
  assert.match(app,/describeGraphHighlight\(graph\)/,'highlight is derived from the same graph object the organism renders, not invented separately');
  assert.match(app,/model\.settled\?' settling':''/,'the settle animation class is conditional on the model, not always-on');
  assert.match(app,/class="moment-reveal"/);
  assert.match(app,/model\.mode===['"]complete['"]&&model\.reasons\?\.length/,'the reveal paragraph only renders for the completed-day moment');
});
