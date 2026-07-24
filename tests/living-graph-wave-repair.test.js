import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const graph=readFileSync(new URL('../src/components/living-graph.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('nodes breathe in place rather than translating outside the graph',()=>{
  assert.doesNotMatch(graph,/animateTransform attributeName="transform" type="translate"/);
  assert.match(css,/@keyframes domain-breath/);
  assert.match(css,/transform:scale\(1\.025\)/);
});

test('node sizes remain bounded in compact and ambient modes',()=>{
  assert.match(graph,/Math\.min\(compact\?8\.4:ambient\?10\.8:10\.6/);
  assert.match(graph,/Math\.min\(compact\?13\.4:ambient\?19:17/);
});

test('filaments carry bounded organic drift without attention-seeking pulses',()=>{
  assert.match(graph,/filamentPath\(node,next,center,index,\.72\)/);
  // v0.50.0: duration is dynamic — 14s normal, 7s deliberating — check both exist as string literals
  assert.match(graph,/'14s'/,'normal filament duration 14s preserved as default');
  assert.match(graph,/'7s'/,'deliberating filament duration 7s available');
  assert.doesNotMatch(graph,/attributeName="stroke-width"/);
});

test('membrane uses a multi-stage fluid spline',()=>{
  // v0.50.0: phases are dynamic — normal [0,.65,1.35,2.1,2.85] and deliberating [0,1.1,2.25,3.4,4.6]
  assert.match(graph,/0, \.65, 1\.35, 2\.1, 2\.85/,'normal membrane phases preserved in ternary default');
  assert.match(graph,/keyTimes="0;\.18;\.39;\.58;\.78;1"/);
  assert.match(graph,/calcMode="spline"/);
});

test('SVG clips any residual overflow',()=>{
  assert.match(css,/\.living-graph svg\{\s*overflow:hidden !important/);
});
