export const STATE_SCHEMA_VERSION = 28;
export const PRODUCT_VERSION = '0.16.5';

export function createInitialState(){
  return {
    schemaVersion: STATE_SCHEMA_VERSION,
    productVersion: PRODUCT_VERSION,
    profile:null,
    history:[],
    judgements:[],
    current:null,
    deltaTotal:0,
    onboardingVersion:0,
    understandingModel:{feedback:{},changes:[]},
    advisorMemories:{},
    councilReports:[],
    correctionAudit:[],
    choiceLog:[],
    preferenceModel:[],
    outcomeRecords:[],
    commitments:[],
    frictionPlans:[],
    fallbackPlans:[],
    structuredReflections:[],
    outcomeAttributions:[],
    outcomeEpisodes:[],
    outcomePatterns:[],
    patternTransfers:[],
    judgementForecasts:[],
    calibrationAccountability:[],
    reflectionDraft:null,
    integrity:{lastReconciledAt:null,lastReport:null},
    agencyIntegrity:{lastReconciledAt:null,lastReport:null},
    followThroughIntegrity:{lastReconciledAt:null,lastReport:null},
    longitudinalAccountability:{lastReconciledAt:null,lastReport:null},
    settings:{sound:true,voice:'minimal',haptics:true,keepAwake:true}
  };
}

export function migrateState(input={}){
  const source = input && typeof input === 'object' ? structuredCloneSafe(input) : {};
  const fromVersion = Number(source.schemaVersion || 3);
  let state = source;
  if(fromVersion < 4) state = migrateV080ToV081(state);
  if(Number(state.schemaVersion||4) < 5) state = migrateV081ToV090(state);
  if(Number(state.schemaVersion||5) < 6) state = migrateV090Phase1ToPhase2(state);
  if(Number(state.schemaVersion||6) < 7) state = migrateV090Phase2ToPhase3(state);
  if(Number(state.schemaVersion||7) < 8) state = migrateV090Phase3ToFinal(state);
  if(Number(state.schemaVersion||8) < 9) state = migrateV090ToV0100Phase1(state);
  if(Number(state.schemaVersion||9) < 10) state = migrateV0100Phase1ToPhase2(state);
  if(Number(state.schemaVersion||10) < 11) state = migrateV0100Phase2ToPhase3(state);
  if(Number(state.schemaVersion||11) < 12) state = migrateV0100ToV0110Phase1(state);
  if(Number(state.schemaVersion||12) < 13) state = migrateV0110Phase1ToPhase2(state);
  if(Number(state.schemaVersion||13) < 14) state = migrateV0110Phase2ToPhase3(state);
  if(Number(state.schemaVersion||14) < 15) state = migrateV0110Phase3ToFinal(state);
  if(Number(state.schemaVersion||15) < 16) state = migrateV0110ToV0120Phase1(state);
  if(Number(state.schemaVersion||16) < 17) state = migrateV0120Phase1ToPhase2(state);
  if(Number(state.schemaVersion||17) < 18) state = migrateV0120Phase2ToPhase3(state);
  if(Number(state.schemaVersion||18) < 19) state = migrateV0120Phase3ToFinal(state);
  if(Number(state.schemaVersion||19) < 20) state = migrateV0120ToV0130Phase1(state);
  if(Number(state.schemaVersion||20) < 21) state = migrateV0130Phase1ToFinal(state);
  if(Number(state.schemaVersion||21) < 22) state = migrateV0131ToV0140Phase1(state);
  if(Number(state.schemaVersion||22) < 23) state = migrateV0140Phase1ToPhase2(state);
  if(Number(state.schemaVersion||23) < 24) state = migrateV0143ToV0144(state);
  if(Number(state.schemaVersion||24) < 25) state = migrateV0144ToV0150Phase1(state);
  if(Number(state.schemaVersion||25) < 26) state = migrateV0150Phase1ToPhase3(state);
  if(Number(state.schemaVersion||26) < 27) state = migrateV0150Phase3ToPhase4(state);
  if(Number(state.schemaVersion||27) < 28) state = migrateV0150ToV0160Phase1(state);
  const base = createInitialState();
  const migratedSettings={...(state.settings||{})};
  delete migratedSettings.voiceName;
  delete migratedSettings.voicePace;
  return {
    ...base,
    ...state,
    schemaVersion:STATE_SCHEMA_VERSION,
    productVersion:PRODUCT_VERSION,
    history:[...(state.history||[])],
    judgements:[...(state.judgements||[])],
    understandingModel:{
      ...base.understandingModel,
      ...(state.understandingModel||{}),
      feedback:{...(state.understandingModel?.feedback||{})},
      changes:[...(state.understandingModel?.changes||[])]
    },
    advisorMemories:{...(state.advisorMemories||{})},
    councilReports:[...(state.councilReports||[])],
    correctionAudit:[...(state.correctionAudit||[])],
    choiceLog:[...(state.choiceLog||[])],
    preferenceModel:[...(state.preferenceModel||[])],
    outcomeRecords:[...(state.outcomeRecords||[])],
    commitments:[...(state.commitments||[])],
    frictionPlans:[...(state.frictionPlans||[])],
    fallbackPlans:[...(state.fallbackPlans||[])],
    structuredReflections:[...(state.structuredReflections||[])],
    outcomeAttributions:[...(state.outcomeAttributions||[])],
    outcomeEpisodes:[...(state.outcomeEpisodes||[])],
    outcomePatterns:[...(state.outcomePatterns||[])],
    patternTransfers:[...(state.patternTransfers||[])],
    judgementForecasts:[...(state.judgementForecasts||[])],
    calibrationAccountability:[...(state.calibrationAccountability||[])],
    reflectionDraft:state.reflectionDraft||null,
    integrity:{...base.integrity,...(state.integrity||{})},
    agencyIntegrity:{...base.agencyIntegrity,...(state.agencyIntegrity||{})},
    followThroughIntegrity:{...base.followThroughIntegrity,...(state.followThroughIntegrity||{})},
    longitudinalAccountability:{...base.longitudinalAccountability,...(state.longitudinalAccountability||{})},
    settings:{...base.settings,...migratedSettings}
  };
}







