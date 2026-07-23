import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('Understanding Audit exposes adaptation accountability',()=>{
  assert.ok(app.includes('ADAPTATION ACCOUNTABILITY'));
  assert.match(app,/data-understanding-group="audit"/);
});

test('audit shows event chronology through progressive disclosure',()=>{
  assert.ok(app.includes('class="adaptation-audit-item'));
  assert.ok(app.includes('item.events.map'));
  assert.ok(app.includes('<ol>'));
});

test('audit states zero judgement influence',()=>{
  assert.ok(app.includes('Judgement influence: none'));
});

test('audit remains visually restrained',()=>{
  assert.match(css,/\.adaptation-audit-item/);
  assert.match(css,/background:rgba\(255,255,255,.012\)/);
});
