import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
test('splash begin uses resolver',()=>assert.match(app,/if\(a==='begin'\)\{const destination=resolveStartupDestination\(state\)/));
test('Today has resume action',()=>{assert.ok(app.includes('data-action="continue-flow"'));assert.ok(app.includes('class="continuity-card"'))});
test('continue uses same resolver',()=>assert.match(app,/if\(a==='continue-flow'\)\{const destination=resolveStartupDestination\(state\)/));
test('begin no longer checks only isResumable',()=>{const x=app.slice(app.indexOf("if(a==='begin')"),app.indexOf("if(a==='onboarding-next')"));assert.doesNotMatch(x,/isResumable/)});
