import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const graph=fs.readFileSync(new URL('../src/components/living-graph.js',import.meta.url),'utf8');

test('Today primary check-in action routes to the check-in experience',()=>{
  assert.match(app,/a==='checkin'\|\|a==='focus-signals'/);
});

test('neutral organism removes geometric noise and asymmetric membrane displacement',()=>{
  assert.match(graph,/const neutral = graph\.nodes\.length > 0/);
  assert.match(graph,/const irregularity=neutral \? 0/);
  assert.match(graph,/const angle=index\*60\+\(neutral \? 0/);
  assert.match(graph,/\? membranePhases\.map\(\(\)=>closedCurve\(nodes\)\)/);
});
