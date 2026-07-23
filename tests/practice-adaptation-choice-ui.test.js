import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('Practice exposes easier standard and harder controls when available',()=>{
  assert.ok(app.includes("data-adaptation-level=\"${level}\""));
  assert.ok(app.includes("'Easier'"));
  assert.ok(app.includes("'Harder'"));
  assert.ok(app.includes("'Standard'"));
});

test('adaptation choice updates locally without rerouting Practice',()=>{
  const start=app.indexOf('if(t.dataset.adaptationLevel)');
  const end=app.indexOf('if(t.dataset.guideSection)',start);
  const block=app.slice(start,end);
  assert.doesNotMatch(block,/route\(/);
  assert.match(block,/persist\(\)/);
});

test('person selection is announced and can be voiced',()=>{
  assert.match(app,/adaptationChoiceSummary\(choice\)/);
  assert.match(app,/state\.settings\.voice==='guided'/);
});

test('adaptation controls are visually bounded',()=>{
  assert.match(css,/\.adaptation-choice/);
  assert.match(css,/grid-template-columns:repeat\(3,1fr\)/);
});
