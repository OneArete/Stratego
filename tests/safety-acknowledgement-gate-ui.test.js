import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
test('constrained envelope exposes acknowledgement',()=>{assert.ok(app.includes('I understand this safety boundary'));assert.ok(app.includes('Acknowledgement required'))});
test('Practice start is gated',()=>{const handler=app.slice(app.indexOf("if(a==='commit')"),app.indexOf("if(a==='pause')"));assert.match(handler,/safetyStartGate/);assert.match(handler,/!activeSafetyGate\.canStart/)});
test('acknowledgement is stored without native prompt',()=>{const start=app.indexOf("if(t.dataset.safetyAction==='acknowledge')");const end=app.indexOf("if(t.dataset.humanModelPromotionAction)",start);const handler=app.slice(start,end);assert.match(handler,/createSafetyAcknowledgement/);assert.doesNotMatch(handler,/prompt\(/)});
test('Journey preserves acknowledgement provenance',()=>assert.ok(app.includes('Acknowledged by the person at')));
test('all runtime imports use Phase 2 token',()=>{for(const specifier of [...app.matchAll(/from ['\"]([^'\"]+\.js(?:\?v=[^'\"]+)?)['\"]/g)].map(match=>match[1]))assert.match(specifier,/\?v=0390p1$/)});
