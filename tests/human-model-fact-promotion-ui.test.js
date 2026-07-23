import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
test('Understanding exposes stable fact candidates',()=>{assert.ok(app.includes('HUMAN MODEL FACT CANDIDATES'));assert.ok(app.includes('Promote to stable fact'));assert.ok(app.includes('Keep as observations'))});
test('person actions apply explicit promotion governance',()=>{const s=app.indexOf('if(t.dataset.humanModelPromotionAction)'),e=app.indexOf('if(t.dataset.humanModelAction)',s),h=app.slice(s,e);assert.match(h,/applyHumanModelFactPromotion/);assert.match(h,/persist\(\)/)});
test('promotion audit is visible',()=>{assert.ok(app.includes('HUMAN MODEL FACT PROMOTION AUDIT'));assert.ok(app.includes('3 confirmed observations'))});
test('load reconciliation protects promotion integrity',()=>{const r=app.slice(app.indexOf('function reconcileLoadedState'),app.indexOf('let state='));assert.match(r,/reconcileHumanModelFactPromotions/)});
test('promotion remains non-influential in the UI',()=>{assert.ok(app.includes('Judgement influence: 0 · Practice selection influence: 0 · Safety influence: 0'))});
