import test from 'node:test';
import assert from 'node:assert/strict';
import {createEmotionalJournalEntry,setEmotionalJournalThemes,toggleEmotionalJournalTheme,emotionalJournalEvolution,EMOTIONAL_JOURNAL_THEMES} from '../src/core/emotional-journal.js?v=0390p1';
test('canonical themes only',()=>{const e=createEmotionalJournalEntry({text:'x'});assert.deepEqual(setEmotionalJournalThemes(e,['gratitude','invented']).themes,['gratitude'])});
test('toggle preserves text',()=>{const e=createEmotionalJournalEntry({text:'x'});const u=toggleEmotionalJournalTheme(e,'gratitude');assert.equal(u.text,'x');assert.deepEqual(u.themes,['gratitude'])});
test('evolution counts explicit themes',()=>{const a=setEmotionalJournalThemes(createEmotionalJournalEntry({text:'a'}),['gratitude']);const b=setEmotionalJournalThemes(createEmotionalJournalEntry({text:'b'}),['gratitude','relationships']);const x=emotionalJournalEvolution([a,b]);assert.equal(x.counts.gratitude,2);assert.equal(x.counts.relationships,1)});
test('zero influence',()=>{const x=emotionalJournalEvolution([]);assert.equal(x.judgementInfluence,0);assert.equal(x.humanModelInfluence,0);assert.equal(x.safetyInfluence,0)});
test('restrained theme set',()=>assert.equal(EMOTIONAL_JOURNAL_THEMES.length,8));
