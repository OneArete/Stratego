import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('official visual system uses a restrained 500px content width',()=>{
  assert.ok(css.includes('--content-max:500px'));
  assert.ok(css.includes('max-width:var(--content-max)'));
});

test('splash mark is smaller than the former 150px baseline',()=>{
  assert.ok(css.includes('.splash .delta.large{\n  width:124px;\n  height:124px;'));
});

test('Strategos splash title uses the quieter 25px scale',()=>{
  assert.ok(css.includes('.splash .brand h1{\n  font-size:25px;'));
});

test('splash proposition is reduced to 18px',()=>{
  assert.ok(css.includes('.splash .brand p{\n  font-size:18px;'));
});

test('tap prompt remains deliberately subordinate',()=>{
  assert.ok(css.includes('.splash .tap{'));
  assert.ok(css.includes('font-size:9px;'));
  assert.ok(css.includes('opacity:.72;'));
});

test('primary headings and mission hero are reduced without losing hierarchy',()=>{
  assert.ok(css.includes('.thinking-copy h2{\n  font-size:34px;'));
  assert.ok(css.includes('.mission-hero h2{\n  font-size:52px;'));
});

test('cards use a tighter common radius and padding token',()=>{
  assert.ok(css.includes('--radius-card:18px'));
  assert.ok(css.includes('--space-card:17px'));
});

test('small screens receive an additional restrained splash scale',()=>{
  assert.ok(css.includes('@media(max-width:390px)'));
  assert.ok(css.includes('width:116px;'));
});
