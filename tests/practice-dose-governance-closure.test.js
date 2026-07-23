import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  derivePracticeDoseEvidence,
  applyPracticeDoseEvidenceReview,
  buildPracticeDoseRevisionProposals,
  applyPracticeDoseRevisionDecision,
  effectivePracticeDoseRevisionWithHealth,
  applyPracticeDoseRevisionToJudgement,
  recordPracticeDoseRevisionUse,
  resolvePracticeDoseRevisionUse,
  assessPracticeDoseRevisionHealth
} from '../src/core/practice-session.js';

const here=dirname(fileURLToPath(import.meta.url));
const app=readFileSync(resolve(here,'../src/app.js'),'utf8');

test('Dose governance stays in the existing runtime module',()=>{
  assert.match(app,/from '\.\/core\/practice-session\.js\?v=0390p1'/);
  assert.equal(existsSync(resolve(here,'../src/core/practice-dose-governance.js')),false);
});

test('same Practice and dose band are required for grouping',()=>{
  const now=new Date('2026-07-21T12:00:00Z').getTime();
  const make=(id,practiceId,ratio)=>({id,completedAt:new Date(now-86400000).toISOString(),decision:{practice:{id:practiceId}},practiceContract:{practiceId,durationMinutes:10},outcomeRecord:{completionRatio:ratio},practiceContractOutcome:{practiceId,resolvedAt:new Date(now-86400000).toISOString(),status:'aligned',effect:'right',goalFit:'strong',burden:'low'}});
  assert.equal(derivePracticeDoseEvidence([make('a','recovery',1),make('b','recovery',.7),make('c','connection',1)],now).length,3);
});

test('review alone cannot change duration',()=>{
  assert.equal(applyPracticeDoseEvidenceReview([],{evidenceId:'e1',action:'confirm'})[0].durationInfluence,0);
});

test('accepted duration is explicit and scoped',()=>{
  const evidence={id:'e1',practiceId:'recovery',doseBand:'partial',direction:'mostly-aligned',total:3,averageActualMinutes:7,observations:[{plannedMinutes:10},{plannedMinutes:10},{plannedMinutes:10}]};
  const proposal=buildPracticeDoseRevisionProposals([evidence],[{evidenceId:'e1',status:'confirmed'}],[])[0];
  const decisions=applyPracticeDoseRevisionDecision([],{proposal,action:'accept'});
  const revision=effectivePracticeDoseRevisionWithHealth(decisions,[],'recovery');
  const judgement=applyPracticeDoseRevisionToJudgement({duration:10,practice:{id:'recovery'}},revision);
  assert.equal(judgement.duration,7);
  assert.equal(judgement.baseDuration,10);
  assert.equal(effectivePracticeDoseRevisionWithHealth(decisions,[],'connection'),null);
});

test('accepted use is recorded and resolved',()=>{
  const revision={proposalId:'p1',evidenceId:'e1',practiceId:'recovery',status:'accepted',proposedDurationMinutes:7,previousDurationMinutes:10};
  const use=recordPracticeDoseRevisionUse({revision,contract:{durationMinutes:7},at:'2026-07-21T10:00:00Z'});
  const resolved=resolvePracticeDoseRevisionUse(use,{contractOutcome:{status:'aligned'},completionRatio:1,at:'2026-07-21T10:10:00Z'});
  assert.equal(resolved.fit,'right');
  assert.equal(resolved.status,'resolved');
});

test('repeated worse outcomes pause use',()=>{
  const history=[0,1].map(index=>({practiceDoseRevisionUse:{proposalId:'p1',status:'resolved',fit:'worse',completedAt:new Date(Date.now()-index*86400000).toISOString()}}));
  assert.equal(assessPracticeDoseRevisionHealth(history,'p1').suspended,true);
});

test('startup and four-item footer remain protected',()=>{
  const nav=app.slice(app.indexOf('const nav='),app.indexOf('const ROUTES='));
  for(const label of ['Today','Understanding','Journey','Settings'])assert.ok(nav.includes(label));
  assert.match(app,/resolveStartupDestination/);
});
