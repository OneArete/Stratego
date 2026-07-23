import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

test('judgement exposes the consolidated safety envelope',()=>{
  assert.ok(app.includes('Safety envelope'));
  assert.ok(app.includes('Phase 2 requires explicit acknowledgement before Practice begins'));
});

test('Understanding Audit exposes Safety Architecture',()=>{
  assert.ok(app.includes('SAFETY ARCHITECTURE'));
  assert.ok(app.includes('Execution gate: constrained envelopes require acknowledgement'));
});

test('Journey preserves safety provenance',()=>{
  assert.ok(app.includes('Safety envelope at judgement'));
});

test('candidate receives the safety envelope before explanation',()=>{
  const envelope=app.indexOf('candidate.safetyEnvelope=buildSafetyEnvelope');
  const explain=app.indexOf('candidate.explain=buildExplanation');
  assert.ok(envelope>0);
  assert.ok(envelope<explain);
});

test('all runtime imports use one release token',()=>{
  const imports=[...app.matchAll(/from ['"]([^'"]+\.js(?:\?v=[^'"]+)?)['"]/g)].map(match=>match[1]);
  assert.ok(imports.length>0);
  for(const specifier of imports)assert.match(specifier,/\?v=0390p1$/);
});
