import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('footer is fixed to viewport bottom',()=>{
  assert.ok(css.includes('.tabbar{\n  position:fixed;'));
  assert.ok(css.includes('bottom:0;'));
  assert.ok(css.includes('z-index:80;'));
});

test('body and app reserve space for fixed footer',()=>{
  assert.ok(css.includes('padding-bottom:calc(var(--footer-height) + env(safe-area-inset-bottom))'));
  assert.ok(css.includes('padding-bottom:calc(var(--footer-height) + 18px + env(safe-area-inset-bottom))'));
});

test('footer is reduced to a restrained 56px baseline',()=>{
  assert.ok(css.includes('--footer-height:56px'));
  assert.ok(css.includes('font-size:7.5px'));
});

test('global content scale is reduced again',()=>{
  assert.ok(css.includes('--content-max:432px'));
  assert.ok(css.includes('font-size:27px'));
});

test('compact graph is reduced to 176px',()=>{
  assert.ok(css.includes('.living-graph.compact svg{\n  max-width:176px;'));
});

test('graph membrane is warm and translucent rather than black',()=>{
  assert.ok(css.includes('fill:rgba(184,148,88,.07)'));
  assert.ok(css.includes('stroke:rgba(208,171,103,.56)'));
  assert.ok(css.includes('opacity:.72'));
});

test('graph links use warm visible strokes',()=>{
  assert.ok(css.includes('stroke:rgba(202,166,99,.66)'));
});

test('reduced motion protection remains present',()=>{
  assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'));
});
