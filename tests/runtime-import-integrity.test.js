import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,statSync} from 'node:fs';
import {resolve,dirname,relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const here=dirname(fileURLToPath(import.meta.url));
const srcRoot=resolve(here,'../src');

function walk(dir){
  return readdirSync(dir).flatMap(name=>{
    const full=resolve(dir,name);
    return statSync(full).isDirectory()?walk(full):full.endsWith('.js')?[full]:[];
  });
}
function clean(spec){return spec.split('?')[0]}
function exportsOf(text){
  const names=new Set();
  for(const match of text.matchAll(/export\s+(?:async\s+)?(?:function|const|let|var|class)\s+([A-Za-z_$][\w$]*)/g))names.add(match[1]);
  for(const match of text.matchAll(/export\s*\{([^}]+)\}/g)){
    for(const part of match[1].split(',')){
      const bits=part.trim().split(/\s+as\s+/);
      if(bits[1]||bits[0])names.add((bits[1]||bits[0]).trim());
    }
  }
  return names;
}

test('every runtime named import exists in its target module',()=>{
  const failures=[];
  for(const file of walk(srcRoot)){
    const text=readFileSync(file,'utf8');
    for(const match of text.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g)){
      const spec=clean(match[2]);
      if(!spec.startsWith('.'))continue;
      const target=resolve(dirname(file),spec);
      const targetText=readFileSync(target,'utf8');
      const available=exportsOf(targetText);
      for(const part of match[1].split(',')){
        const imported=part.trim().split(/\s+as\s+/)[0].trim();
        if(imported&&!available.has(imported))failures.push(`${relative(srcRoot,file)} imports missing ${imported} from ${relative(srcRoot,target)}`);
      }
    }
  }
  assert.deepEqual(failures,[]);
});

test('every runtime local JavaScript import carries the release token',()=>{
  const failures=[];
  for(const file of walk(srcRoot)){
    const text=readFileSync(file,'utf8');
    for(const match of text.matchAll(/(?:from\s*|import\(\s*)['"](\.{1,2}\/[^'"]+\.js(?:\?v=[^'"]+)?)['"]/g)){
      if(!match[1].endsWith('?v=0390p1'))failures.push(`${relative(srcRoot,file)} -> ${match[1]}`);
    }
  }
  assert.deepEqual(failures,[]);
});
