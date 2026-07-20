export function buildPracticeSessionSnapshot({phases=[],execution=null,now=Date.now()}={}){
  if(!Array.isArray(phases)||!phases.length)return {phaseIndex:0,phaseCount:0,completedPhases:0,progressRatio:0,current:null,next:null,previous:null,remainingPracticeSeconds:0,elapsedPracticeSeconds:0};
  const phaseIndex=Math.max(0,Math.min(phases.length-1,Number(execution?.phaseIndex)||0));
  const current=normalisePhase(phases[phaseIndex],phaseIndex);
  const next=phaseIndex+1<phases.length?normalisePhase(phases[phaseIndex+1],phaseIndex+1):null;
  const previous=phaseIndex>0?normalisePhase(phases[phaseIndex-1],phaseIndex-1):null;
  const phaseRemaining=remainingPhaseSeconds(execution,current.duration,now);
  const completedDuration=phases.slice(0,phaseIndex).reduce((s,p)=>s+Number(p?.[1]||0),0);
  const currentElapsed=Math.max(0,current.duration-phaseRemaining);
  const totalDuration=phases.reduce((s,p)=>s+Number(p?.[1]||0),0);
  const elapsedPracticeSeconds=Math.min(totalDuration,completedDuration+currentElapsed);
  return {phaseIndex,phaseCount:phases.length,completedPhases:phaseIndex,progressRatio:totalDuration?+(elapsedPracticeSeconds/totalDuration).toFixed(4):0,current:{...current,remainingSeconds:phaseRemaining},next,previous,remainingPracticeSeconds:Math.max(0,Math.ceil(totalDuration-elapsedPracticeSeconds)),elapsedPracticeSeconds:Math.floor(elapsedPracticeSeconds)};
}
export function sessionCompletionRatio(phases=[],execution=null,now=Date.now()){return buildPracticeSessionSnapshot({phases,execution,now}).progressRatio}
export function canMovePhase(phases=[],execution=null,direction=1){if(!Array.isArray(phases)||!phases.length)return false;const i=Math.max(0,Math.min(phases.length-1,Number(execution?.phaseIndex)||0));const target=i+Math.sign(direction||1);return target>=0&&target<phases.length}
export function describePracticeResume(snapshot){if(!snapshot?.current)return 'The Practice can be resumed.';return `You were in “${snapshot.current.name}” with ${formatDuration(snapshot.current.remainingSeconds)} remaining.${snapshot.next?` Next: ${snapshot.next.name}.`:' This is the final phase.'}`}
export function practiceSessionSummary(snapshot){if(!snapshot?.phaseCount)return 'No active Practice session.';return `${snapshot.phaseIndex+1} of ${snapshot.phaseCount} phases · ${formatDuration(snapshot.remainingPracticeSeconds)} remaining`}
export function formatDuration(seconds){const safe=Math.max(0,Math.ceil(Number(seconds)||0)),m=Math.floor(safe/60),r=safe%60;if(m===0)return `${r}s`;if(r===0)return `${m} min`;return `${m}m ${r}s`}
function remainingPhaseSeconds(execution,duration,now){if(!execution)return duration;const started=Date.parse(execution.phaseStartedAt||'');if(!Number.isFinite(started))return duration;const endpoint=execution.status==='paused'&&execution.pausedAt?Date.parse(execution.pausedAt):now;const elapsed=Math.max(0,(endpoint-started)/1000-(Number(execution.totalPausedDuration)||0));return Math.max(0,Math.ceil(duration-elapsed))}
function normalisePhase(phase,index){return {index,name:String(phase?.[0]||`Phase ${index+1}`),duration:Math.max(0,Number(phase?.[1]||0)),summary:String(phase?.[2]||''),guidance:Array.isArray(phase?.[3])?phase[3]:[]}}
