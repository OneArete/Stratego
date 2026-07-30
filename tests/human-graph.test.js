import test from 'node:test';
import assert from 'node:assert/strict';
import { HUMAN_DIMENSIONS, buildHumanGraph, buildCheckinGraph, describeGraphHighlight } from '../src/core/human-graph.js';

test('frozen domains include Recovery and exclude Legacy',()=>{
  const ids=HUMAN_DIMENSIONS.map(x=>x.id);
  assert.ok(ids.includes('recovery'));
  assert.equal(ids.includes('legacy'),false);
});

test('recovery delta contributes to graph',()=>{
  const graph=buildHumanGraph([{completed:true,decision:{delta:{recovery:.5}}}]);
  assert.ok(graph.nodes.find(x=>x.id==='recovery').energy>.5);
});

// --- buildHumanGraph context signal mapping (v0.49.0) ---

test('buildHumanGraph: sleep wakes recovery node',()=>{
  const graph=buildHumanGraph([],{sleep:4,energy:2,time:30,challenge:'body',soreness:'none',emotionalLoad:'usual'});
  const recovery=graph.nodes.find(x=>x.id==='recovery');
  assert.ok(recovery.energy>0.5,'recovery energy should be elevated by excellent sleep');
  assert.ok(recovery.confidence>0.2,'recovery confidence should increase with sleep signal');
});

test('buildHumanGraph: significant soreness reduces body energy',()=>{
  const g1=buildHumanGraph([],{sleep:3,energy:3,time:30,challenge:'body',soreness:'none',emotionalLoad:'usual'});
  const g2=buildHumanGraph([],{sleep:3,energy:3,time:30,challenge:'body',soreness:'significant',emotionalLoad:'usual'});
  const body1=g1.nodes.find(x=>x.id==='body').energy;
  const body2=g2.nodes.find(x=>x.id==='body').energy;
  assert.ok(body2<body1,'significant soreness should reduce body energy');
});

test('buildHumanGraph: time affects agency node',()=>{
  const short=buildHumanGraph([],{sleep:3,energy:2,time:5,challenge:'focus',soreness:'none',emotionalLoad:'usual'});
  const long=buildHumanGraph([],{sleep:3,energy:2,time:60,challenge:'focus',soreness:'none',emotionalLoad:'usual'});
  const a1=short.nodes.find(x=>x.id==='agency').energy;
  const a2=long.nodes.find(x=>x.id==='agency').energy;
  assert.ok(a2>a1,'more time available should yield higher agency energy');
});

test('buildHumanGraph: heavy emotional load depresses mind energy',()=>{
  const g1=buildHumanGraph([],{sleep:3,energy:2,time:30,challenge:'focus',soreness:'none',emotionalLoad:'light'});
  const g2=buildHumanGraph([],{sleep:3,energy:2,time:30,challenge:'focus',soreness:'none',emotionalLoad:'heavy'});
  const m1=g1.nodes.find(x=>x.id==='mind').energy;
  const m2=g2.nodes.find(x=>x.id==='mind').energy;
  assert.ok(m2<m1,'heavy emotional load should lower mind energy');
});

// --- buildCheckinGraph (v0.49.0) ---

test('buildCheckinGraph: no signals → all nodes dormant and equal',()=>{
  const graph=buildCheckinGraph({});
  const energies=graph.nodes.map(x=>x.energy);
  const confidences=graph.nodes.map(x=>x.confidence);
  assert.ok(energies.every(e=>e<0.2),'all dormant nodes should have low energy');
  assert.ok(confidences.every(c=>c<0.15),'all dormant nodes should have low confidence');
  assert.equal(graph.state,'Awakening');
});

test('buildCheckinGraph: sleep signal awakens recovery',()=>{
  const graph=buildCheckinGraph({sleep:4});
  const recovery=graph.nodes.find(x=>x.id==='recovery');
  const agency=graph.nodes.find(x=>x.id==='agency');
  assert.ok(recovery.energy>0.7,'excellent sleep should strongly awaken recovery');
  assert.ok(recovery.confidence>0.4,'recovery confidence should be high with sleep signal');
  assert.ok(agency.energy<0.2,'agency should remain dormant without its signal');
});

test('buildCheckinGraph: energy signal awakens body',()=>{
  const graph=buildCheckinGraph({energy:3});
  const body=graph.nodes.find(x=>x.id==='body');
  assert.ok(body.energy>0.6,'high energy should strongly awaken body');
  assert.ok(body.confidence>0.4,'body confidence should be above dormant');
});

