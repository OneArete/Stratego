import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

test('daily check-in choices are handled before optional audio and haptics', () => {
  const handler = source.slice(source.indexOf("app.addEventListener('click'"));
  const choice = handler.indexOf('if(t.dataset.key)');
  const audio = handler.indexOf('unlockAudio()');
  assert.ok(choice >= 0, 'choice handler must exist');
  assert.ok(audio >= 0, 'audio unlock must exist');
  assert.ok(choice < audio, 'choice handling must not depend on audio support');
});

test('daily check-in choice advances by re-rendering check-in', () => {
  assert.match(source, /if\(t\.dataset\.key\)[\s\S]*?return route\('checkin',\{history:'replace'\}\)/);
});
