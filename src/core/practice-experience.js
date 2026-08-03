function clean(value){return String(value||'').trim()}

export function buildPracticeExperience({phase=[],guidance=null,adaptation=null,snapshot=null,paused=false,safetyPaused=false}={}){
  const name=clean(phase?.[0])||'Practice';
  const summary=clean(phase?.[2])||'Move with control.';
  const technique=Array.isArray(guidance?.technique)?guidance.technique.map(clean).filter(Boolean):[];
  const adaptedCue=clean(adaptation?.text);
  const cue=adaptedCue||technique[0]||summary;
  const nextName=clean(snapshot?.next?.name);
  const state=safetyPaused?'safety-paused':paused?'paused':'active';
  return {
    state,
    name,
    cue,
    summary,
    phaseLabel:snapshot?`Phase ${Number(snapshot.phaseIndex||0)+1} of ${Number(snapshot.totalPhases||1)}`:'Practice',
    progressLabel:snapshot?`${Math.round(Number(snapshot.progressRatio||0)*100)}%`:'',
    nextLabel:nextName?`Next: ${nextName}`:'Final phase',
    showTechnique:technique.length>1,
    hasGuidance:Boolean(guidance?.hasDetail),
    guidanceLabel:adaptedCue?'Adjust guidance':'View guidance',
    technique,
    statement:safetyPaused?'Pause. Reassess before continuing.':paused?'Take the time you need. Resume when ready.':'Stay with one cue at a time.'
  };
}

export function practiceExperienceAudit(model={}){
  return {
    primaryCues:model?.cue?1:0,
    automaticProgression:0,
    automaticAdaptation:0,
    safetyOverride:0,
    statement:'The focused Practice surface changes presentation only. Execution, safety and person control remain authoritative.'
  };
}
