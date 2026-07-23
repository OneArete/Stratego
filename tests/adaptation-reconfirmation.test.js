import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyAdaptationPatternReview,
  mergeAdaptationPatternReviews,
  adaptationReconfirmationGate,
  attachAdaptationReconfirmation,
  canConfirmAdaptationPattern
} from '../src/core/adaptation-patterns.js';

const pattern={
  id:'adaptation-pattern-recovery-main-regression',
  practiceId:'recovery',
  phaseName:'Main',
  level:'regression',
  status:'candidate'
};

const supportive=(id,at)=>({
  id,
  completedAt:at,
  decision:{practice:{id:'recovery'}},
  adaptationAccountability:{
    at,
    fit:'right',
    choices:[{phaseName:'Main',level:'regression',source:'person'}]
  }
});

test('reopening a confirmed pattern marks fresh evidence as required',()=>{
  let reviews=applyAdaptationPatternReview([],{patternId:pattern.id,action:'confirm',at:'2026-07-01T10:00:00Z'});
  reviews=applyAdaptationPatternReview(reviews,{patternId:pattern.id,action:'reopen',at:'2026-07-10T10:00:00Z'});
  assert.equal(reviews[0].status,'candidate');
  assert.equal(reviews[0].revalidationRequired,true);
});

test('initial candidate has no reconfirmation gate',()=>{
  const merged=mergeAdaptationPatternReviews([pattern],[])[0];
  const gate=adaptationReconfirmationGate(merged,[]);
  assert.equal(gate.required,false);
  assert.equal(gate.eligible,true);
});

test('old evidence before reopening does not count',()=>{
  const review={patternId:pattern.id,status:'candidate',reviewedAt:'2026-07-10T10:00:00Z',revalidationRequired:true};
  const merged=mergeAdaptationPatternReviews([pattern],[review])[0];
  const gate=adaptationReconfirmationGate(merged,[
    supportive('old','2026-07-09T10:00:00Z')
  ]);
  assert.equal(gate.supportiveAfterReview,0);
  assert.equal(gate.eligible,false);
});

test('two new supportive person uses permit reconfirmation',()=>{
  const review={patternId:pattern.id,status:'candidate',reviewedAt:'2026-07-10T10:00:00Z',revalidationRequired:true};
  const merged=mergeAdaptationPatternReviews([pattern],[review])[0];
  const history=[
    supportive('a','2026-07-11T10:00:00Z'),
    supportive('b','2026-07-12T10:00:00Z')
  ];
  const attached=attachAdaptationReconfirmation([merged],history)[0];
  assert.equal(attached.reconfirmation.eligible,true);
  assert.equal(canConfirmAdaptationPattern(attached,history),true);
});

test('automatic confirmed-default use does not count as fresh person evidence',()=>{
  const review={patternId:pattern.id,status:'candidate',reviewedAt:'2026-07-10T10:00:00Z',revalidationRequired:true};
  const merged=mergeAdaptationPatternReviews([pattern],[review])[0];
  const entry=supportive('a','2026-07-11T10:00:00Z');
  entry.adaptationAccountability.choices[0].source='confirmed-pattern';
  const gate=adaptationReconfirmationGate(merged,[entry]);
  assert.equal(gate.supportiveAfterReview,0);
});

test('different Practice phase or level does not count',()=>{
  const review={patternId:pattern.id,status:'candidate',reviewedAt:'2026-07-10T10:00:00Z',revalidationRequired:true};
  const merged=mergeAdaptationPatternReviews([pattern],[review])[0];
  const wrong=supportive('a','2026-07-11T10:00:00Z');
  wrong.adaptationAccountability.choices[0].phaseName='Close';
  const gate=adaptationReconfirmationGate(merged,[wrong]);
  assert.equal(gate.eligible,false);
});
