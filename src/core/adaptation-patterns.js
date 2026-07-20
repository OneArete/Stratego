const VALID_LEVELS=new Set(['regression','technique','progression']);
const SUPPORTIVE_FITS=new Set(['better','right']);
const MAX_AGE_DAYS=180;
const MIN_OBSERVATIONS=3;

export function deriveAdaptationPatterns(history=[],now=Date.now()){
  const cutoff=now-MAX_AGE_DAYS*86400000;
  const groups=new Map();

  for(const entry of history||[]){
    const accountability=entry?.adaptationAccountability;
    const at=Date.parse(accountability?.at||entry?.completedAt||'');
    if(!Number.isFinite(at)||at<cutoff)continue;
    if(!SUPPORTIVE_FITS.has(accountability?.fit))continue;

    const practiceId=entry?.decision?.practice?.id||entry?.outcomeRecord?.executedPracticeId||null;
    if(!practiceId)continue;

    for(const choice of accountability?.choices||[]){
      if(!VALID_LEVELS.has(choice?.level))continue;
      const phaseName=String(choice.phaseName||`Phase ${Number(choice.phaseIndex)+1}`);
      const key=[practiceId,phaseName,choice.level].join('|');
      const current=groups.get(key)||{
        id:`adaptation-pattern-${slug(key)}`,
        key,
        practiceId,
        phaseName,
        level:choice.level,
        observations:[],
        supportive:0,
        better:0,
        right:0,
        firstObservedAt:null,
        lastObservedAt:null,
        status:'insufficient',
        influence:0
      };
      current.observations.push({
        historyId:entry.id||entry.judgementId||`${practiceId}-${at}`,
        at:new Date(at).toISOString(),
        fit:accountability.fit
      });
      current.supportive+=1;
      current.better+=accountability.fit==='better'?1:0;
      current.right+=accountability.fit==='right'?1:0;
      current.firstObservedAt=current.firstObservedAt&&Date.parse(current.firstObservedAt)<at
        ?current.firstObservedAt:new Date(at).toISOString();
      current.lastObservedAt=current.lastObservedAt&&Date.parse(current.lastObservedAt)>at
        ?current.lastObservedAt:new Date(at).toISOString();
      groups.set(key,current);
    }
  }

  return [...groups.values()]
    .map(finalisePattern)
    .sort((a,b)=>Date.parse(b.lastObservedAt||0)-Date.parse(a.lastObservedAt||0));
}

export function adaptationPatternCandidates(history=[],now=Date.now()){
  return deriveAdaptationPatterns(history,now).filter(pattern=>pattern.status==='candidate');
}

export function adaptationPatternSummary(pattern){
  if(!pattern)return 'No adaptation pattern.';
  const label=pattern.level==='regression'?'easier'
    :pattern.level==='progression'?'harder':'standard';
  return `${label} version selected in ${pattern.phaseName} across ${pattern.supportive} comparable Practices.`;
}

export function adaptationPatternAudit(history=[],now=Date.now()){
  const patterns=deriveAdaptationPatterns(history,now);
  return {
    total:patterns.length,
    candidate:patterns.filter(item=>item.status==='candidate').length,
    insufficient:patterns.filter(item=>item.status==='insufficient').length,
    influential:0,
    statement:patterns.some(item=>item.status==='candidate')
      ?'Repeated adaptation choices are visible for review but do not yet influence judgement.'
      :'No repeated adaptation choice has enough comparable evidence yet.'
  };
}

function finalisePattern(pattern){
  const uniqueSessions=new Set(pattern.observations.map(item=>item.historyId)).size;
  const status=uniqueSessions>=MIN_OBSERVATIONS?'candidate':'insufficient';
  return {
    ...pattern,
    uniqueSessions,
    status,
    influence:0,
    eligibleForJudgementInfluence:false,
    evidenceBoundary:`Minimum ${MIN_OBSERVATIONS} supportive observations within ${MAX_AGE_DAYS} days.`
  };
}

function slug(value){
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}


/* v0.18.1 — review governance consolidated to avoid a new runtime module dependency */
const REVIEW_ACTIONS=new Set(['confirm','reject','reopen']);

export function applyAdaptationPatternReview(reviews=[],{
  patternId,
  action,
  note='',
  at=new Date().toISOString()
}={}){
  if(!patternId||!REVIEW_ACTIONS.has(action))return [...(reviews||[])];

  const status=action==='confirm'
    ?'confirmed'
    :action==='reject'
      ?'rejected'
      :'candidate';

  const next={
    patternId,
    status,
    note:String(note||'').trim(),
    reviewedAt:at,
    source:'person',
    judgementInfluence:0
  };

  return [
    next,
    ...(reviews||[]).filter(item=>item?.patternId!==patternId)
  ].slice(0,200);
}

export function adaptationPatternReviewFor(reviews=[],patternId){
  return (reviews||[]).find(item=>item?.patternId===patternId)||null;
}

export function mergeAdaptationPatternReviews(patterns=[],reviews=[]){
  return (patterns||[]).map(pattern=>{
    const review=adaptationPatternReviewFor(reviews,pattern.id);
    return {
      ...pattern,
      review,
      reviewStatus:review?.status||pattern.status,
      personConfirmed:review?.status==='confirmed',
      personRejected:review?.status==='rejected',
      influence:0,
      eligibleForJudgementInfluence:false
    };
  });
}

export function adaptationPatternReviewAudit(patterns=[],reviews=[]){
  const merged=mergeAdaptationPatternReviews(patterns,reviews);
  return {
    candidate:merged.filter(item=>item.reviewStatus==='candidate').length,
    confirmed:merged.filter(item=>item.reviewStatus==='confirmed').length,
    rejected:merged.filter(item=>item.reviewStatus==='rejected').length,
    influential:0,
    statement:'Review changes accountability status only. Adaptation patterns still have no judgement influence.'
  };
}

export function adaptationPatternReviewSummary(pattern){
  if(!pattern)return 'No review available.';
  if(pattern.reviewStatus==='confirmed'){
    return 'Confirmed by you as a recurring in-session choice.';
  }
  if(pattern.reviewStatus==='rejected'){
    return pattern.review?.note
      ?`Rejected by you: ${pattern.review.note}`
      :'Rejected by you as a misleading pattern.';
  }
  return 'Awaiting your review.';
}

export function reconcileAdaptationPatternReviews(reviews=[],patterns=[]){
  const known=new Set((patterns||[]).map(item=>item.id));
  const seen=new Set();
  return (reviews||[]).filter(item=>{
    if(!item?.patternId||seen.has(item.patternId))return false;
    seen.add(item.patternId);
    return known.has(item.patternId);
  }).map(item=>({
    patternId:item.patternId,
    status:['candidate','confirmed','rejected'].includes(item.status)?item.status:'candidate',
    note:String(item.note||''),
    reviewedAt:item.reviewedAt||null,
    source:'person',
    judgementInfluence:0
  }));
}
