import test from 'node:test';
import assert from 'node:assert/strict';
import {createInitialState} from '../src/core/state-schema.js';
import {createStateExport,serializeStateExport,validateStateImport,createImportPreview,exportFilename} from '../src/core/state-transfer.js';

test('state export validates and round-trips',()=>{
  const state=createInitialState();
  state.profile={name:'Pedro'};
  state.history=[{completed:true}];
  const text=serializeStateExport(state,{now:new Date('2026-07-19T12:00:00.000Z')});
  const result=validateStateImport(text);
  assert.equal(result.ok,true);
  assert.equal(result.state.profile.name,'Pedro');
  assert.equal(result.state.history.length,1);
});

test('tampered state export is rejected',()=>{
  const exported=createStateExport(createInitialState());
  exported.state.profile={name:'Changed after checksum'};
  const result=validateStateImport(exported);
  assert.equal(result.ok,false);
  assert.match(result.error,/integrity/i);
});

test('unrelated JSON is rejected',()=>{
  const result=validateStateImport(JSON.stringify({hello:'world'}));
  assert.equal(result.ok,false);
  assert.match(result.error,/not a Strategos/i);
});

test('import preview is concise and person-readable',()=>{
  const state=createInitialState();
  state.profile={name:'Pedro'};
  state.judgements=[{},{}];
  state.advisorMemories={Body:{},Recovery:{}};
  const preview=createImportPreview(state,{productVersion:'0.8.1'});
  assert.deepEqual(preview,{profileName:'Pedro',historyCount:0,judgementCount:2,advisorMemoryCount:2,hasActivePractice:false,exportedAt:null,sourceProductVersion:'0.8.1'});
});

test('export filename includes ISO date',()=>{
  assert.equal(exportFilename(new Date('2026-07-19T12:00:00Z')),'strategos-state-2026-07-19.json');
});
