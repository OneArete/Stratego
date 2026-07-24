import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('daily context completes without a redundant confirmation action',()=>{
  assert.match(app,/if\(dailyContextComplete\(\)\).*Today is understood\./s);
  assert.doesNotMatch(app,/data-action="save-daily-context">Use this context/);
});

test('deliberation does not expose internal council architecture',()=>{
  const thinking=app.slice(app.indexOf('function thinking()'),app.indexOf('function completePersonChoice'));
  assert.doesNotMatch(thinking,/THE AGORA|The council is deliberating|advisor-lights/);
  assert.match(thinking,/Deliberating./);
});

test('context evidence has a living visual manifestation',()=>{
  // v0.49.0: seed dots replaced by Living Graph — organism communicates, not dots
  assert.match(app,/buildCheckinGraph\(context\)/,'check-in uses buildCheckinGraph for progressive organism');
  assert.match(app,/renderLivingGraph\(checkinGraph/,'Living Graph renders in check-in, not static SVG');
  assert.match(css,/\.quiet-deliberation/);
});
