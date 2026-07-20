import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDecisionBoundaries,
  rankPractices,
  collectUnknowns,
  deriveChangeConditions,
  summarizeProvenance
} from '../src/core/decision-boundaries.js';
import { migrateV090ToV0100Phase1 } from '../src/core/state-schema.js';

function decision(){
  return {
    practice:{id:'walk',name:'Walk'},
    scores:{walk:2.1,recovery:1.92,focus:1.1},
    unknowns:['Whether recent fatigue is temporary.'],
    evidenceDiversity:{level:'Mixed'},
    agora:{blockedPractices:[]},
    advisors:[
      {advisor:'Body',weight:1.1,reason:'walking creates useful energy.',scores:{walk:.8,recovery:.5},evidence:[
        {family:'current_signal',independent:false},
        {family:'person_history',independent:true}
      ]},
      {advisor:'Recovery',weight:1,reason:'recovery deserves weight.',scores:{walk:.45,recovery:.8},evidence:[
        {family:'current_signal',independent:false}
      ]}
    ]
  };
}

const context={sleep:3,energy:2,time:15,challenge:'body',soreness:'none',emotionalLoad:'usual'};

test('practice ranking identifies chosen and runner-up options',()=>{
  const ranked=rankPractices(decision());
  assert.equal(ranked[0].id,'walk');
  assert.equal(ranked[1].id,'recovery');
});

test('decision boundaries expose a fragile close margin',()=>{
  const boundaries=buildDecisionBoundaries(decision(),context);
  assert.equal(boundaries.runnerUp.id,'recovery');
  assert.equal(boundaries.scoreMargin,.18);
  assert.equal(boundaries.stability,'conditional');
});

test('unknown signals are surfaced rather than silently defaulted',()=>{
  const unknowns=collectUnknowns(decision(),{...context,energy:'unknown'});
  assert.ok(unknowns.some(item=>item.includes('Energy was not reported')));
});

test('lack of professional input is explicitly disclosed',()=>{
  const unknowns=collectUnknowns(decision(),context);
  assert.ok(unknowns.some(item=>item.includes('No professional input')));
});

test('change conditions include runner-up threshold and correction trigger',()=>{
  const conditions=deriveChangeConditions(decision(),context,{name:'Recovery'},.18);
  assert.ok(conditions.some(item=>item.includes('Recovery would become more plausible')));
  assert.ok(conditions.some(item=>item.includes('correction')));
});

test('significant soreness removes redundant future soreness condition',()=>{
  const conditions=deriveChangeConditions(decision(),{...context,soreness:'significant'},{name:'Recovery'},.2);
  assert.equal(conditions.some(item=>item.startsWith('Significant soreness')),false);
});

test('evidence provenance distinguishes families and independence',()=>{
  const provenance=summarizeProvenance(decision().advisors);
  assert.equal(provenance.totalItems,3);
  assert.equal(Object.keys(provenance.families).length,2);
  assert.equal(provenance.independentItems,1);
});

test('v0.9.0 state migrates to schema 9 boundary-ready judgements',()=>{
  const migrated=migrateV090ToV0100Phase1({
    schemaVersion:8,
    judgements:[{id:'j1'}],
    history:[{decision:{id:'j1'}}],
    current:{decision:{id:'j1'}}
  });
  assert.equal(migrated.schemaVersion,9);
  assert.equal(migrated.productVersion,'0.10.0');
  assert.equal(migrated.judgements[0].boundaries,null);
});