export function migrateV0150ToV0160Phase1(state={}){
  const next=structuredCloneSafe(state);
  next.reflectionDraft=next.reflectionDraft||null;
  next.schemaVersion=28;
  next.productVersion='0.16.0';
  return next;
}

export function migrateV0150Phase3ToPhase4(state={}){
  const next=structuredCloneSafe(state);
  next.calibrationAccountability=[...(next.calibrationAccountability||[])];
  next.schemaVersion=27;
  next.productVersion='0.15.0';
  return next;
}

export function migrateV0150Phase1ToPhase3(state={}){
  const next=structuredCloneSafe(state);
  next.judgementForecasts=(next.judgementForecasts||[]).map(item=>({
    ...item,
    domain:item.domain||'unknown',
    challenge:item.challenge||item.contextKey?.split('|')?.[0]||'unknown'
  }));
  next.schemaVersion=26;
  next.productVersion='0.15.0';
  return next;
}

export function migrateV0144ToV0150Phase1(state={}){
  const next=structuredCloneSafe(state);
  next.judgementForecasts=[...(next.judgementForecasts||[])];
  next.schemaVersion=25;
  next.productVersion='0.15.0';
  return next;
}

export function migrateV0143ToV0144(state={}){
  const next=structuredCloneSafe(state);
  next.longitudinalAccountability=next.longitudinalAccountability||{
    lastReconciledAt:null,
    lastReport:null
  };
  next.schemaVersion=24;
  next.productVersion='0.14.4';
  return next;
}

export function migrateV0140Phase1ToPhase2(state={}){
  const next=structuredCloneSafe(state);
  next.patternTransfers=[...(next.patternTransfers||[])];
  next.schemaVersion=23;
  next.productVersion='0.14.0';
  return next;
}

export function migrateV0131ToV0140Phase1(state={}){
  const next=structuredCloneSafe(state);
  next.outcomeEpisodes=[...(next.outcomeEpisodes||[])];
  next.outcomePatterns=[...(next.outcomePatterns||[])];
  next.schemaVersion=22;
  next.productVersion='0.14.0';
  return next;
}

export function migrateV0130Phase1ToFinal(state={}){
  const next=structuredCloneSafe(state);
  next.outcomeAttributions=[...(next.outcomeAttributions||[])];
  next.schemaVersion=21;
  next.productVersion='0.13.0';
  return next;
}

export function migrateV0120ToV0130Phase1(state={}){
  const next=structuredCloneSafe(state);
  next.structuredReflections=[...(next.structuredReflections||[])];
  next.schemaVersion=20;
  next.productVersion='0.13.0';
  return next;
}

