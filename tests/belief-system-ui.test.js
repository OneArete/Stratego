import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
test('Understanding exposes explicit person-controlled beliefs',()=>{assert.match(app,/BELIEF SYSTEM/);assert.match(app,/This fits me/);assert.match(app,/This is misleading/);assert.match(app,/Automatic Human Model, judgement and Practice-selection influence: 0/)});
