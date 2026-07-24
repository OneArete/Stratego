import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
test('daily orientation remains available outside the simplified Today surface',()=>{
 assert.match(app,/RECENT DAILY RHYTHM/);
 assert.doesNotMatch(app,/function today\(\)[\s\S]{0,500}TODAY'S ORIENTATION/);
});
