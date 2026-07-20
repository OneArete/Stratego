export function buildAdaptationAccountability({
  phaseAdaptations={},
  phases=[],
  reflectionValue='unknown',
  fit='unknown',
  at=new Date().toISOString()
}={}){
  const choices=Object.entries(phaseAdaptations||{})
    .map(([index,record])=>{
      const phaseIndex=Number(index);
      const phase=phases?.[phaseIndex];
      return {
        phaseIndex,
        phaseName:String(phase?.[0]||`Phase ${phaseIndex+1}`),
        level:normaliseLevel(record?.level),
        selectedAt:record?.selectedAt||null,
        source:'person'
      };
    })
    .filter(item=>item.level)
    .sort((a,b)=>a.phaseIndex-b.phaseIndex);

  return {
    id:`adaptation-accountability-${Date.parse(at)||Date.now()}`,
    at,
    choices,
    choiceCount:choices.length,
    fit:normaliseFit(fit),
    reflectionValue,
    eligibleForPreferenceLearning:false,
    statement:buildStatement(choices,fit)
  };
}

export function hasPersonAdaptations(current){
  return Boolean(current?.phaseAdaptations&&Object.keys(current.phaseAdaptations).length);
}

export function adaptationReflectionPrompt(current,phases=[]){
  if(!hasPersonAdaptations(current))return null;
  const count=Object.keys(current.phaseAdaptations).length;
  return {
    count,
    title:count===1?'Did your chosen version fit?':'Did your chosen versions fit?',
    description:'This records what happened. It does not turn a single choice into a permanent preference.'
  };
}

export function adaptationAccountabilitySummary(record){
  if(!record?.choiceCount)return 'No in-session adaptation was selected.';
  const labels=record.choices.map(item=>`${item.phaseName}: ${labelForLevel(item.level)}`);
  return `${labels.join(' · ')} · fit: ${labelForFit(record.fit)}`;
}

function buildStatement(choices,fit){
  if(!choices.length)return 'No person-directed adaptation was used.';
  return `${choices.length} person-directed adaptation${choices.length===1?'':'s'} recorded; perceived fit: ${labelForFit(normaliseFit(fit))}.`;
}

function normaliseLevel(level){
  return ['regression','technique','progression'].includes(level)?level:null;
}

function normaliseFit(value){
  return ['better','right','worse','unknown'].includes(value)?value:'unknown';
}

function labelForLevel(level){
  return level==='regression'?'easier':level==='progression'?'harder':'standard';
}

function labelForFit(fit){
  return fit==='better'?'better than the suggested level'
    :fit==='right'?'about right'
      :fit==='worse'?'worse than the suggested level'
        :'not assessed';
}
