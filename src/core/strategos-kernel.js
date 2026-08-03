import { evidenceGate } from './evidence-gate.js?v=0640k1';
import { resolveCurrentMoment } from './current-moment.js?v=0640k1';

export const STRATEGOS_KERNEL_VERSION='1.0.0';

const cloneList=value=>Array.isArray(value)?value.map(item=>typeof item==='object'&&item!==null?{...item}:item):[];
const finite=value=>Number.isFinite(Number(value));

export function resolveKernelProjection({checkIns=[],judgements=[],story={},hasContinuity=false,now=new Date()}={}){
  const gate=evidenceGate({checkIns,judgements,now});
  const resolved=resolveCurrentMoment({
    contextEvidence:gate.context,
    judgement:gate.judgement,
    story,
    hasContinuity
  });
  return Object.freeze({
    kernelVersion:STRATEGOS_KERNEL_VERSION,
    day:gate.day,
    state:resolved.moment,
    action:resolved.action,
    nextSignal:resolved.nextSignal||null,
    evidence:Object.freeze({...gate.context}),
    judgement:gate.judgement||null,
    canDeliberate:gate.canDeliberate,
    canExplain:gate.canExplain,
    statement:gate.statement
  });
}

export function prepareKernelDeliberation({checkIns=[],judgements=[],now=new Date()}={}){
  const projection=resolveKernelProjection({checkIns,judgements,now});
  if(!projection.canDeliberate){
    return Object.freeze({
      allowed:false,
      context:projection.evidence.signals,
      missing:cloneList(projection.evidence.missing),
      nextAction:'focus-signals',
      reason:projection.statement
    });
  }
  return Object.freeze({
    allowed:true,
    context:{...projection.evidence.signals},
    missing:[],
    nextAction:'deliberate',
    reason:'Current-day evidence authorises deliberation.'
  });
}

export function createCurrentJudgement(candidate,{context={},explanation=null,boundaries=null,explainRecord=null,safetyEnvelope=null,humanModelSnapshot=null,validity=null}={}){
  if(!candidate?.id)throw new TypeError('A Current Judgement requires an id.');
  if(!candidate?.practice?.id)throw new TypeError('A Current Judgement requires one selected Practice.');
  if(!candidate?.judgement)throw new TypeError('A Current Judgement requires one visible orientation.');
  if(!finite(candidate?.confidence))throw new TypeError('A Current Judgement requires structured confidence.');

  const dominantReason=explanation?.summary||candidate.explanation?.[0]||candidate.reasons?.[0]||candidate.intention||candidate.judgement;
  const unknowns=cloneList(candidate.unknowns);
  const alternatives=cloneList(candidate.alternatives);
  const createdAt=candidate.createdAt||new Date().toISOString();
  const expiresAt=validity?.expiresAt||candidate.expiresAt||null;

  return {
    ...candidate,
    kernelVersion:STRATEGOS_KERNEL_VERSION,
    entityType:'current-judgement',
    context:{...context},
    orientation:Object.freeze({
      statement:candidate.judgement,
      practiceId:candidate.practice.id,
      practiceName:candidate.practice.name,
      durationMinutes:Number(candidate.duration)||null,
      intention:candidate.intention||null
    }),
    dominantReason,
    confidenceStructure:Object.freeze({
      value:Number(candidate.confidence),
      level:candidate.confidenceLevel||null,
      base:finite(candidate.baseConfidence)?Number(candidate.baseConfidence):Number(candidate.confidence),
      calibrated:Boolean(candidate.confidenceCalibration?.applied)
    }),
    unknowns,
    alternatives,
    risk:Object.freeze({
      status:safetyEnvelope?.status||'unknown',
      reversible:boundaries?.reversibility||candidate.reversibility||'not-classified'
    }),
    validity:Object.freeze({
      createdAt,
      expiresAt,
      scope:validity?.scope||'current-day',
      active:true
    }),
    explain:explanation||candidate.explain||null,
    boundaries:boundaries||candidate.boundaries||null,
    explainRecord:explainRecord||candidate.explainRecord||null,
    safetyEnvelope:safetyEnvelope||candidate.safetyEnvelope||null,
    humanModelSnapshot:humanModelSnapshot||candidate.humanModelSnapshot||null
  };
}

export function kernelJudgementAudit(judgement){
  const failures=[];
  if(judgement?.entityType!=='current-judgement')failures.push('missing-current-judgement-entity');
  if(!judgement?.orientation?.statement)failures.push('missing-orientation');
  if(!judgement?.orientation?.practiceId)failures.push('missing-practice');
  if(!judgement?.dominantReason)failures.push('missing-dominant-reason');
  if(!finite(judgement?.confidenceStructure?.value))failures.push('missing-confidence');
  if(!judgement?.validity?.scope)failures.push('missing-validity');
  return {valid:failures.length===0,failures,kernelVersion:judgement?.kernelVersion||null};
}
