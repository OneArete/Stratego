import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('v0.60.0: check-in offers a one-tap repeat of the most recent complete day, only on the first question',()=>{
  assert.match(app,/mostRecentCompleteCheckIn\(state\.dailyCheckIns,localDayKey\(\)\)/);
  assert.match(app,/isFreshStart=nextKey===['"]sleep['"]/,'the repeat offer is only computed when starting a fresh check-in, not mid-sequence');
  assert.match(app,/data-action="repeat-previous-checkin"/);
});

test('the repeat action copies the previous day\'s normalised signals rather than trusting raw stored values',()=>{
  assert.match(app,/commitRepeatedCheckIn\(previousSignals\)/);
  assert.match(app,/context=\{\.\.\.context,\.\.\.normaliseDailySignals\(previousSignals\)\}/);
});

test('the repeat action is a real, explicit person choice — recorded with its own distinct source, not merged into ordinary check-in provenance',()=>{
  assert.match(app,/source:['"]repeated-previous['"]/);
});

test('choosing to repeat with no previous day available fails safely back to the check-in flow, not a crash',()=>{
  assert.match(app,/if\(!previous\)\{announceStatus\('No previous check-in is available to repeat\.'\);return route\('checkin'/);
});

test('the repeat button is styled distinctly, not disguised as a normal choice pill',()=>{
  assert.match(css,/\.checkin-repeat-previous\{/);
});
