export const CODEX = [
  {
    id: 'strength',
    domain: 'body',
    goals: ['strength','movement-quality','physical-capacity'],
    intensity: 'moderate',
    levels: ['foundation','standard'],
    equipment: ['bodyweight','stable-support','optional-load'],
    contraindications: ['significant-soreness','sharp-pain','loss-of-control'],
    evidenceStatus: 'foundational',
    contentVersion: 1,
    name: 'Strength',
    durationOptions: [15, 30],
    virtue: 'Discipline',
    baseDelta: { body: 0.55, mind: 0.08, relationships: 0, purpose: 0.12, recovery: 0.02, agency: 0.27 },
    phases: [
      ['Prepare', 60, 'Breathe slowly. Set your posture.', ['Stand tall with feet under hips.', 'Relax the jaw and shoulders.', 'Take four slow breaths before starting.']],
      ['Push', 180, 'Controlled push-ups or incline push-ups.', ['Hands slightly wider than shoulders.', 'Keep head, trunk and hips aligned.', 'Lower under control; stop before form breaks.', 'Easier: hands on a table or wall. Harder: slower lowering.']],
      ['Pull', 180, 'Rows with a bar, table, or loaded bags.', ['Lead with the elbows and keep the chest open.', 'Pull shoulder blades back without shrugging.', 'Pause briefly at the top.', 'Use a stable table only if it safely supports your weight.']],
      ['Legs', 180, 'Slow squats. Full control.', ['Feet about shoulder-width apart.', 'Sit the hips back while knees follow the toes.', 'Keep the whole foot in contact with the floor.', 'Stand tall without locking the knees.']],
      ['Core', 120, 'Plank or dead bug.', ['Plank: squeeze glutes and keep ribs down.', 'Dead bug: keep the lower back gently against the floor.', 'Breathe throughout; quality matters more than duration.', 'Stop if you feel sharp pain in the back or shoulders.']],
      ['Close', 60, 'Stand still. Recover your breath.', ['Let breathing slow naturally.', 'Notice effort, tension and energy.', 'Finish with one calm, deliberate breath.']]
    ]
  },
  {
    id: 'recovery',
    domain: 'recovery',
    goals: ['downshift','mobility','restoration'],
    intensity: 'low',
    levels: ['foundation','standard'],
    equipment: ['none'],
    contraindications: ['dizziness','clear-distress-worsening'],
    evidenceStatus: 'foundational',
    contentVersion: 1,
    name: 'Recovery',
    durationOptions: [5, 15, 30],
    virtue: 'Temperance',
    baseDelta: { body: 0.28, mind: 0.24, relationships: 0.02, purpose: 0.04, recovery: 0, agency: 0.16 },
    phases: [
      ['Downshift', 120, 'Inhale for four. Exhale for six.', ['Breathe through the nose if comfortable.', 'Keep the exhale soft, long and unforced.', 'Let the shoulders descend with each exhale.']],
      ['Mobility', 300, 'Move slowly through shoulders, hips, and spine.', ['Use pain-free ranges only.', 'Move with the breath rather than forcing a stretch.', 'Circle shoulders, rotate the thoracic spine and open the hips.']],
      ['Walk', 360, 'Walk without your phone. Easy pace.', ['Keep the pace conversational.', 'Look into the distance instead of at the ground.', 'Let the arms swing naturally.']],
      ['Close', 60, 'Notice what changed.', ['Compare your breathing and muscle tension with the start.', 'Name one sensation without judging it.']]
    ]
  },
  {
    id: 'focus',
    domain: 'mind',
    goals: ['attention','task-completion','agency'],
    intensity: 'cognitive-moderate',
    levels: ['foundation','standard'],
    equipment: ['writing-surface','task-material'],
    contraindications: ['clear-distress-worsening'],
    evidenceStatus: 'foundational',
    contentVersion: 1,
    name: 'Focus',
    durationOptions: [15, 30, 60],
    virtue: 'Wisdom',
    baseDelta: { body: 0.02, mind: 0.56, relationships: 0, purpose: 0.24, recovery: 0.08, agency: 0.24 },
    phases: [
      ['Define', 60, 'Write the single outcome that matters.', ['Use one concrete sentence.', 'Make the result observable.', 'Remove every task that is not needed for this outcome.']],
      ['Deep Work', 720, 'One task. No switching.', ['Silence notifications.', 'Keep only the necessary window or material open.', 'When distracted, note it and return without self-criticism.']],
      ['Close', 60, 'Record the next clear step.', ['Write the exact action that restarts the work.', 'Leave the workspace ready for the next session.']]
    ]
  },
  {
    id: 'walk',
    domain: 'body',
    goals: ['light-movement','clarity','recovery'],
    intensity: 'low',
    levels: ['foundation','standard'],
    equipment: ['safe-walking-route'],
    contraindications: ['unsafe-environment','dizziness','sharp-pain'],
    evidenceStatus: 'foundational',
    contentVersion: 1,
    name: 'Walk',
    durationOptions: [5, 15, 30, 60],
    virtue: 'Balance',
    baseDelta: { body: 0.24, mind: 0.24, relationships: 0.02, purpose: 0.08, recovery: 0, agency: 0.12 },
    phases: [
      ['Begin', 60, 'Leave the screen behind.', ['Stand tall and release unnecessary tension.', 'Choose an easy route with minimal interruption.']],
      ['Walk', 720, 'Comfortable pace. Breathe through the nose when possible.', ['Let the stride remain natural.', 'Keep the pace easy enough to think clearly.', 'Notice three things around you without analysing them.']],
      ['Return', 60, 'Come back with one clear thought.', ['Slow down before stopping.', 'Keep one useful idea from the walk.']]
    ]
  },
  {
    id: 'connection',
    domain: 'relationships',
    goals: ['presence','support','understanding'],
    intensity: 'low',
    levels: ['foundation','standard'],
    equipment: ['none'],
    contraindications: ['unsafe-contact','clear-distress-worsening'],
    evidenceStatus: 'foundational',
    contentVersion: 1,
    name: 'Connection',
    durationOptions: [5, 15, 30],
    virtue: 'Justice',
    baseDelta: { body: 0, mind: 0.18, relationships: 0.58, purpose: 0.14, recovery: 0.08, agency: 0.18 },
    phases: [
      ['Choose', 30, 'Choose one person who matters.', ['Choose presence, not efficiency.', 'Decide what full attention will look like.']],
      ['Connect', 600, 'Call, listen, play, or be fully present.', ['Put the phone away unless it is the means of contact.', 'Ask one genuine question.', 'Listen without preparing the next reply.']],
      ['Close', 30, 'End without rushing to the next thing.', ['Acknowledge the person directly.', 'Notice how the interaction changed your state.']]
    ]
  },
  {
    id: 'direction',
    domain: 'purpose',
    goals: ['clarity','meaning','alignment'],
    intensity: 'cognitive-light',
    levels: ['foundation','standard'],
    equipment: ['writing-surface'],
    contraindications: ['clear-distress-worsening'],
    evidenceStatus: 'foundational',
    contentVersion: 1,
    name: 'Direction',
    durationOptions: [5, 15, 30],
    virtue: 'Integrity',
    baseDelta: { body: 0, mind: 0.14, relationships: 0.06, purpose: 0.6, recovery: 0.02, agency: 0.24 },
    phases: [
      ['Name', 60, 'Name what today\u2019s biggest task is actually for.', ['Write the task in one line.', 'Write, underneath it, the reason it matters \u2014 to you, not to anyone else.', 'If no reason comes, write that honestly instead of inventing one.']],
      ['Examine', 300, 'Check whether today\u2019s effort matches that reason.', ['Ask: does how I plan to spend today actually serve what I just wrote?', 'Notice any gap without judging it \u2014 a gap is information, not a failing.', 'If there is a gap, write the smallest adjustment that would close it.']],
      ['Declare', 60, 'Write one sentence you can return to today.', ['State the direction plainly: what you are choosing to prioritise and why.', 'Keep it short enough to remember without looking at it again.']]
    ]
  },
  {
    id: 'decisive-action',
    domain: 'agency',
    goals: ['self-efficacy','follow-through','momentum'],
    intensity: 'low',
    levels: ['foundation','standard'],
    equipment: ['task-material'],
    contraindications: ['clear-distress-worsening'],
    evidenceStatus: 'foundational',
    contentVersion: 1,
    name: 'Decisive Action',
    durationOptions: [5, 15, 30],
    virtue: 'Courage',
    baseDelta: { body: 0.06, mind: 0.1, relationships: 0, purpose: 0.16, recovery: 0, agency: 0.68 },
    phases: [
      ['Choose', 60, 'Choose the smallest action you have been avoiding.', ['Pick something concrete and specific, not a category of things.', 'Choose the smallest version of it \u2014 the part you could start in the next minute.', 'Do not choose something that requires anyone else\u2019s input first.']],
      ['Act', 480, 'Do it now, without over-preparing.', ['Begin before you feel fully ready \u2014 readiness is not the requirement.', 'If you notice yourself planning instead of acting, that is the signal to start.', 'Stop planning for perfection; a rough first attempt still counts.']],
      ['Close', 60, 'Notice what acting changed.', ['Name what shifted \u2014 in the task, or simply in how you feel.', 'If the action is incomplete, write the exact next small step.']]
    ]
  }
];


