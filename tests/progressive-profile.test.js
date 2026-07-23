import test from 'node:test';
import assert from 'node:assert/strict';
import { normaliseProfile, profileCompleteness, profileSummary } from '../src/core/profile.js?v=0390p1';

test('normalises valid person-declared profile fields',()=>{
  const profile=normaliseProfile({name:' Pedro ',age:'48',heightCm:'173',weightKg:'62.6',experience:'intermediate',limitations:' shoulder '});
  assert.deepEqual(profile,{name:'Pedro',age:48,heightCm:173,weightKg:62.6,experience:'intermediate',limitations:'shoulder'});
  assert.equal(profileCompleteness(profile).completed,5);
  assert.match(profileSummary(profile),/Pedro/);
});

test('keeps missing or invalid profile facts unknown',()=>{
  const profile=normaliseProfile({name:'',age:5,heightCm:999,weightKg:'no',experience:'expert'});
  assert.equal(profile.name,'Friend');
  assert.equal(profile.age,null);
  assert.equal(profile.heightCm,null);
  assert.equal(profile.weightKg,null);
  assert.equal(profile.experience,null);
});
