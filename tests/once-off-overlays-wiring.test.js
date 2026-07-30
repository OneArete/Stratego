import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');

// v0.62.0 — pins that the What's New card and install-guidance banner are
// wired into today(), gated correctly, and rendered OUTSIDE .current-moment
// so ADR-011's "organism + one sentence + one action" constraint (guarded by
// current-moment-ui.test.js / invisible-organism-phase-1.test.js) is untouched.

test('today() renders the once-off overlays after shell()',()=>{
  assert.match(app,/function renderOnceOffOverlays\(\)/);
  assert.match(app,/shell\(`\$\{nav\('today'\)\}`\);[\s\S]{0,600}renderOnceOffOverlays\(\)/);
});

test('What\'s New overlay is gated on pendingWhatsNewEntry and dismissal persists lastSeenVersion',()=>{
  assert.match(app,/pendingWhatsNewEntry\(state\.lastSeenVersion\)/);
  assert.match(app,/class="whats-new-overlay"/);
  assert.match(app,/state\.lastSeenVersion=pendingEntry\.version/);
  assert.match(app,/persist\(\);\s*app\.querySelector\('\.whats-new-overlay'\)\?\.remove\(\)/);
});

test('install guidance is only considered when no What\'s New card is pending, and only when not already dismissed',()=>{
  assert.match(app,/if\(state\.installGuidanceDismissed\)return;/);
  assert.match(app,/describeInstallGuidance\(\{isStandalone,platform:detectPlatform\(navigator\.userAgent\|\|''\)\}\)/);
  assert.match(app,/state\.installGuidanceDismissed=true/);
});

test('neither overlay is rendered inside .current-moment — ADR-011 stays intact',()=>{
  const shellCall=app.match(/const shell=\(content,cls=''\)=>[\s\S]{0,260}/)[0];
  assert.doesNotMatch(shellCall,/whats-new-overlay|install-guidance-banner/);
});

test('CSS for both overlays exists and the install banner sits above the tabbar via the shared footer-height variable',()=>{
  assert.match(css,/\.whats-new-overlay\{/);
  assert.match(css,/\.install-guidance-banner\{/);
  assert.match(css,/--strategos-fixed-footer-height,72px\) \+ env\(safe-area-inset-bottom\) \+ 12px\)/);
});

test('state schema carries lastSeenVersion and installGuidanceDismissed with safe defaults',()=>{
  const schema=fs.readFileSync(new URL('../src/core/state-schema.js',import.meta.url),'utf8');
  assert.match(schema,/lastSeenVersion:null/);
  assert.match(schema,/installGuidanceDismissed:false/);
});
