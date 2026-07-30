import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { computeCheckInStreak, describeStreak } from '../src/core/streak.js';

const app = fs.readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

const dayKey = date => date.toISOString().slice(0, 10);
const daysAgo = (n, from = new Date('2026-07-30T12:00:00')) => {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return d;
};

test('no check-ins produces a zero streak that includes today as false',()=>{
  const streak = computeCheckInStreak([], new Date('2026-07-30T12:00:00'));
  assert.equal(streak.count,0);
  assert.equal(streak.includesToday,false);
});

test('a single day (today only) is a streak of 1, not shown as a streak',()=>{
  const streak = computeCheckInStreak([{day:'2026-07-30'}], new Date('2026-07-30T12:00:00'));
  assert.equal(streak.count,1);
  assert.equal(describeStreak(streak),null,'a 1-day streak should not be presented — it is just today');
});

test('consecutive days including today count correctly and produce a label at 2+',()=>{
  const checkIns=[{day:'2026-07-30'},{day:'2026-07-29'},{day:'2026-07-28'}];
  const streak=computeCheckInStreak(checkIns,new Date('2026-07-30T12:00:00'));
  assert.equal(streak.count,3);
  assert.equal(streak.includesToday,true);
  assert.equal(describeStreak(streak),'3-day streak');
});

test('a streak still counts if today has not been checked in yet, anchored to yesterday',()=>{
  const checkIns=[{day:'2026-07-29'},{day:'2026-07-28'}];
  const streak=computeCheckInStreak(checkIns,new Date('2026-07-30T12:00:00'));
  assert.equal(streak.count,2);
  assert.equal(streak.includesToday,false);
});

test('a gap breaks the streak — only the unbroken run counting back from today/yesterday is counted',()=>{
  const checkIns=[{day:'2026-07-30'},{day:'2026-07-29'},{day:'2026-07-27'},{day:'2026-07-26'}];
  const streak=computeCheckInStreak(checkIns,new Date('2026-07-30T12:00:00'));
  assert.equal(streak.count,2,'2026-07-28 is missing, so the run before it must not be counted');
});

test('entries without a day field are ignored rather than counted as a phantom day',()=>{
  const checkIns=[{day:'2026-07-30'},{day:null},{}];
  const streak=computeCheckInStreak(checkIns,new Date('2026-07-30T12:00:00'));
  assert.equal(streak.count,1);
});

test('v0.60.0: Today renders the streak badge, derived from state.dailyCheckIns, inside the organism field',()=>{
  assert.match(app,/computeCheckInStreak\(state\.dailyCheckIns\)/);
  assert.match(app,/class="continuity-streak"/);
  assert.match(app,/organism-field\$\{model\.settled\?' settling':''\}">\$\{streakBadge\}/,'the badge renders inside organism-field so it never disturbs the current-moment grid');
});

test('the streak badge is styled as a small overlay, not a competing headline',()=>{
  assert.match(css,/\.continuity-streak\{/);
  assert.match(css,/position:absolute/);
});
