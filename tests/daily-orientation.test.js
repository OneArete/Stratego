import test from 'node:test';
import assert from 'node:assert/strict';
import {buildDailyOrientation,recentCheckInTrajectory} from '../src/core/daily-orientation.js?v=0390p1';

test('orientation protects capacity under strong constraints',()=>{
 const o=buildDailyOrientation({sleep:1,energy:1,time:15,challenge:'recovery',soreness:'significant',emotionalLoad:'heavy'});
 assert.equal(o.posture,'protect');
 assert.equal(o.automaticDecisionInfluence,0);
 assert.match(o.constraintText,/poor sleep/);
});

test('orientation can recognise room to advance without recommending',()=>{
 const o=buildDailyOrientation({sleep:4,energy:3,time:30,challenge:'body',soreness:'none',emotionalLoad:'usual'});
 assert.equal(o.posture,'advance');
 assert.match(o.nextStep,/Agora/);
});

test('recent check-in trajectory is descriptive',()=>{
 const t=recentCheckInTrajectory([{day:'2026-07-23',signals:{sleep:4,energy:3,time:15,challenge:'body',soreness:'none',emotionalLoad:'usual'}},{day:'2026-07-22',signals:{sleep:2,energy:1,time:5,challenge:'recovery',soreness:'mild',emotionalLoad:'heavy'}}]);
 assert.equal(t.days,2);
 assert.equal(t.averageSleep,3);
});
