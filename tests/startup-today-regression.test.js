import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveStartupDestination} from '../src/core/startup-continuity.js';

test('existing recommendation never opens before Today on app start',()=>{
  const state={
    profile:{name:'Pedro'},
    onboardingVersion:1,
    current:{
      decision:{id:'j1',practice:{id:'recovery'}},
      startedAt:null
    }
  };

  assert.deepEqual(resolveStartupDestination(state),{
    route:'today',
    reason:'returning-person',
    resumable:true
  });
});
