import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const audio=readFileSync(new URL('../src/core/audio.js',import.meta.url),'utf8');

test('countdown starts at five seconds',()=>{
  assert.match(app,/secondsLeft<=5/);
  assert.match(app,/Five seconds remaining/);
});

test('countdown pitch changes with remaining seconds',()=>{
  assert.match(audio,/options\.remaining/);
  assert.match(audio,/kind==='countdown'\?0\.085/);
});

test('haptics are capability-aware',()=>{
  assert.match(app,/supportsHaptics/);
  assert.match(app,/Physical haptics are not supported/);
  assert.match(app,/navigator\.vibrate\(\[18,35,18\]\)/);
});

test('wake lock is reacquired only for an active visible Practice',()=>{
  assert.match(app,/state\.current\?\.execution\?\.status===EXECUTION_STATUS\.ACTIVE/);
  assert.match(app,/document\.visibilityState==='visible'/);
});

test('turning Keep screen awake off releases an existing lock',()=>{
  assert.match(app,/else if\(!state\.settings\.keepAwake\)releaseWakeLock\(\)/);
});

test('unsupported controls are disabled instead of pretending to work',()=>{
  assert.match(app,/disabled aria-disabled=\"true\"/);
  assert.match(app,/Unavailable in this browser/);
});
