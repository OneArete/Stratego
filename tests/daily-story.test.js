import test from 'node:test';
import assert from 'node:assert/strict';
import {upsertDailyStory,deriveDailyStory,dailyStoryTimeline,dailyStorySummary} from '../src/core/daily-story.js';

test('daily story advances through an explicit day lifecycle',()=>{
 const now=new Date('2026-07-23T09:00:00');
 let stories=upsertDailyStory([],{stage:'check-in',signals:{sleep:3,energy:2,time:15,challenge:'body',soreness:'none',emotionalLoad:'usual'}},now);
 const story=deriveDailyStory({stories,checkIns:[{day:'2026-07-23',signals:stories[0].signals}],judgements:[],history:[],journalEntries:[]},now);
 assert.equal(story.stage,'check-in');
 assert.equal(dailyStorySummary(story),'Context recorded');
});

test('timeline groups existing records by human day',()=>{
 const state={dailyStories:[],dailyCheckIns:[{day:'2026-07-22',signals:{sleep:4,energy:3,time:30,challenge:'body',soreness:'none',emotionalLoad:'light'}}],judgements:[],history:[],emotionalJournalEntries:[]};
 const rows=dailyStoryTimeline(state);
 assert.equal(rows.length,1);assert.equal(rows[0].day,'2026-07-22');
});
