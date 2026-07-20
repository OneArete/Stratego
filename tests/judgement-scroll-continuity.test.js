import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('judgement rerender can preserve scroll and focus a new block',()=>{
  assert.ok(app.includes('function rerenderJudgementAt(selector)'));
  assert.match(app,/preserveScroll:true/);
  assert.match(app,/scrollIntoView\(\{behavior:'smooth',block:'center'\}\)/);
});

test('accepting a judgement reveals commitment without returning to the top',()=>{
  assert.match(app,/rerenderJudgementAt\('#commitment-panel'\)/);
  assert.ok(app.includes('id="commitment-panel"'));
});

test('creating a commitment reveals Begin Practice directly',()=>{
  assert.match(app,/rerenderJudgementAt\('#commitment-start'\)/);
  assert.ok(app.includes('id="commitment-start"'));
});

test('commitment targets respect fixed footer and safe areas',()=>{
  assert.match(css,/#commitment-panel/);
  assert.match(css,/scroll-margin-bottom:calc\(112px \+ env\(safe-area-inset-bottom\)\)/);
});
