import test from 'node:test';
import assert from 'node:assert/strict';
import {buildExplainRecord,applyExplainRecordReview,explainRecordReviewAudit,explainRecordReviewSummary} from '../src/core/explain.js?v=0390p1';
const decision={id:'j1',judgement:'Recovery.',confidence:74,practice:{id:'recovery',name:'Recovery'},advisors:[{advisor:'Recovery',position:'Support',reason:'Energy is limited.',scores:{recovery:10}}],understanding:{summary:'Recovery demand is elevated.'},unknowns:[]};
test('confirm explanation',()=>{const r=applyExplainRecordReview(buildExplainRecord(decision,{context:{}}),{action:'confirm'});assert.equal(r.review.status,'confirmed')});
test('reject with correction',()=>{const r=applyExplainRecordReview(buildExplainRecord(decision,{context:{}}),{action:'reject',note:'Missing context'});assert.equal(r.review.note,'Missing context')});
test('reopen preserves canonical record',()=>{const base=buildExplainRecord(decision,{context:{}});const r=applyExplainRecordReview(applyExplainRecordReview(base,{action:'reject'}),{action:'reopen'});assert.equal(r.review,undefined);assert.deepEqual(r.observations,base.observations)});
test('review has zero influence',()=>{const a=explainRecordReviewAudit(applyExplainRecordReview(buildExplainRecord(decision,{context:{}}),{action:'reject'}));assert.equal(a.judgementInfluence,0);assert.equal(a.rankingInfluence,0);assert.equal(a.confidenceInfluence,0);assert.equal(a.safetyInfluence,0)});
test('summary readable',()=>{assert.match(explainRecordReviewSummary(applyExplainRecordReview(buildExplainRecord(decision,{context:{}}),{action:'confirm'})),/Confirmed/)});
