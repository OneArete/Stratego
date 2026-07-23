import test from 'node:test';
import assert from 'node:assert/strict';
import {DAILY_SIGNAL_DEFAULTS,localDayKey,normaliseDailySignals,todaySignals,upsertDailyCheckIn,dailyCheckInSummary} from '../src/core/daily-signals.js?v=0390p1';

test('daily signals use safe defaults and strict values',()=>{
  assert.deepEqual(todaySignals([],new Date('2026-07-23T08:00:00')),DAILY_SIGNAL_DEFAULTS);
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
