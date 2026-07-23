import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const here=dirname(fileURLToPath(import.meta.url));
const appPath=resolve(here,'../src/app.js');
const app=readFileSync(appPath,'utf8');

test('every direct app module import exists in the deploy tree',()=>{
  const imports=[...app.matchAll(/from\s+'([^']+)'/g)].map(match=>match[1]);
  for(const relative of imports){
    const target=resolve(dirname(appPath),relative.split('?')[0]);
    assert.equal(existsSync(target),true,`Missing runtime module: ${relative}`);
  }
});

test('adaptation review does not introduce a second deploy dependency',()=>{
  assert.doesNotMatch(app,/adaptation-pattern-review\.js/);
  assert.match(app,/from '\.\/core\/adaptation-patterns\.js\?v=0390p1'/);
});

test('boot loader surfaces the actual module error',()=>{
  const html=readFileSync(resolve(here,'../index.html'),'utf8');
  assert.match(html,/await import\('\.\/src\/app\.js\?v=0390p1'\)/);
  assert.match(html,/Strategos startup failed/);
});