export const PRACTICE_LIBRARY_VERSION = 1;

export function validatePracticeLibrary(practices=CODEX){
  const required=['id','name','domain','goals','intensity','levels','equipment','contraindications','evidenceStatus','contentVersion','durationOptions','baseDelta','phases'];
  const ids=new Set();
  const records=(practices||[]).map(practice=>{
    const missing=required.filter(field=>{
      const value=practice?.[field];
      return value===undefined||value===null||(Array.isArray(value)&&value.length===0);
    });
    const duplicate=ids.has(practice?.id);
    if(practice?.id)ids.add(practice.id);
    const invalidDurations=!(practice?.durationOptions||[]).every(value=>Number.isFinite(Number(value))&&Number(value)>0);
    const invalidPhases=!(practice?.phases||[]).every(phase=>Array.isArray(phase)&&phase.length>=3&&Number(phase[1])>0);
    return {
      practiceId:practice?.id||'unknown',
      valid:!missing.length&&!duplicate&&!invalidDurations&&!invalidPhases,
      missing,
      duplicate,
      invalidDurations,
      invalidPhases
    };
  });
  return {
    version:PRACTICE_LIBRARY_VERSION,
    total:records.length,
    valid:records.filter(record=>record.valid).length,
    invalid:records.filter(record=>!record.valid).length,
    records,
    statement:records.every(record=>record.valid)
      ?'Every current Practice has the minimum canonical library contract.'
      :'One or more Practices are missing required canonical library metadata.'
  };
}

