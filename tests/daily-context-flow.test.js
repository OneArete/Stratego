import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');
test('Today routes context capture into a dedicated flow',()=>{assert.match(app,/function checkin\(\)/);assert.match(app,/morning-context'\)return route\('checkin'\)/)});
test('daily context completes automatically after explicit evidence',()=>{assert.match(app,/if\(dailyContextComplete\(\)\)/);assert.match(app,/Today is understood\./);assert.doesNotMatch(app,/data-action=\"save-daily-context\">Use this context/)});
test('completion is visible and reachable above the footer',()=>{assert.match(css,/\.checkin-ready\{/);assert.match(css,/min-height:54dvh/)});
