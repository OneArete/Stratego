import test from 'node:test';
import assert from 'node:assert/strict';
import {journeyRecords} from '../src/core/longitudinal-integrity.js';

test('journey record carries adaptation accountability from linked history',()=>{
  const state={
    judgements:[{id:'j1',status:'reviewed',createdAt:'2026-07-20T10:00:00Z',practice:{name:'Recovery'}}],
    history:[{
      judgementId:'j1',
      completed:true,
      adaptationAccountability:{
        choiceCount:1,
        choices:[{phaseName:'Main',level:'regression',source:'confirmed-pattern'}]
      }
    }]
  };
  const record=journeyRecords(state)[0];
  assert.equal(record.adaptationAccountability.choiceCount,1);
  assert.equal(record.completionRatio,1);
});

test('journey record carries person choice provenance',()=>{
  const state={
    judgements:[{id:'j1',status:'reviewed',createdAt:'2026-07-20T10:00:00Z',practice:{name:'Connection'}}],
    history:[{
      judgementId:'j1',
      decision:{personChoice:{action:'choose-alternative',reason:'Needed connection.'}}
    }]
  };
  assert.equal(journeyRecords(state)[0].personChoice.action,'choose-alternative');
});

test('recovered judgement without history remains safe',()=>{
  const state={
    judgements:[{id:'j1',status:'reviewed',createdAt:'2026-07-20T10:00:00Z',practice:{name:'Recovery'}}],
    history:[]
  };
  const record=journeyRecords(state)[0];
  assert.equal(record.adaptationAccountability,null);
  assert.equal(record.historyLinked,false);
});
