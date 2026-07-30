import test from 'node:test';
import assert from 'node:assert/strict';
import {DAILY_SIGNAL_DEFAULTS,localDayKey,normaliseDailySignals,todaySignals,upsertDailyCheckIn,dailyCheckInSummary,mostRecentCompleteCheckIn} from '../src/core/daily-signals.js?v=0476p1';

test('daily signals use safe defaults and strict values',()=>{
  assert.deepEqual(todaySignals([],new Date('2026-07-23T08:00:00')),{});
  assert.equal(normaliseDailySignals({sleep:9}).sleep,3);
});

test('one editable check-in is kept per local day',()=>{
  const first=upsertDailyCheckIn([],{sleep:2,energy:1,time:5,challenge:'recovery',soreness:'mild',emotionalLoad:'heavy'},{now:new Date('2026-07-23T08:00:00')});
  const second=upsertDailyCheckIn(first,{...first[0].signals,energy:2},{now:new Date('2026-07-23T09:00:00')});
  assert.equal(second.length,1);
  assert.equal(second[0].signals.energy,2);
  assert.equal(second[0].day,localDayKey(new Date('2026-07-23T09:00:00')));
  assert.match(dailyCheckInSummary(second[0]),/Energy 2\/3/);
});

// --- v0.60.0 — check-in friction reduction: repeat the most recent complete day ---

test('mostRecentCompleteCheckIn returns null when no other complete day exists',()=>{
  assert.equal(mostRecentCompleteCheckIn([],'2026-07-30'),null);
  const onlyToday=upsertDailyCheckIn([],{sleep:3,energy:2,time:15,challenge:'body',soreness:'none',emotionalLoad:'usual'},{now:new Date('2026-07-30T08:00:00')});
  assert.equal(mostRecentCompleteCheckIn(onlyToday,'2026-07-30'),null);
});

test('mostRecentCompleteCheckIn finds the most recent day other than the excluded one',()=>{
  let checkIns=upsertDailyCheckIn([],{sleep:2,energy:1,time:5,challenge:'recovery',soreness:'mild',emotionalLoad:'heavy'},{now:new Date('2026-07-28T08:00:00')});
  checkIns=upsertDailyCheckIn(checkIns,{sleep:4,energy:3,time:30,challenge:'body',soreness:'none',emotionalLoad:'light'},{now:new Date('2026-07-29T08:00:00')});
  const previous=mostRecentCompleteCheckIn(checkIns,'2026-07-30');
  assert.equal(previous.day,'2026-07-29');
  assert.equal(previous.signals.sleep,4);
});

test('mostRecentCompleteCheckIn ignores entries with no recorded signals',()=>{
  const checkIns=[{day:'2026-07-29',signals:null},{day:'2026-07-28',signals:{sleep:3,energy:2,time:15,challenge:'body',soreness:'none',emotionalLoad:'usual'}}];
  const previous=mostRecentCompleteCheckIn(checkIns,'2026-07-30');
  assert.equal(previous.day,'2026-07-28');
});
