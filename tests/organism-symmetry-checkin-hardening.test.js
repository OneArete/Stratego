import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

test('Today uses a neutral graph until current-day evidence is sufficient',()=>{
  assert.match(app,/gate\.context\.sufficient\?buildHumanGraph\(state\.history,gate\.context\.signals\):buildHumanGraph\(\[\],null\)/);
});

test('check-in action has direct click and touch bindings',()=>{
  assert.match(app,/startButton\.addEventListener\('click',openCheckIn/);
  assert.match(app,/startButton\.addEventListener\('touchend',openCheckIn/);
});

test('runtime token is advanced',()=>{
  assert.match(html,/0476p1/);
});
