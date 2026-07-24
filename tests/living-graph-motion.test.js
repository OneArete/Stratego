import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderLivingGraph } from '../src/components/living-graph.js';

const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

const graph={
  state:'Growing',
  nodes:[
    {id:'body',label:'Body',energy:.9,momentum:.2,confidence:.8,volatility:.1},
    {id:'mind',label:'Mind',energy:.55,momentum:0,confidence:.5,volatility:.1},
    {id:'relationships',label:'Relationships',energy:.5,momentum:0,confidence:.5,volatility:.1},
    {id:'purpose',label:'Purpose',energy:.48,momentum:0,confidence:.5,volatility:.1},
    {id:'recovery',label:'Recovery',energy:.45,momentum:0,confidence:.5,volatility:.1},
    {id:'agency',label:'Agency',energy:.52,momentum:0,confidence:.5,volatility:.1}
  ]
};

// --- Energy-responsive membrane (v0.50.0) ---

test('membrane displaces more toward high-energy node than dormant node',()=>{
  // Build a graph where one node has high energy and others are dormant.
  // The rendered membrane path data should differ from a uniform-energy graph.
  const uniform={state:'Stable',nodes:['body','mind','relationships','purpose','recovery','agency'].map(id=>({id,label:id,energy:.5,momentum:0,confidence:.5,volatility:.08}))};
  const asymmetric={state:'Growing',nodes:uniform.nodes.map((n,i)=>i===0?{...n,energy:.92}:{...n,energy:.14})};
  const htmlU=renderLivingGraph(uniform,{compact:true});
  const htmlA=renderLivingGraph(asymmetric,{compact:true});
  assert.match(htmlU,/class="graph-membrane"/);
  assert.match(htmlA,/class="graph-membrane"/);
  assert.match(htmlA,/data-dimension="body"/);
  // Energy-responsive membrane: asymmetric energy produces different path coordinates
  assert.notEqual(htmlU,htmlA,'energy-responsive membrane produces different shapes for different energy distributions');
});

// --- Deliberating mode (v0.50.0) ---

test('deliberating mode uses faster membrane animation (10s)',()=>{
  const html=renderLivingGraph(graph,{ambient:true,deliberating:true});
  assert.match(html,/dur="10s"/);
  assert.doesNotMatch(html,/dur="18s"/);
});

test('deliberating mode uses faster filament drift (7s)',()=>{
  const html=renderLivingGraph(graph,{ambient:true,deliberating:true});
  assert.match(html,/dur="7s"/);
  assert.doesNotMatch(html,/dur="14s"/);
});

test('deliberating mode renders convergence ring with contracting SMIL animation',()=>{
  const html=renderLivingGraph(graph,{ambient:true,deliberating:true});
  assert.match(html,/class="convergence-ring"/);
  assert.match(html,/attributeName="r".*fill="freeze"/s);
});

test('deliberating mode hides node labels — organism speaks without words',()=>{
  const html=renderLivingGraph(graph,{ambient:true,deliberating:true});
  assert.doesNotMatch(html,/class="node-label"/,'labels hidden during deliberation');
});

test('deliberating mode adds deliberating CSS class',()=>{
  const html=renderLivingGraph(graph,{ambient:true,deliberating:true});
  assert.match(html,/class="living-graph[^"]*deliberating/);
});

test('non-deliberating ambient renders labels and no convergence ring',()=>{
  const html=renderLivingGraph(graph,{ambient:true});
  assert.match(html,/class="node-label"/);
  assert.doesNotMatch(html,/convergence-ring/);
  assert.match(html,/dur="18s"/);
});

test('compact graph uses a smaller 214 viewbox',()=>{
  const html=renderLivingGraph(graph,{compact:true});
  assert.match(html,/viewBox="0 0 214 214"/);
});

test('graph renders an animated closed membrane between all dimensions',()=>{
  const html=renderLivingGraph(graph,{compact:true});
  assert.match(html,/class="graph-membrane"/);
  assert.match(html,/attributeName="d"/);
  assert.match(html,/repeatCount="indefinite"/);
});

test('strongest dimension is explicitly marked as dominant',()=>{
  const html=renderLivingGraph(graph,{compact:true});
  assert.match(html,/class="graph-node dominant-node" data-dimension="body"/);
  assert.match(html,/Body currently has the strongest emphasis/);
});

test('dominant links receive stronger visual treatment',()=>{
  const html=renderLivingGraph(graph,{compact:true});
  assert.match(html,/dominant-link/);
});

test('quiet scale II reduces content width and splash mark',()=>{
  assert.ok(css.includes('--content-max:456px'));
  assert.ok(css.includes('.splash .delta.large{\n  width:106px;'));
});

test('compact living graph is reduced to 190px',()=>{
  assert.ok(css.includes('.living-graph.compact svg{\n  max-width:190px;'));
});

test('membrane and links have slow current animations',()=>{
  assert.ok(css.includes('@keyframes membraneCurrent'));
  assert.ok(css.includes('@keyframes linkCurrent'));
});

test('reduced motion disables membrane, link and dominant-node animation',()=>{
  assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'));
  assert.ok(css.includes('.graph-membrane,\n  .graph-link,\n  .dominant-node .node-core'));
});
