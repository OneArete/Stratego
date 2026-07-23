import test from 'node:test';
import assert from 'node:assert/strict';
import {createWeeklyIntention,upsertWeeklyIntention,weeklyIntentionForWeek,clearWeeklyIntention} from '../src/core/weekly-intention.js?v=0390p1';

test('creates only explicit valid weekly intentions',()=>{
  assert.equal(createWeeklyIntention({weekId:'w',choice:'custom',note:''}),null);
  const item=createWeeklyIntention({weekId:'w',choice:'recovery',note:'Keep evenings lighter',now:new Date('2026-07-23T10:00:00Z')});
  assert.equal(item.label,'Protect recovery');
  assert.equal(item.judgementInfluence,0);
  assert.equal(item.humanModelInfluence,0);
});

test('keeps one intention per week and allows removal',()=>{
  const first=createWeeklyIntention({weekId:'w',choice:'focus'});
  const second=createWeeklyIntention({weekId:'w',choice:'consistency'});
  const items=upsertWeeklyIntention(upsertWeeklyIntention([],first),second);
  assert.equal(items.length,1);
  assert.equal(weeklyIntentionForWeek(items,'w').choice,'consistency');
  assert.deepEqual(clearWeeklyIntention(items,'w'),[]);
});
