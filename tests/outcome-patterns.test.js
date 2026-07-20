import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createOutcomeEpisode,
  upsertOutcomePattern,
  evaluateOutcomePattern,
  patternInfluence,
  rejectOutcomePattern,
  reconcileOutcomePatterns
} from '../src/core/outcome-patterns.js';
import { migrateV0131ToV0140Phase1 } from '../src/core/state-schema.js';

const history={
  judgementId:'j1',
  decision:{id:'j1',domain:'Body',practice:{id:'walk'}},
  context:{challenge:'body',soreness:'mild',emotionalLoad:'usual'},
  completedAt:'2026-07-20T10:00:00.000Z'
};
const reflection={effect:'better',goalFit:'strong',burden:'low',createdAt:'2026-07-20T10:00:00.000Z'};
const attribution={source:'practice',causalConfidence:'high'};
const learning={eligible:true,weight:.8};

test('creates a longitudinal outcome episode',()=>{
  const episode=createOutcomeEpisode({historyEntry:history,structuredReflection:reflection,attribution,learningSignal:learning});
  assert.equal(episode.practiceId,'walk');
  assert.equal(episode.contextKey,'body|mild|usual');
  assert.equal(episode.eligible,true);
});

test('first episode creates emerging pattern',()=>{
  const episode=createOutcomeEpisode({historyEntry:history,structuredReflection:reflection,attribution,learningSignal:learning});
  const patterns=upsertOutcomePattern([],episode);
  assert.equal(patterns[0].status,'emerging');
  assert.equal(patterns[0].observations,1);
});

test('duplicate episode does not increase observations',()=>{
  const episode=createOutcomeEpisode({historyEntry:history,structuredReflection:reflection,attribution,learningSignal:learning});
  let patterns=upsertOutcomePattern([],episode);
  patterns=upsertOutcomePattern(patterns,episode);
  assert.equal(patterns[0].observations,1);
});

test('four consistent causally supported observations create stable pattern',()=>{
  let patterns=[];
  for(let index=0;index<4;index++){
    const episode=createOutcomeEpisode({
      historyEntry:{...history,judgementId:`j${index}`,decision:{...history.decision,id:`j${index}`}},
      structuredReflection:{...reflection,createdAt:`2026-07-2${index}T10:00:00.000Z`},
      attribution,
      learningSignal:learning
    });
    patterns=upsertOutcomePattern(patterns,episode);
  }
  assert.equal(patterns[0].status,'stable');
  assert.equal(evaluateOutcomePattern(patterns[0]),'stable');
});

test('contradictory outcomes prevent premature stability',()=>{
  let patterns=[];
  for(let index=0;index<4;index++){
    const episode=createOutcomeEpisode({
      historyEntry:{...history,judgementId:`j${index}`,decision:{...history.decision,id:`j${index}`}},
      structuredReflection:{...reflection,effect:index%2?'worse':'better'},
      attribution,
      learningSignal:learning
    });
    patterns=upsertOutcomePattern(patterns,episode);
  }
  assert.equal(patterns[0].status,'emerging');
});

test('stable pattern influence remains bounded',()=>{
  const pattern={status:'stable',observations:5,eligibleObservations:5,positive:5,neutral:0,negative:0,causalStrength:.9};
  const influence=patternInfluence(pattern);
  assert.equal(influence.applies,true);
  assert.ok(influence.weight<=.25);
});

test('person can reject a misleading pattern and reconciliation removes duplicates',()=>{
  const episode=createOutcomeEpisode({historyEntry:history,structuredReflection:reflection,attribution,learningSignal:learning});
  let patterns=upsertOutcomePattern([],episode);
  patterns=rejectOutcomePattern(patterns,{patternId:patterns[0].id,note:'Context was exceptional.'});
  assert.equal(patterns[0].status,'rejected');

  const state=reconcileOutcomePatterns({
    outcomeEpisodes:[episode],
    outcomePatterns:[patterns[0],{...patterns[0],id:'duplicate'}]
  });
  assert.equal(state.outcomePatterns.length,1);
});

test('v0.13.1 state migrates to schema 22 longitudinal outcome shape',()=>{
  const migrated=migrateV0131ToV0140Phase1({schemaVersion:21});
  assert.equal(migrated.schemaVersion,22);
  assert.equal(migrated.productVersion,'0.14.0');
  assert.deepEqual(migrated.outcomeEpisodes,[]);
  assert.deepEqual(migrated.outcomePatterns,[]);
});
