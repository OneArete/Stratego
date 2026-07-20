import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const graph=readFileSync(new URL('../src/components/living-graph.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('nodes pulse in place rather than translating outside the graph',()=>{
  assert.doesNotMatch(graph,/animateTransform attributeName="transform" type="translate"/);
  assert.match(graph,/attributeName="r"/);
});

test('compact node sizes are bounded',()=>{
  assert.match(graph,/Math\.min\(compact \? 8\.8 : 11\.2/);
  assert.match(graph,/Math\.min\(compact \? 13\.8 : 17\.5/);
});

test('wave travels sequentially across links',()=>{
  assert.match(graph,/const begin=\(index\*\.72\)/);
  assert.match(graph,/attributeName="stroke-width"/);
  assert.match(graph,/attributeName="opacity"/);
});

test('membrane uses a multi-stage fluid spline',()=>{
  assert.match(graph,/membraneC/);
  assert.match(graph,/membraneD/);
  assert.match(graph,/calcMode="spline"/);
});

test('SVG clips any residual overflow',()=>{
  assert.match(css,/\.living-graph svg\{\s*overflow:hidden !important/);
});
