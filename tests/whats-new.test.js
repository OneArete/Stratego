import test from 'node:test';
import assert from 'node:assert/strict';
import { WHATS_NEW_ENTRIES, pendingWhatsNewEntry, CURRENT_APP_VERSION } from '../src/core/whats-new.js';

// Root cause: Pedro shipped v0.60.0 and v0.61.0 and reported he could not
// perceive that anything had changed. These tests pin the mechanism that
// gives the app a voice for its own release notes — shown once, per version.

test('the latest entry is exported and matches CURRENT_APP_VERSION',()=>{
  assert.ok(WHATS_NEW_ENTRIES.length>0);
  assert.equal(CURRENT_APP_VERSION,WHATS_NEW_ENTRIES[0].version);
});

test('every entry has a headline and at least one point',()=>{
  for(const entry of WHATS_NEW_ENTRIES){
    assert.ok(entry.version);
    assert.ok(entry.headline&&entry.headline.length>0);
    assert.ok(Array.isArray(entry.points)&&entry.points.length>0);
  }
});

test('pendingWhatsNewEntry returns the latest entry when the seen version differs',()=>{
  const pending=pendingWhatsNewEntry('0.1.0');
  assert.ok(pending);
  assert.equal(pending.version,WHATS_NEW_ENTRIES[0].version);
});

test('pendingWhatsNewEntry returns null once the person has seen the current version',()=>{
  const pending=pendingWhatsNewEntry(WHATS_NEW_ENTRIES[0].version);
  assert.equal(pending,null);
});

test('pendingWhatsNewEntry returns null for a never-used person only if explicitly marked seen — null/undefined seenVersion means never seen, so it is pending',()=>{
  assert.ok(pendingWhatsNewEntry(null));
  assert.ok(pendingWhatsNewEntry(undefined));
});

test('only the single latest entry is ever surfaced, never a cumulative backlog',()=>{
  const pending=pendingWhatsNewEntry('0.1.0');
  assert.equal(Array.isArray(pending),false,'a single entry object, not an array of every skipped version');
});
