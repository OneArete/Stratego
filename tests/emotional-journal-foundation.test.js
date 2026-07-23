import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createEmotionalJournalEntry,
  updateEmotionalJournalEntry,
  deleteEmotionalJournalEntry,
  upsertEmotionalJournalEntry,
  emotionalJournalToday,
  emotionalJournalAudit
} from '../src/core/emotional-journal.js?v=0390p1';

test('blank reflection is not created',()=>{
  assert.equal(createEmotionalJournalEntry({text:'   '}),null);
});

test('entry preserves free text and zero influence',()=>{
  const entry=createEmotionalJournalEntry({text:'A difficult day, but dinner together was good.',entryDate:'2026-07-22',at:'2026-07-22T21:00:00Z'});
  assert.equal(entry.text,'A difficult day, but dinner together was good.');
  assert.equal(entry.judgementInfluence,0);
  assert.equal(entry.humanModelInfluence,0);
  assert.equal(entry.safetyInfluence,0);
});

test('entry can be updated',()=>{
  const entry=createEmotionalJournalEntry({text:'First version.'});
  const updated=updateEmotionalJournalEntry(entry,{text:'Second version.',at:'2026-07-22T22:00:00Z'});
  assert.equal(updated.text,'Second version.');
});

test('entry can be upserted and deleted',()=>{
  const entry=createEmotionalJournalEntry({text:'Reflection.'});
  const list=upsertEmotionalJournalEntry([],entry);
  assert.equal(list.length,1);
  assert.equal(deleteEmotionalJournalEntry(list,entry.id).length,0);
});

test('today entry is recoverable',()=>{
  const entry=createEmotionalJournalEntry({text:'Today.',entryDate:'2026-07-22'});
  assert.equal(emotionalJournalToday([entry],'2026-07-22').id,entry.id);
});

test('audit remains non-influential',()=>{
  const audit=emotionalJournalAudit([createEmotionalJournalEntry({text:'Reflection.'})]);
  assert.equal(audit.total,1);
  assert.equal(audit.judgementInfluence,0);
  assert.equal(audit.humanModelInfluence,0);
  assert.equal(audit.safetyInfluence,0);
});
