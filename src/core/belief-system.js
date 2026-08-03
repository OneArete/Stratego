import { buildPersonalEvidence, PERSONAL_EVIDENCE_MINIMUM } from './personal-evidence.js?v=0720p1';

export const BELIEF_STATUSES=['proposed','confirmed','rejected','retired'];

export const CONFIRMED_BELIEF_MAX_ADJUSTMENT=0.12;

export function buildBeliefProposals(outcomeLedger=[],beliefs=[]){
  const existing=new Map((beliefs||[]).map(item=>[item.key,item]));
  return buildPersonalEvidence(outcomeLedger)
    .filter(item=>item.directionalOutcomes>=PERSONAL_EVIDENCE_MINIMUM)
    .map(summary=>{
      const key=`practice-helpfulness:${summary.practiceId}`;
      const prior=existing.get(key);
      const status=prior?.status||'proposed';
      const activeInfluence=status==='confirmed'?CONFIRMED_BELIEF_MAX_ADJUSTMENT:0;
      return {
        id:prior?.id||makeId('belief'),
        key,
        type:'practice-helpfulness',
        subjectId:summary.practiceId,
        subjectName:summary.practiceName,
        statement:beliefStatement(summary),
        confidence:beliefConfidence(summary),
        evidenceLevel:summary.evidenceLevel,
        supportingEvidence:summary.directionalOutcomes,
        contradictions:summary.counts.no,
        helpRate:summary.helpRate,
        firstObservedAt:summary.firstObservedAt,
        lastObservedAt:summary.lastObservedAt,
        status,
        personReviewedAt:prior?.personReviewedAt||null,
        reviewNote:prior?.reviewNote||'',
        source:'repeated-person-reported-outcomes',
        automaticHumanModelInfluence:0,
        automaticJudgementInfluence:activeInfluence,
        automaticPracticeSelectionInfluence:activeInfluence
      };
    });
}

export function reconcileBeliefs(beliefs=[],outcomeLedger=[]){
  const proposals=buildBeliefProposals(outcomeLedger,beliefs);
  const keys=new Set(proposals.map(item=>item.key));
  const retained=(beliefs||[]).filter(item=>!keys.has(item.key));
  return [...proposals,...retained].slice(0,200);
}

export function reviewBelief(beliefs=[],beliefId,{action,note='',at=new Date().toISOString()}={}){
  if(!['confirm','reject','reopen','retire'].includes(action))return [...beliefs];
  return (beliefs||[]).map(item=>item.id!==beliefId?item:{
    ...item,
    status:action==='confirm'?'confirmed':action==='reject'?'rejected':action==='retire'?'retired':'proposed',
    personReviewedAt:at,
    reviewNote:String(note||'').trim()
  });
}

export function beliefAudit(beliefs=[]){
  const counts=Object.fromEntries(BELIEF_STATUSES.map(status=>[status,0]));
  (beliefs||[]).forEach(item=>{if(counts[item.status]!=null)counts[item.status]++});
  return {
    total:(beliefs||[]).length,
    counts,
    statement:(beliefs||[]).length
      ?`${counts.confirmed} confirmed, ${counts.proposed} awaiting review, ${counts.rejected} rejected.`
      :'No belief candidate has enough repeated evidence yet.'
  };
}

export function beliefStatement(summary){
  const percent=Math.round((summary?.helpRate||0)*100);
  return `${summary.practiceName} has ${percent}% weighted helpfulness across ${summary.directionalOutcomes} person-reported outcomes.`;
}

export function beliefConfidence(summary){
  const n=summary?.directionalOutcomes||0;
  const maturity=n<5?.35:n<8?.55:.7;
  const consistency=Math.abs((summary?.helpRate||0)-.5)*.6;
  return Math.min(.9,Number((maturity+consistency).toFixed(2)));
}

/**
 * Applies a small, bounded adjustment to practice totals for beliefs the
 * person has explicitly confirmed. This is the only point in the system
 * where the Belief System is permitted to influence practice selection.
 *
 * Bound: each confirmed belief may shift its practice's total by at most
 * +/-CONFIRMED_BELIEF_MAX_ADJUSTMENT, scaled by how far its help rate sits
 * from neutral (50%) and by the belief's own confidence. This is a nudge
 * among close candidates, not an override -- it cannot flip a practice that
 * safety-relevant advisors have strongly opposed (those scores move in
 * increments an order of magnitude larger). Eligibility/blocking is decided
 * separately and is never touched by this function.
 */
export function applyConfirmedBeliefAdjustments(totals={},beliefs=[]){
  const confirmed=(beliefs||[]).filter(item=>item.status==='confirmed'&&item.type==='practice-helpfulness'&&item.subjectId in (totals||{}));
  const nextTotals={...totals};
  const applied=[];
  for(const belief of confirmed){
    const centered=Number(belief.helpRate??0.5)-0.5;
    const confidenceFactor=Math.min(1,Math.max(0,Number(belief.confidence)||0));
    const magnitude=Math.min(Math.abs(centered)*2,1)*CONFIRMED_BELIEF_MAX_ADJUSTMENT*confidenceFactor;
    const adjustment=Number((centered>=0?magnitude:-magnitude).toFixed(3));
    if(!adjustment)continue;
    nextTotals[belief.subjectId]=Number(((nextTotals[belief.subjectId]||0)+adjustment).toFixed(3));
    applied.push({
      practiceId:belief.subjectId,
      practiceName:belief.subjectName,
      adjustment,
      statement:belief.statement,
      helpRate:belief.helpRate,
      confidence:belief.confidence
    });
  }
  return {totals:nextTotals,applied};
}

function makeId(prefix){return globalThis.crypto?.randomUUID?`${prefix}-${crypto.randomUUID()}`:`${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`}
