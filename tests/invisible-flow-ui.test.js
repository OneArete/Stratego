import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const model=readFileSync(new URL('../src/core/living-companion.js',import.meta.url),'utf8');

test('Today is reduced to Living Companion plus frozen footer',()=>{
  assert.match(app,/function today\(\)\{[\s\S]*shell\(`\$\{nav\('today'\)\}`\)/);
});

test('Today does not expose internal pipeline language',()=>{
  for(const term of ['Ready to deliberate','Context recorded','TODAY’S STORY','Daily Story']){
    assert.doesNotMatch(model,new RegExp(term,'i'));
  }
});

test('closed day has no primary action',()=>{
  assert.match(model,/action:null,actionLabel:null/);
});