export function practiceLibraryCatalog(practices=CODEX){
  return (practices||[]).map(practice=>({
    id:practice.id,
    name:practice.name,
    domain:practice.domain,
    goals:[...(practice.goals||[])],
    intensity:practice.intensity,
    levels:[...(practice.levels||[])],
    equipment:[...(practice.equipment||[])],
    contraindications:[...(practice.contraindications||[])],
    evidenceStatus:practice.evidenceStatus,
    contentVersion:practice.contentVersion,
    durationOptions:[...(practice.durationOptions||[])],
    phaseCount:(practice.phases||[]).length
  }));
}

export function practiceLibrarySummary(catalog=practiceLibraryCatalog()){
  const domains=new Set((catalog||[]).map(item=>item.domain));
  const durations=new Set((catalog||[]).flatMap(item=>item.durationOptions));
  return {
    practices:(catalog||[]).length,
    domains:domains.size,
    durationOptions:durations.size,
    foundational:(catalog||[]).filter(item=>item.evidenceStatus==='foundational').length,
    statement:`${(catalog||[]).length} Practices across ${domains.size} domains with ${durations.size} distinct duration options.`
  };
}


/* v0.21.0 Phase 2 — contextual Practice eligibility, transparency only */
export function assessPracticeEligibility(practice,context={}){
  if(!practice)return {
    practiceId:'unknown',
    status:'unknown',
    reasons:['Practice metadata is unavailable.'],
    matchedContraindications:[],
    selectionInfluence:0
  };

  const reasons=[];
  const matchedContraindications=[];
  const soreness=String(context.soreness||'none').toLowerCase();
  const energy=Number(context.energy);
  const emotionalLoad=String(context.emotionalLoad||'usual').toLowerCase();
  const time=Number(context.time);

  if(practice.contraindications?.includes('significant-soreness')&&soreness==='significant'){
    matchedContraindications.push('significant-soreness');
    reasons.push('Significant soreness conflicts with the declared loading conditions for this Practice.');
  }
  if(['moderate','high'].includes(String(practice.intensity))&&energy===1){
    reasons.push('Low energy makes the standard intensity less suitable without adaptation.');
  }
  if(String(practice.intensity)==='cognitive-moderate'&&emotionalLoad==='heavy'){
    reasons.push('Heavy emotional load may reduce tolerance for sustained cognitive demand.');
  }
  if(Number.isFinite(time)&&time>0&&!practice.durationOptions?.some(duration=>Number(duration)<=time)){
    reasons.push('The available time is shorter than the minimum declared duration.');
  }

  const status=matchedContraindications.length
    ?'blocked'
    :reasons.length
      ?'caution'
      :'eligible';

  return {
    practiceId:practice.id,
    status,
    reasons:reasons.length?reasons:['No declared contextual conflict is visible from the current signals.'],
    matchedContraindications,
    selectionInfluence:0,
    assessedFrom:['soreness','energy','emotionalLoad','time'],
    statement:status==='blocked'
      ?'A declared contextual conflict is present.'
      :status==='caution'
        ?'The Practice remains available, but the current context calls for caution or adaptation.'
        :'No declared contextual conflict is visible.'
  };
}

