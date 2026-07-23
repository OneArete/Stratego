import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

test('onboarding includes optional progressive profile fields',()=>{
  for(const id of ['profile-age','profile-height','profile-weight','profile-experience','profile-limitations']) assert.match(app,new RegExp(id));
  assert.match(app,/OPTIONAL CONTEXT/);
});

test('settings exposes a person-editable profile',()=>{
  assert.match(app,/MY PROFILE/);
  assert.ok(app.includes('data-action="save-profile"'));
  assert.match(app,/Your profile was updated locally/);
});
