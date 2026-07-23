import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWeeklyReview,preserveWeeklyReview,weeklyReviewForWindow } from '../src/core/weekly-review.js';

test('weekly review remains unavailable before three recorded days',()=>{
  const review=buildWeeklyReview({dailyCheckIns:[{day:'2026-07-22',signals:{challenge:'Recovery'}}]},new Date('2026-07-23T12:00:00'));
  assert.equal(review.ready,false);
});

test('weekly review describes and preserves a seven-day snapshot',()=>{
  const state={
    dailyCheckIns:[
      {day:'2026-07-21',signals:{challenge:'Recovery'}},
      {day:'2026-07-22',signals:{challenge:'Recovery'}},
      {day:'2026-07-23',signals:{challenge:'Strength'}}
    ],
    dailyStories:[
      {id:'a',day:'2026-07-21',stage:'complete',eveningClosed:true},
      {id:'b',day:'2026-07-22',stage:'reflection'},
      {id:'c',day:'2026-07-23',stage:'complete',eveningClosed:true}
    ],
    history:[
      {createdAt:'2026-07-21T18:00:00',completedAt:'2026-07-21T18:15:00',decision:{practice:{name:'Practice A'}}},
      {createdAt:'2026-07-22T18:00:00',completedAt:'2026-07-22T18:15:00',decision:{practice:{name:'Practice B'}}},
      {createdAt:'2026-07-23T18:00:00',completedAt:'2026-07-23T18:15:00',decision:{practice:{name:'Practice C'}}}
    ],
    outcomeLedger:[{recordedAt:'2026-07-22T18:00:00Z',result:'helped'}]
  };
  const review=buildWeeklyReview(state,new Date('2026-07-23T12:00:00'));
  assert.equal(review.ready,true);
  assert.equal(review.recordedDays,3);
  assert.equal(review.completedDays,2);
  assert.equal(review.dominantPriority,'Recovery');
  const reviews=preserveWeeklyReview([],review,new Date('2026-07-23T19:00:00Z'));
  assert.equal(weeklyReviewForWindow(reviews,review.id)?.status,'preserved');
});
