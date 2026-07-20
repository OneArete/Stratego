import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

test('primary navigation remains composed of four destinations',()=>{
  assert.match(app,/\['today','◉','Today'\]/);
  assert.match(app,/\['understanding','◇','Understanding'\]/);
  assert.match(app,/\['journey','↗','Journey'\]/);
  assert.match(app,/\['settings','••','Settings'\]/);
});

test('footer is attached to both viewport edges',()=>{
  assert.ok(css.includes('left:0 !important;'));
  assert.ok(css.includes('right:0 !important;'));
  assert.ok(css.includes('width:100% !important;'));
});

test('footer has no transform, max-width or auto margin',()=>{
  assert.ok(css.includes('transform:none !important;'));
  assert.ok(css.includes('max-width:none !important;'));
  assert.ok(css.includes('margin:0 !important;'));
});

test('footer always uses four equal grid columns',()=>{
  assert.ok(css.includes('grid-template-columns:repeat(4,minmax(0,1fr)) !important;'));
});

test('all four footer children are forced visible',()=>{
  for(const index of [1,2,3,4]){
    assert.ok(css.includes(`.tabbar button:nth-child(${index})`));
  }
  assert.ok(css.includes('visibility:visible !important;'));
  assert.ok(css.includes('opacity:1 !important;'));
});

test('footer respects left and right safe areas through internal padding',()=>{
  assert.ok(css.includes('max(8px,env(safe-area-inset-right))'));
  assert.ok(css.includes('max(8px,env(safe-area-inset-left))'));
});

test('footer sits above application content and mobile browser compositing',()=>{
  assert.ok(css.includes('z-index:2147483000'));
  assert.ok(css.includes('position:fixed !important;'));
});

test('mobile override cannot reintroduce clipping geometry',()=>{
  assert.match(css,/@media\(max-width:390px\)[\s\S]*?left:0 !important;[\s\S]*?right:0 !important;[\s\S]*?width:100% !important;/);
});