test('buildCheckinGraph: low energy produces lower body than high energy',()=>{
  const low=buildCheckinGraph({energy:1}).nodes.find(x=>x.id==='body').energy;
  const high=buildCheckinGraph({energy:3}).nodes.find(x=>x.id==='body').energy;
  assert.ok(high>low,'high energy should produce more body energy than low energy');
});

test('buildCheckinGraph: time awakens agency',()=>{
  const g5=buildCheckinGraph({time:5});
  const g60=buildCheckinGraph({time:60});
  const a5=g5.nodes.find(x=>x.id==='agency').energy;
  const a60=g60.nodes.find(x=>x.id==='agency').energy;
  assert.ok(a5>0.2,'even 5 min should stir agency above dormant');
  assert.ok(a60>a5,'60 min should give more agency energy than 5 min');
});

test('buildCheckinGraph: challenge awakens purpose',()=>{
  const graph=buildCheckinGraph({challenge:'body'});
  const purpose=graph.nodes.find(x=>x.id==='purpose');
  assert.ok(purpose.energy>0.5,'challenge signal should awaken purpose');
  assert.ok(purpose.confidence>0.4);
});

test('buildCheckinGraph: family challenge stirs relationships',()=>{
  const graph=buildCheckinGraph({challenge:'family'});
  const rel=graph.nodes.find(x=>x.id==='relationships');
  assert.ok(rel.energy>0.2,'family challenge should stir relationships above dormant');
});

test('buildCheckinGraph: emotionalLoad awakens mind',()=>{
  const light=buildCheckinGraph({emotionalLoad:'light'}).nodes.find(x=>x.id==='mind').energy;
  const heavy=buildCheckinGraph({emotionalLoad:'heavy'}).nodes.find(x=>x.id==='mind').energy;
  assert.ok(light>0.5,'light emotional load still activates mind');
  assert.ok(heavy<light,'heavy load should reduce mind energy vs light');
});

test('buildCheckinGraph: soreness alone partially activates body',()=>{
  const graph=buildCheckinGraph({soreness:'significant'});
  const body=graph.nodes.find(x=>x.id==='body');
  assert.ok(body.energy>0.2,'significant soreness alone should stir body above dormant');
  assert.ok(body.confidence>0.2);
});

test('buildCheckinGraph: all 6 signals → all nodes above dormant threshold',()=>{
  const ctx={sleep:3,energy:2,time:30,challenge:'focus',soreness:'none',emotionalLoad:'usual'};
  const graph=buildCheckinGraph(ctx);
  graph.nodes.forEach(node=>{
    assert.ok(node.energy>0.2,`${node.id} should be above dormant with full context`);
    assert.ok(node.confidence>0.1,`${node.id} confidence should be above dormant`);
  });
});

test('buildCheckinGraph: null/undefined values treated as absent',()=>{
  const graph=buildCheckinGraph({sleep:null,energy:undefined,time:''});
  const energies=graph.nodes.map(x=>x.energy);
  assert.ok(energies.every(e=>e<0.2),'null/undefined/empty signals should not activate any node');
});

// --- describeGraphHighlight (v0.60.0 — organism as emotional hook) ---

test('describeGraphHighlight: returns null for a graph with no nodes',()=>{
  assert.equal(describeGraphHighlight({nodes:[]}),null);
  assert.equal(describeGraphHighlight(null),null);
});

test('describeGraphHighlight: returns null for a fully neutral (no-data) graph',()=>{
  const neutral={nodes:HUMAN_DIMENSIONS.map(({label})=>({label,energy:0.5,momentum:0,confidence:0.2}))};
  assert.equal(describeGraphHighlight(neutral),null);
});

test('describeGraphHighlight: names the strongest domain and a rising trend',()=>{
  const graph=buildHumanGraph([],{sleep:4,energy:1,time:5,challenge:'recovery',soreness:'none',emotionalLoad:'usual'});
  const highlight=describeGraphHighlight(graph);
  assert.ok(highlight);
  assert.equal(highlight.label,'Recovery');
  assert.match(highlight.statement,/^Recovery is (growing|holding steady) today\.$/);
});

test('describeGraphHighlight: reports momentum direction from recent history',()=>{
  const risingHistory=Array.from({length:8},(_,i)=>({completed:true,decision:{delta:{recovery:i<4?-.3:.5}}}));
  const graph=buildHumanGraph(risingHistory);
  const highlight=describeGraphHighlight(graph);
  assert.ok(highlight);
  assert.match(highlight.statement,/is (growing|holding steady|easing) today\./);
});
