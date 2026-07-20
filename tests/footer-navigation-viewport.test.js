import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('footer keeps all four primary destinations',()=>{
  for(const label of ['Today','Understanding','Journey','Settings']){
    assert.ok(app.includes(`'${label}'`));
  }
});

test('footer no longer uses transform centring',()=>{
  const hotfix=css.slice(css.lastIndexOf('/* v0.14.1'));
  assert.match(hotfix,/transform:none/);
  assert.doesNotMatch(hotfix,/translateX/);
});

test('footer is pinned by both viewport edges',()=>{
  const hotfix=css.slice(css.lastIndexOf('/* v0.14.1'));
  assert.match(hotfix,/left:max\(8px,env\(safe-area-inset-left\)\)/);
  assert.match(hotfix,/right:max\(8px,env\(safe-area-inset-right\)\)/);
});

test('footer columns cannot collapse below zero width',()=>{
  const hotfix=css.slice(css.lastIndexOf('/* v0.14.1'));
  assert.match(hotfix,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(hotfix,/min-width:0/);
});

test('narrow screens remove max width and preserve all destinations',()=>{
  const hotfix=css.slice(css.lastIndexOf('/* v0.14.1'));
  assert.match(hotfix,/@media\(max-width:390px\)/);
  assert.match(hotfix,/max-width:none/);
});
