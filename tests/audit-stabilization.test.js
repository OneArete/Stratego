import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createInitialState,migrateState,PRODUCT_VERSION,STATE_SCHEMA_VERSION } from '../src/core/state-schema.js';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../service-worker.js',import.meta.url),'utf8');

test('current product identity is v0.17.1',()=>{
  assert.equal(PRODUCT_VERSION,'0.17.1');
  assert.equal(STATE_SCHEMA_VERSION,28);
  assert.equal(createInitialState().productVersion,'0.17.1');
});

test('fresh state contains every current collection',()=>{
  const state=createInitialState();
  for(const key of ['choiceLog','preferenceModel','outcomeRecords','commitments','frictionPlans','fallbackPlans','structuredReflections','outcomeAttributions','outcomeEpisodes','outcomePatterns','patternTransfers','judgementForecasts','calibrationAccountability']){
    assert.deepEqual(state[key],[],key);
  }
  assert.equal(state.reflectionDraft,null);
});

test('current-schema incomplete state is repaired conservatively',()=>{
  const state=migrateState({schemaVersion:28,profile:{name:'Pedro'},onboardingVersion:3});
  assert.deepEqual(state.patternTransfers,[]);
  assert.deepEqual(state.calibrationAccountability,[]);
  assert.equal(state.productVersion,'0.17.1');
});

test('deliberation is a browser-history route and replaces itself with judgement',()=>{
  assert.match(app,/HISTORY_ROUTES=new Set\(\['today','thinking'/);
  assert.match(app,/route\('judgement',\{history:'replace'\}\)/);
});

test('leaving deliberation cancels its interval and timeout',()=>{
  assert.match(app,/function cancelDeliberation\(\)/);
  assert.match(app,/clearTimeout\(deliberationTimeout\)/);
  assert.match(app,/if\(run!==deliberationRun\|\|currentRoute!=='thinking'\)return/);
});

test('Agora receives no preliminary calibration that could be applied twice',()=>{
  assert.match(app,/conveneAgora\(context,understanding,state\.history,state\.advisorMemories,longitudinalEvidence,null\)/);
  assert.doesNotMatch(app,/practice:\{id:'pending'/);
});

test('state import uses the same complete reconciliation as startup',()=>{
  assert.match(app,/function reconcileLoadedState\(input\)/);
  assert.match(app,/state=reconcileLoadedState\(loadState\(\)\)/);
});

test('release-specific asset URLs prevent stale Safari assets',()=>{
  assert.match(index,/styles\.css\?v=0171/);
  assert.match(index,/src\/app\.js\?v=0171/);
  assert.match(sw,/strategos-shell-v0\.17\.1/);
  assert.match(sw,/styles\.css\?v=0171/);
});
