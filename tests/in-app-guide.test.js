import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('guide is a routed product screen but not a fifth footer destination',()=>{
  assert.match(app,/ROUTES=\{[^}]*guide/);
  const navBlock=app.slice(app.indexOf('const nav='),app.indexOf('const ROUTES='));
  assert.doesNotMatch(navBlock,/Guide/);
  assert.match(navBlock,/Today/);
  assert.match(navBlock,/Understanding/);
  assert.match(navBlock,/Journey/);
  assert.match(navBlock,/Settings/);
});

test('Settings contains the guide entry',()=>{
  assert.ok(app.includes('How to use Strategos'));
  assert.ok(app.includes('data-guide-section="overview"'));
});

test('guide explains the complete daily cycle',()=>{
  for(const term of ['Today','Agora','Judgement','Practice','Reflection']){
    assert.ok(app.includes(term));
  }
});

test('guide preserves the agency principle',()=>{
  assert.ok(app.includes('Strategos advises. You decide.'));
});

test('contextual help exists for graph judgement and Understanding',()=>{
  assert.ok(app.includes('data-guide-section="graph"'));
  assert.ok(app.includes('data-guide-section="judgement"'));
  assert.ok(app.includes('data-guide-section="understanding"'));
});

test('contextual help routes without browser prompts',()=>{
  assert.match(app,/if\(t\.dataset\.guideSection\)\{guideFocus=t\.dataset\.guideSection;return route\('guide'\)\}/);
});

test('guide uses progressive disclosure',()=>{
  assert.ok(app.includes('class="guide-section"'));
  assert.ok(app.includes('<details'));
  assert.match(css,/\.guide-section\[open\]/);
});

test('guide keeps Settings active in the footer',()=>{
  const start=app.indexOf('function guide(){');
  const end=app.indexOf('function settings(){',start);
  assert.match(app.slice(start,end),/\$\{nav\('settings'\)\}/);
});
