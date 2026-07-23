import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createOutcomeLedgerEntry,outcomeLedgerResultFromReflection,upsertOutcomeLedger,
  outcomeLedgerAudit,outcomeLedgerLearningGate
} from '../src/core/outcome-ledger.js';
import { migrateV0250ToV0260Phase1 } from '../src/core/state-schema.js';

const historyEntry={judgementId:'j1',decision:{id:'j1',practice:{id:'p1',name:'Walk'},context:{sleep:2},humanModelSnapshot:{version:1},explainRecord:{version:1},personChoice:{id:'c1'}},practiceContentSnapshot:{id:'snap1'}};
const outcomeRecord={id:'o1',completedPracticeId:'p1'};
const structuredReflection={id:'r1',effect:'better',note:'More energy afterwards.'};

test('reflection direction maps to bounded ledger outcomes',()=>{
  assert.equal(outcomeLedgerResultFromReflection('better'),'yes');
  assert.equal(outcomeLedgerResultFromReflection('right'),'partly');
  assert.equal(outcomeLedgerResultFromReflection('worse'),'no');
  assert.equal(outcomeLedgerResultFromReflection(null),'unknown');
});

test('ledger entry freezes available decision context without activating learning',()=>{
  const entry=createOutcomeLedgerEntry({historyEntry,outcomeRecord,structuredReflection,result:'yes',note:structuredReflection.note});
  assert.equal(entry.judgementId,'j1');
  assert.equal(entry.practiceName,'Walk');
  assert.equal(entry.immutableContext.context.sleep,2);
  assert.equal(entry.modelInfluence,0);
  assert.equal(entry.judgementInfluence,0);
});

test('ledger deduplicates by linked outcome',()=>{
  const first=createOutcomeLedgerEntry({historyEntry,outcomeRecord,structuredReflection,result:'yes'});
  const second={...first,id:'replacement',result:'partly'};
  const list=upsertOutcomeLedger(upsertOutcomeLedger([],first),second);
  assert.equal(list.length,1);
  assert.equal(list[0].result,'partly');
});

test('audit remains descriptive and unknown is not learning eligible',()=>{
  const known=createOutcomeLedgerEntry({historyEntry,outcomeRecord,structuredReflection,result:'yes'});
  const unknown=createOutcomeLedgerEntry({historyEntry:{...historyEntry,judgementId:'j2',decision:{...historyEntry.decision,id:'j2'}},outcomeRecord:{id:'o2'},structuredReflection:{id:'r2'},result:'unknown'});
  const audit=outcomeLedgerAudit([known,unknown]);
  assert.equal(audit.total,2);
  assert.equal(audit.known,1);
  assert.equal(outcomeLedgerLearningGate(unknown).eligible,false);
  assert.equal(outcomeLedgerLearningGate(known).eligible,true);
});

test('v0.26 migration adds the ledger without reconstructing legacy outcomes',()=>{
  const migrated=migrateV0250ToV0260Phase1({schemaVersion:36,outcomeRecords:[{id:'legacy'}]});
  assert.equal(migrated.schemaVersion,37);
  assert.equal(migrated.productVersion,'0.26.0');
  assert.deepEqual(migrated.outcomeLedger,[]);
});
