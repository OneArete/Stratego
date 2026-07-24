import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');
const adr=fs.readFileSync(new URL('../architecture/ADR-011-invisible-organism-phase-1.md',import.meta.url),'utf8');

test('Today renders a current moment with one optional action',()=>{
  assert.match(app,/class="current-moment/);
  assert.match(app,/class="moment-action"/);
  assert.doesNotMatch(app,/companion-date/);
});

test('check-in renders Living Graph organism and no visible progress bar',()=>{
  // v0.49.0: seed dots replaced by the actual Living Graph (organism communicates first)
  assert.match(app,/class="seed-checkin/);
  assert.match(app,/buildCheckinGraph\(context\)/,'Living Graph drives check-in organism');
  assert.doesNotMatch(app,/context-seed/,'seed dots removed — Living Graph replaces them');
  assert.match(app,/Nothing is inferred from silence/);
});

test('organism experience has dedicated breathing and deliberation motion',()=>{
  assert.match(css,/@keyframes organism-float/);
  assert.match(css,/@keyframes aura-breathe/);
  assert.match(css,/@keyframes deliberate-organism/);
});

test('constitutional constraints are documented',()=>{
  assert.match(adr,/One primary action on Today/);
  assert.match(adr,/No recommendation before the Evidence Gate/);
  assert.match(adr,/closed day has no call to action/);
});