export function assessPracticeLibraryEligibility(practices=CODEX,context={}){
  const items=(practices||[]).map(practice=>assessPracticeEligibility(practice,context));
  return {
    items,
    eligible:items.filter(item=>item.status==='eligible').length,
    caution:items.filter(item=>item.status==='caution').length,
    blocked:items.filter(item=>item.status==='blocked').length,
    selectionInfluence:0,
    statement:'Contextual eligibility is visible for accountability. Agora selection remains unchanged in Phase 2.'
  };
}

export function practiceEligibilitySummary(assessment){
  if(!assessment)return 'Eligibility assessment unavailable.';
  return `${assessment.status}: ${assessment.statement}`;
}


/* v0.21.0 Phase 4 — Practice content provenance */
export function snapshotPracticeContent(practice,{durationMinutes=null,phases=null,at=new Date().toISOString()}={}){
  if(!practice)return null;
  const executablePhases=(phases||practice.phases||[]).map(phase=>[
    phase[0],
    Number(phase[1]),
    phase[2],
    [...(phase[3]||[])]
  ]);
  return {
    practiceId:practice.id,
    practiceName:practice.name,
    domain:practice.domain,
    contentVersion:Number(practice.contentVersion)||1,
    libraryVersion:PRACTICE_LIBRARY_VERSION,
    evidenceStatus:practice.evidenceStatus,
    durationMinutes:Number(durationMinutes)||null,
    goals:[...(practice.goals||[])],
    intensity:practice.intensity,
    equipment:[...(practice.equipment||[])],
    contraindications:[...(practice.contraindications||[])],
    phases:executablePhases,
    phaseCount:executablePhases.length,
    snapshottedAt:at,
    source:'canonical-practice-library'
  };
}

export function assessPracticeContentProvenance(snapshot,practices=CODEX){
  if(!snapshot)return {
    status:'missing',
    currentVersion:null,
    historicalVersion:null,
    statement:'No Practice content snapshot was preserved for this session.'
  };
  const current=(practices||[]).find(practice=>practice.id===snapshot.practiceId);
  if(!current)return {
    status:'retired',
    currentVersion:null,
    historicalVersion:snapshot.contentVersion,
    statement:'This Practice no longer exists in the current library, but the historical content remains preserved.'
  };
  const currentVersion=Number(current.contentVersion)||1;
  const parsedHistoricalVersion=Number(snapshot.contentVersion);
  const historicalVersion=Number.isFinite(parsedHistoricalVersion)?parsedHistoricalVersion:1;
  const status=currentVersion===historicalVersion?'current':'historical';
  return {
    status,
    currentVersion,
    historicalVersion,
    libraryVersion:snapshot.libraryVersion,
    statement:status==='current'
      ?'This session used the current content version.'
      :`This session used content v${historicalVersion}; the current library now uses v${currentVersion}.`
  };
}

export function practiceContentSnapshotSummary(snapshot,assessment=assessPracticeContentProvenance(snapshot)){
  if(!snapshot)return 'Practice content provenance unavailable.';
  return `${snapshot.practiceName} · content v${snapshot.contentVersion} · library v${snapshot.libraryVersion} · ${assessment.status}`;
}

export function practiceContentProvenanceAudit(history=[],practices=CODEX){
  const records=(history||[])
    .filter(entry=>entry?.practiceContentSnapshot)
    .map(entry=>({
      historyId:entry.id||entry.judgementId||entry.completedAt||entry.abandonedAt,
      practiceId:entry.practiceContentSnapshot.practiceId,
      completedAt:entry.completedAt||entry.abandonedAt||entry.practiceContentSnapshot.snapshottedAt,
      snapshot:entry.practiceContentSnapshot,
      assessment:assessPracticeContentProvenance(entry.practiceContentSnapshot,practices)
    }));
  return {
    records,
    total:records.length,
    current:records.filter(record=>record.assessment.status==='current').length,
    historical:records.filter(record=>record.assessment.status==='historical').length,
    retired:records.filter(record=>record.assessment.status==='retired').length,
    missing:(history||[]).filter(entry=>!entry?.practiceContentSnapshot).length,
    statement:records.length
      ?'Historical Practice content remains distinguishable from the current library.'
      :'No completed or abandoned session has a Practice content snapshot yet.'
  };
}
