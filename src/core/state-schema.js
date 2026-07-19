export const STATE_SCHEMA_VERSION = 8;
export const PRODUCT_VERSION = '0.9.0';

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
    settings:{...base.settings,...migratedSettings}
  };
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
