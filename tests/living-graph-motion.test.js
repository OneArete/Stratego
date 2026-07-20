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