export function migrateV0120Phase3ToFinal(state={}){
  const next=structuredCloneSafe(state);
  next.followThroughIntegrity=next.followThroughIntegrity||{
    lastReconciledAt:null,
    lastReport:null
  };
  next.schemaVersion=19;
  next.productVersion='0.12.0';
  return next;
}

export function migrateV0120Phase2ToPhase3(state={}){
  const next=structuredCloneSafe(state);
  next.fallbackPlans=[...(next.fallbackPlans||[])];
  next.schemaVersion=18;
  next.productVersion='0.12.0';
  return next;
}

export function migrateV0120Phase1ToPhase2(state={}){
  const next=structuredCloneSafe(state);
  next.frictionPlans=[...(next.frictionPlans||[])];
  next.schemaVersion=17;
  next.productVersion='0.12.0';
  return next;
}

export function migrateV0110ToV0120Phase1(state={}){
  const next=structuredCloneSafe(state);
  next.commitments=[...(next.commitments||[])];
  next.schemaVersion=16;
  next.productVersion='0.12.0';
  return next;
}

export function migrateV0110Phase3ToFinal(state={}){
  const next=structuredCloneSafe(state);
  next.agencyIntegrity=next.agencyIntegrity||{
    lastReconciledAt:null,
    lastReport:null
  };
  next.schemaVersion=15;
  next.productVersion='0.11.0';
  return next;
}

export function migrateV0110Phase2ToPhase3(state={}){
  const next=structuredCloneSafe(state);
  next.outcomeRecords=[...(next.outcomeRecords||[])];
  next.schemaVersion=14;
  next.productVersion='0.11.0';
  return next;
}

export function migrateV0110Phase1ToPhase2(state={}){
  const next=structuredCloneSafe(state);
  next.preferenceModel=[...(next.preferenceModel||[])];
  next.schemaVersion=13;
  next.productVersion='0.11.0';
  return next;
}

export function migrateV0100ToV0110Phase1(state={}){
  const next=structuredCloneSafe(state);
  next.choiceLog=[...(next.choiceLog||[])];
  const mark=judgement=>judgement&&typeof judgement==='object'
    ?{...judgement,personChoice:judgement.personChoice||null}
    :judgement;
  next.judgements=(next.judgements||[]).map(mark);
  next.history=(next.history||[]).map(entry=>({...entry,decision:mark(entry.decision)}));
  if(next.current?.decision)next.current={...next.current,decision:mark(next.current.decision)};
  next.schemaVersion=12;
  next.productVersion='0.11.0';
  return next;
}

export function migrateV0100Phase2ToPhase3(state={}){
  const next=structuredCloneSafe(state);
  next.correctionAudit=[...(next.correctionAudit||[])];
  next.schemaVersion=11;
  next.productVersion='0.10.0';
  return next;
}

export function migrateV0100Phase1ToPhase2(state={}){
  const next=structuredCloneSafe(state);
  const mark=judgement=>{
    if(!judgement||typeof judgement!=='object')return judgement;
    return {
      ...judgement,
      minorityReports:[...(judgement.minorityReports||[])],
      deliberationTrace:judgement.deliberationTrace||null
    };
  };
  next.judgements=(next.judgements||[]).map(mark);
  next.history=(next.history||[]).map(entry=>({...entry,decision:mark(entry.decision)}));
  if(next.current?.decision)next.current={...next.current,decision:mark(next.current.decision)};
  next.schemaVersion=10;
  next.productVersion='0.10.0';
  return next;
}

export function migrateV090ToV0100Phase1(state={}){
  const next=structuredCloneSafe(state);
  const mark=judgement=>{
    if(!judgement||typeof judgement!=='object')return judgement;
    return {
      ...judgement,
      boundaries:judgement.boundaries||null
    };
  };
  next.judgements=(next.judgements||[]).map(mark);
  next.history=(next.history||[]).map(entry=>({...entry,decision:mark(entry.decision)}));
  if(next.current?.decision)next.current={...next.current,decision:mark(next.current.decision)};
  next.schemaVersion=9;
  next.productVersion='0.10.0';
  return next;
}

export function migrateV090Phase3ToFinal(state={}){
  const next=structuredCloneSafe(state);
  next.history=(next.history||[]).map(entry=>({
    ...entry,
    judgementId:entry.judgementId||entry.decision?.id||null
  }));
  next.integrity=next.integrity||{
    lastReconciledAt:null,
    lastReport:null
  };
  next.councilReports=[...(next.councilReports||[])];
  next.schemaVersion=8;
  next.productVersion='0.9.0';
  return next;
}

