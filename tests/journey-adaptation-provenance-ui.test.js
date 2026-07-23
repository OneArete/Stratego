import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('Journey exposes adaptation provenance through progressive disclosure',()=>{
  assert.ok(app.includes('class="journey-adaptation"'));
  assert.ok(app.includes('<summary>Practice adaptation</summary>'));
});

test('Journey distinguishes confirmed default from person choice',()=>{
  assert.ok(app.includes('confirmed default'));
  assert.ok(app.includes('chosen during Practice'));
});

test('Journey preserves alternative choice reason',()=>{
  assert.ok(app.includes('Person chose'));
  assert.ok(app.includes('j.personChoice.reason'));
});

test('Journey provenance remains visually subordinate',()=>{
  assert.match(css,/\.journey-adaptation/);
  assert.match(css,/font-size:9px/);
});
