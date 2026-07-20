export function resolveStartupDestination(state){
  if(!state?.profile||!state?.onboardingVersion)return {route:'onboarding',reason:'onboarding-required',resumable:false};
  const current=state.current;
  if(!current)return {route:'today',reason:'no-active-flow',resumable:false};
  if(['paused','interrupted'].includes(current.execution?.status))return {route:'resumePrompt',reason:'practice-interrupted',resumable:true};
  if(current.execution?.status==='completed'&&!current.completed)return {route:'reflect',reason:'reflection-pending',resumable:true};
  if(current.execution?.status==='active')return {route:'resumePrompt',reason:'practice-recovered-after-reload',resumable:true};
  if(current.decision&&!current.startedAt)return {route:'judgement',reason:'judgement-pending',resumable:true};
  return {route:'today',reason:'safe-default',resumable:false};
}
export function buildContinuityNotice(state){
  const destination=resolveStartupDestination(state);
  const messages={
    'practice-interrupted':'Your Practice was preserved.',
    'practice-recovered-after-reload':'Your active Practice was recovered.',
    'reflection-pending':'Your Practice is complete. Reflection is still waiting.',
    'judgement-pending':'Your current judgement is still available.',
    'no-active-flow':'Today is ready.',
    'safe-default':'Today is ready.'
  };
  return {...destination,message:messages[destination.reason]||'Strategos is ready.'};
}
export function shouldShowContinuityCard(state){return resolveStartupDestination(state).resumable}
