import test from 'node:test';
import assert from 'node:assert/strict';
import {createEmotionalJournalEntry,applyEmotionalJournalFollowUp,reopenEmotionalJournalFollowUp,emotionalJournalFollowUpAudit,EMOTIONAL_JOURNAL_FOLLOW_UPS} from '../src/core/emotional-journal.js?v=0390p1';
test('still present',()=>{const e=applyEmotionalJournalFollowUp(createEmotionalJournalEntry({text:'x'}),{outcome:'still-present'});assert.equal(e.followUp.outcome,'still-present');assert.equal(e.followUp.source,'person')});
test('all outcomes',()=>{for(const o of ['changed','resolved','uncertain'])assert.equal(applyEmotionalJournalFollowUp(createEmotionalJournalEntry({text:'x'}),{outcome:o}).followUp.outcome,o)});
test('invalid ignored',()=>assert.equal(applyEmotionalJournalFollowUp(createEmotionalJournalEntry({text:'x'}),{outcome:'diagnosed'}).followUp,undefined));
test('reopen preserves entry',()=>{const base=createEmotionalJournalEntry({text:'x'});const r=reopenEmotionalJournalFollowUp(applyEmotionalJournalFollowUp(base,{outcome:'resolved'}));assert.equal(r.followUp,undefined);assert.equal(r.text,'x')});
test('audit explicit only',()=>{const a=applyEmotionalJournalFollowUp(createEmotionalJournalEntry({text:'a'}),{outcome:'resolved'});const b=createEmotionalJournalEntry({text:'b'});const x=emotionalJournalFollowUpAudit([a,b]);assert.equal(x.reviewed,1);assert.equal(x.awaiting,1);assert.equal(x.counts.resolved,1)});
test('zero influence',()=>{const x=emotionalJournalFollowUpAudit([]);assert.equal(x.judgementInfluence,0);assert.equal(x.humanModelInfluence,0);assert.equal(x.safetyInfluence,0);assert.equal(EMOTIONAL_JOURNAL_FOLLOW_UPS.length,4)});
