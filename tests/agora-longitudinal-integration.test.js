import test from 'node:test';
import assert from 'node:assert/strict';
import {conveneAgora} from '../src/core/agora.js';
const c={sleep:3,energy:2,time:15,challenge:'body',soreness:'none',emotionalLoad:'usual'};
const u={confidence:50,unknowns:[],contradictions:[],summary:'Current.'};
test('valid evidence stored',()=>{const e={items:[{patternId:'p',practiceId:'walk',direction:'support',adjustment:.1,sourceContextKey:'a',targetContextKey:'a'}],scoreAdjustments:{walk:.1}};const r=conveneAgora(c,u,[],{},e);assert.equal(r.longitudinalVerification.valid,true)});
test('invalid evidence rejected',()=>{const e={items:[{patternId:'p',practiceId:'walk',direction:'support',adjustment:.5,sourceContextKey:'a',targetContextKey:'a'}],scoreAdjustments:{walk:.5}};const r=conveneAgora(c,u,[],{},e);assert.equal(r.longitudinalEvidence,null)});
