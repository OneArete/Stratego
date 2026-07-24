import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

test('onboarding captures name and sets expectations without profile form',()=>{
  // Step 0: central question
  assert.match(app,/ONE QUESTION/);
  assert.match(app,/What does your body actually need today/);
  // Step 1: organism
  assert.match(app,/SIX DIMENSIONS/);
  assert.match(app,/living-graph compact/);
  // Step 2: name — no profile fields
  assert.match(app,/onboarding-name/);
  assert.match(app,/onboarding-complete/);
  // Profile form must NOT appear inside onboarding steps
  assert.ok(!app.includes('"profile-age"'),'profile-age should not appear in onboarding');
  assert.ok(!app.includes('"profile-height"'),'profile-height should not appear in onboarding');
});

test('settings exposes a person-editable profile',()=>{
  assert.match(app,/MY PROFILE/);
  assert.ok(app.includes('data-action="save-profile"'));
  assert.match(app,/Your profile was updated locally/);
  // Profile fields remain accessible in Settings
  for(const id of ['settings-profile-name','settings-profile-age','settings-profile-height','settings-profile-weight','settings-profile-experience','settings-profile-limitations']){
    assert.ok(app.includes(id),`${id} should be in Settings`);
  }
});
