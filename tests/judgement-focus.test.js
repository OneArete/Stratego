import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('Current Judgement keeps primary footer visible',()=>{
  const start=app.indexOf('function judgement(){');
  const end=app.indexOf('async function requestWakeLock()',start);
  const block=app.slice(start,end);
  assert.match(block,/\$\{nav\('today'\)\}/);
});

test('Current Judgement no longer renders the full Agora archive',()=>{
  const start=app.indexOf('function judgement(){');
  const end=app.indexOf('async function requestWakeLock()',start);
  const block=app.slice(start,end);
  assert.doesNotMatch(block,/Hear every member of the Agora/);
  assert.doesNotMatch(block,/Deliberation trace/);
  assert.doesNotMatch(block,/Evidence provenance/);
});

test('focused judgement links to Understanding',()=>{
  assert.ok(app.includes('See the full reasoning in Understanding'));
  assert.ok(app.includes('data-action="understanding"'));
});

test('full reasoning is available in Understanding',()=>{
  assert.ok(app.includes('LATEST DELIBERATION'));
  assert.ok(app.includes('Open full reasoning'));
  assert.ok(app.includes('MINORITY REPORTS'));
  assert.ok(app.includes('DECISION BOUNDARIES'));
});

test('Agora rotates the existing SVG ring around the Delta',()=>{
  assert.ok(app.includes('class="agora-orbit"'));
  assert.match(css,/@keyframes agora-existing-ring-turn/);
  assert.match(css,/\.agora-orbit \.delta \.ring\{/);
  assert.match(css,/animation:agora-existing-ring-turn 3\.2s linear infinite !important/);
});

test('Agora creates no additional orbit circles',()=>{
  assert.match(css,/\.agora-orbit::before,\s*\.agora-orbit::after\{/);
  assert.match(css,/content:none !important/);
  assert.match(css,/display:none !important/);
});

test('existing ring animation respects reduced motion',()=>{
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/\.agora-orbit \.delta \.ring\{\s*animation:none !important/);
});
