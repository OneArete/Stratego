import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
test('Today and Journey expose daily orientation continuity',()=>{
 assert.match(app,/TODAY'S ORIENTATION/);
 assert.match(app,/RECENT DAILY RHYTHM/);
 assert.match(app,/Automatic decision influence: 0/);
});
