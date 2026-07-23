const completeContext=context=>['sleep','energy','time','challenge','soreness','emotionalLoad'].every(key=>context?.[key]!==undefined&&context?.[key]!==null&&context?.[key]!=='');

export function buildLivingCompanion({name='',context={},judgement=null,story={},hasContinuity=false}={}){
  const complete=completeContext(context);
  const stage=story?.stage||'opened';
  const completed=stage==='complete';
  const practiceComplete=['reflection','complete'].includes(stage);
  const greeting=`${timeGreeting()}${name?`, ${name}`:''}.`;
  if(completed)return {mode:'complete',eyebrow:'TODAY',greeting,label:'Today’s story',judgement:'Day completed',reasons:['The day has been deliberately closed.','Nothing else needs your attention here.'],confidence:'Continuity preserved.',action:'journey',actionLabel:'View today’s story',continuity:'There is continuity.'};
  if(hasContinuity)return {mode:'continuity',eyebrow:'TODAY',greeting,label:'Today’s judgement',judgement:judgement?.judgement||judgement?.practice?.name||'Continue where you left off.',reasons:['A deliberate thread is already active.','Strategos will not replace it with a new demand.'],confidence:judgement?.confidence?`${Math.round(judgement.confidence)}% confidence`:'Current context preserved.',action:'continue-flow',actionLabel:'Continue today’s story',continuity:'Today’s story is in progress.'};
  if(practiceComplete)return {mode:'reflection',eyebrow:'TODAY',greeting,label:'Today’s story',judgement:'Practice completed.',reasons:['The action is complete.','A brief reflection can close the learning loop.'],confidence:'No urgency added.',action:'eveningReflection',actionLabel:'Continue today’s story',continuity:'Today’s story is in progress.'};
  if(judgement)return {mode:'judgement',eyebrow:'TODAY',greeting,label:'Today’s judgement',judgement:judgement.judgement||judgement.practice?.name||'A direction is ready.',reasons:[judgement.explain?.summary||judgement.intention||'The judgement reflects the context currently known.',...(judgement.explain?.unknowns?.slice?.(0,1)||[])].filter(Boolean),confidence:judgement.confidence?`${Math.round(judgement.confidence)}% confidence`:'Confidence remains explicit.',action:'judgement',actionLabel:'Continue today’s story',continuity:'Today’s story is in progress.'};
  if(complete)return {mode:'ready',eyebrow:'TODAY',greeting,label:'Today’s judgement',judgement:'Ready to deliberate.',reasons:['Today’s context has been recorded.','The Agora can now form one prudent direction.'],confidence:'No recommendation exists yet.',action:'consult',actionLabel:'Continue today’s story',continuity:'The day is ready.'};
  return {mode:'listen',eyebrow:'TODAY',greeting,label:'Today’s judgement',judgement:'Still listening.',reasons:['Strategos needs only the minimum context required to reason responsibly.','Nothing is inferred from silence.'],confidence:'No judgement yet.',action:'focus-signals',actionLabel:'Continue today’s story',continuity:'Nothing new today. Continue your story.'};
}

export function timeGreeting(hour=new Date().getHours()){
  if(hour<12)return 'Good morning';
  if(hour<18)return 'Good afternoon';
  return 'Good evening';
}
