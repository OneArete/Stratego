import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderLivingGraph } from '../src/components/living-graph.js';

const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
const graph={state:'Growing',nodes:[
  {id:'body',label:'Body',energy:.9,momentum:.2,confidence:.8,volatility:.1},
  {id:'mind',label:'Mind',energy:.55,momentum:0,confidence:.5,volatility:.1},
  {id:'relationships',label:'Relationships',energy:.5,momentum:0,confidence:.5,volatility:.1},
  {id:'purpose',label:'Purpose',energy:.48,momentum:0,confidence:.5,volatility:.1},
  {id:'recovery',label:'Recovery',energy:.45,momentum:0,confidence:.5,volatility:.1},
  {id:'agency',label:'Agency',energy:.52,momentum:0,confidence:.5,volatility:.1}
]};

test('organism uses curved membranes and cubic filaments',()=>{
  const html=renderLivingGraph(graph,{ambient:true});
  assert.match(html,/class="graph-membrane graph-membrane-shadow"/);
  assert.match(html,/ C /);
  assert.match(html,/keyTimes="0;.18;.39;.58;.78;1"/);
});

test('organism exposes depth, stable self and two quiet fields',()=>{
  const html=renderLivingGraph(graph,{ambient:true});
  assert.match(html,/class="organism-depth"/);
  assert.match(html,/graph-pulse graph-pulse-outer/);
  assert.match(html,/graph-pulse graph-pulse-inner/);
  assert.match(html,/class="graph-center"/);
});

test('one life clock coordinates the organism',()=>{
  assert.match(css,/--life-clock:16s/);
  assert.match(css,/animation:organism-breath var\(--life-clock\)/);
  assert.match(css,/animation:core-temperature var\(--life-clock\)/);
});

test('reduced motion freezes all living layers',()=>{
  assert.match(css,/\.organism-body,.graph-membrane-shadow,.graph-link,.graph-node,.node-halo,.node-core,.graph-center,.graph-pulse\{animation:none!important\}/);
});
