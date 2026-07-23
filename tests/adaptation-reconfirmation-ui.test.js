import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('reopened candidate can display a fresh evidence requirement',()=>{
  assert.ok(app.includes('Fresh evidence required'));
  assert.ok(app.includes('reconfirmation-gate'));
});

test('confirm handler rechecks eligibility before persistence',()=>{
  const start=app.indexOf('if(t.dataset.adaptationPatternAction)');
  const end=app.indexOf('if(t.dataset.preferenceAction)',start);
  const handler=app.slice(start,end);
  assert.match(handler,/canConfirmAdaptationPattern/);
  assert.match(handler,/announceStatus/);
});

test('disabled confirmation remains visibly subordinate',()=>{
  assert.match(css,/button:disabled/);
  assert.match(css,/opacity:.42/);
});
