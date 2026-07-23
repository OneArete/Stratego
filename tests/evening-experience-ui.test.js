import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');
test('one-minute evening closure is present',()=>{
  assert.match(app,/What mattered today\?/);
  assert.match(app,/Close without writing/);
  assert.match(app,/save-evening-reflection/);
  assert.match(css,/evening-reflection-screen/);
});
