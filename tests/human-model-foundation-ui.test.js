import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

test('Understanding exposes the progressive Human Model',()=>{
  assert.ok(app.includes('HUMAN MODEL'));
  assert.ok(app.includes('HUMAN MODEL AUDIT'));
});

test('onboarding seeds the Human Model',()=>{
  const handler=app.slice(app.indexOf("if(a==='onboarding-complete')"),app.indexOf("if(a==='continue-flow')"));
  assert.match(handler,/createHumanModel/);
});

test('Today signals update the model only when deliberation begins',()=>{
  const handler=app.slice(app.indexOf("if(a==='consult')"),app.indexOf("if(a==='save-correction')"));
  assert.match(handler,/updateHumanModel/);
  assert.match(handler,/today-signals/);
});

test('Phase 1 states zero operational influence',()=>{
  assert.ok(app.includes('Judgement influence: 0'));
  assert.ok(app.includes('Practice selection influence: 0'));
  assert.ok(app.includes('Safety influence: 0'));
});

test('frozen footer remains intact',()=>{
  const nav=app.slice(app.indexOf('const nav='),app.indexOf('const ROUTES='));
  for(const label of ['Today','Understanding','Journey','Settings'])assert.ok(nav.includes(label));
});