export function migrateV090Phase2ToPhase3(state={}){
  const next=structuredCloneSafe(state);
  const addValidity=judgement=>{
    if(!judgement||typeof judgement!=='object')return judgement;
    const createdAt=judgement.createdAt||new Date().toISOString();
    return {
      ...judgement,
      context:judgement.context||null,
      validity:judgement.validity||{
        status:['reviewed','abandoned'].includes(judgement.status)?'closed':'current',
        createdAt,
        validUntil:new Date(new Date(createdAt).getTime()+24*3600000).toISOString(),
        contextFingerprint:judgement.context||null,
        reviewTriggers:[
          'Material context change.',
          'Correction to information used.',
          'New safety or professional information.',
          'Validity expiry.'
        ],
        reviewReason:null,
        supersededBy:null
      }
    };
  };
  next.judgements=(next.judgements||[]).map(addValidity);
  next.history=(next.history||[]).map(entry=>({...entry,decision:addValidity(entry.decision)}));
  if(next.current?.decision)next.current={...next.current,decision:addValidity(next.current.decision)};
  next.schemaVersion=7;
  next.productVersion='0.9.0';
  return next;
}

export function migrateV090Phase1ToPhase2(state={}){
  const next=structuredCloneSafe(state);
  const memories=next.advisorMemories||{};
  for(const [advisor,memory] of Object.entries(memories)){
    memory.notes=(memory.notes||[]).map(note=>({
      advisor,
      practice:note.practice||note.context?.practice||null,
      contextKey:note.contextKey||[
        note.context?.challenge||'unknown',
        note.context?.soreness||'unknown',
        note.context?.emotionalLoad||'unknown'
      ].join('|'),
      confirmationSource:note.confirmationSource||null,
      outcomeCounts:note.outcomeCounts||{positive:0,neutral:0,negative:0},
      contexts:note.contexts||{},
      firstObservedAt:note.firstObservedAt||note.at||note.lastObservedAt||null,
      lastObservedAt:note.lastObservedAt||note.at||null,
      reviewAfter:note.reviewAfter||null,
      correction:note.correction||null,
      ...note,
      status:note.status||'candidate'
    }));
    for(const weight of Object.values(memory.weights||{})){
      if(weight&&typeof weight==='object'&&!weight.learningStatus)weight.learningStatus='candidate';
    }
  }
  next.schemaVersion=6;
  next.productVersion='0.9.0';
  return next;
}

export function migrateV081ToV090(state={}){
  const next=structuredCloneSafe(state);
  const memories=next.advisorMemories||{};
  for(const memory of Object.values(memories)){
    const weights=memory?.weights||{};
    for(const [practice,value] of Object.entries(weights)){
      if(Number.isFinite(Number(value))) weights[practice]={value:Number(value),observations:1,positive:Number(value)>0?1:0,neutral:0,negative:Number(value)<0?1:0,lastObservedAt:memory.updatedAt||null,contexts:{}};
    }
  }
  next.schemaVersion=5;
  next.productVersion='0.9.0';
  return next;
}

export function migrateV080ToV081(state={}){
  const next=structuredCloneSafe(state);
  next.history=(next.history||[]).map(migrateHistoryEntry);
  next.judgements=(next.judgements||[]).map(migrateDecision);
  if(next.current){
    next.current={...next.current,decision:migrateDecision(next.current.decision)};
  }
  next.schemaVersion=4;
  next.productVersion='0.8.1';
  return next;
}

function migrateHistoryEntry(entry){
  return {...entry,decision:migrateDecision(entry?.decision)};
}

function migrateDecision(decision){
  if(!decision || typeof decision!=='object') return decision;
  return {...decision,delta:migrateDelta(decision.delta)};
}

export function migrateDelta(delta){
  if(!delta || typeof delta!=='object') return delta;
  const next={...delta};
  if(next.recovery == null && next.legacy != null) next.recovery=next.legacy;
  delete next.legacy;
  if('overall' in next){
    next.overall=+Object.entries(next)
      .filter(([key,value])=>key!=='overall' && Number.isFinite(Number(value)))
      .reduce((sum,[,value])=>sum+Number(value),0).toFixed(2);
  }
  return next;
}

function structuredCloneSafe(value){
  if(typeof structuredClone==='function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
