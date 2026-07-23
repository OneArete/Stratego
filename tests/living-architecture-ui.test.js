import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const graph=fs.readFileSync(new URL('../src/components/living-graph.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('Today uses the actual Living Human Graph as its organism',()=>{
  assert.match(app,/renderLivingGraph\(graph,\{ambient:true\}\)/);
  assert.doesNotMatch(app,/living-companion-graph[^`]*<span>/);
});

test('ambient graph removes analytical chrome while preserving six-domain structure',()=>{
  assert.match(graph,/ambient = false/);
  assert.match(graph,/ambient \? '' :/);
  assert.match(css,/\.living-graph\.ambient/);
  assert.match(css,/\.route-today \.observe-stack>\.living-graph\{display:none\}/);
});

test('Living Architecture respects reduced motion',()=>{
  assert.match(css,/prefers-reduced-motion:reduce/);
});
