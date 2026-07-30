import test from 'node:test';
import assert from 'node:assert/strict';
import { detectPlatform, describeInstallGuidance } from '../src/core/install-guidance.js';

// Root cause: fixed-position UI (tabbar, organism) fights with Safari's own
// browser chrome when the app runs as an ordinary tab rather than installed
// standalone (manifest.webmanifest already declares display:standalone).
// These tests pin platform-specific, one-time guidance rather than silently
// leaving the person to discover Add-to-Home-Screen on their own.

test('returns null once the app is already running standalone — no nagging once installed',()=>{
  assert.equal(describeInstallGuidance({isStandalone:true,platform:'ios'}),null);
  assert.equal(describeInstallGuidance({isStandalone:true,platform:'android'}),null);
});

test('iOS guidance explicitly names Share > Add to Home Screen',()=>{
  const guidance=describeInstallGuidance({isStandalone:false,platform:'ios'});
  assert.ok(guidance);
  assert.match(guidance.body,/Share/);
  assert.match(guidance.body,/Add to Home Screen/);
});

test('android guidance names the browser menu install option',()=>{
  const guidance=describeInstallGuidance({isStandalone:false,platform:'android'});
  assert.ok(guidance);
  assert.match(guidance.body,/Add to Home screen|Install app/);
});

test('detectPlatform recognizes iOS, Android, and falls back to other',()=>{
  assert.equal(detectPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'),'ios');
  assert.equal(detectPlatform('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)'),'ios');
  assert.equal(detectPlatform('Mozilla/5.0 (Linux; Android 14)'),'android');
  assert.equal(detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)'),'other');
  assert.equal(detectPlatform(''),'other');
});

test('a non-standalone, non-iOS, non-android platform still gets generic guidance rather than nothing',()=>{
  const guidance=describeInstallGuidance({isStandalone:false,platform:'other'});
  assert.ok(guidance);
  assert.ok(guidance.headline&&guidance.body);
});
