import test from 'node:test';
import assert from 'node:assert/strict';
import { HUMAN_DIMENSIONS, buildHumanGraph } from '../src/core/human-graph.js';

test('frozen domains include Recovery and exclude Legacy',()=>{
  const ids=HUMAN_DIMENSIONS.map(x=>x.id);
  assert.ok(ids.includes('recovery'));
  assert.equal(ids.includes('legacy'),false);
});

test('recovery delta contributes to graph',()=>{
  const graph=buildHumanGraph([{completed:true,decision:{delta:{recovery:.5}}}]);
  assert.ok(graph.nodes.find(x=>x.id==='recovery').energy>.5);
});
