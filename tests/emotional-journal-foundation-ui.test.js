import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

test('Journey exposes optional emotional journal',()=>{
  assert.ok(app.includes('EMOTIONAL JOURNAL'));
  assert.ok(app.includes('Write today’s reflection'));
  assert.ok(app.includes('Entirely optional'));
});

test('editor is free text without scoring',()=>{
  assert.ok(app.includes('id="emotional-journal-text"'));
  assert.ok(app.includes('Write freely'));
  assert.ok(app.includes('No score. No diagnosis.'));
  assert.doesNotMatch(app,/data-emotional-score/);
});

test('entries can be saved, edited and deleted',()=>{
  const handler=app.slice(app.indexOf('if(t.dataset.emotionalJournalAction)'),app.indexOf('if(t.dataset.explainReviewAction)'));
  assert.match(handler,/createEmotionalJournalEntry/);
  assert.match(handler,/updateEmotionalJournalEntry/);
  assert.match(handler,/deleteEmotionalJournalEntry/);
  assert.match(handler,/persist\(\)/);
});

test('journal remains outside footer',()=>{
  const nav=app.slice(app.indexOf('const nav='),app.indexOf('const ROUTES='));
  assert.doesNotMatch(nav,/Emotional Journal/);
  for(const label of ['Today','Understanding','Journey','Settings'])assert.ok(nav.includes(label));
});

test('runtime imports use Phase 1 token',()=>{
  for(const specifier of [...app.matchAll(/from ['"]([^'"]+\.js(?:\?v=[^'"]+)?)['"]/g)].map(match=>match[1]))assert.match(specifier,/\?v=0390p1$/);
});
