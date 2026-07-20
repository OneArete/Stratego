import { loadState,saveState,resetState,createLocalBackup,ONBOARDING_VERSION } from './core/storage.js';
import { serializeStateExport,validateStateImport,createImportPreview,exportFilename } from './core/state-transfer.js';
import { buildUnderstanding } from './core/understanding.js';
import { conveneAgora } from './core/agora.js';
import { buildHumanGraph,projectHumanReturn } from './core/human-graph.js';
import { renderLivingGraph } from './components/living-graph.js';
import { unlockAudio,playTone,speak,stopVoice,previewVoice } from './core/audio.js';
import { buildExplanation } from './core/explain.js';
import { normalizeAdvisorMemories,learnFromReflection,advisorCoverage,buildMonthlyCouncil,learningReviewItems,updateLearningStatus,expireStaleLearnings } from './core/advisor-memory.js';
import { createExecutionState,remainingSeconds,pauseExecution,resumeExecution,startPhase,closeExecution,isResumable,EXECUTION_STATUS } from './core/execution-state.js';
import { buildPracticeSessionSnapshot,describePracticeResume,practiceSessionSummary,sessionCompletionRatio,canMovePhase } from './core/practice-session.js';
import { buildPracticeExitModel,canResumePractice,normalisePracticeExitReason } from './core/practice-exit.js';
import { buildPhaseGuidance,buildGuidanceDecision,shouldShowSafetyPanel } from './core/practice-guidance.js';
import { availableAdaptationLevels,resolveAdaptationChoice,setPhaseAdaptationChoice,getPhaseAdaptationChoice,adaptationChoiceSummary } from './core/practice-adaptation-choice.js';
import { buildAdaptationAccountability,hasPersonAdaptations,adaptationReflectionPrompt,adaptationAccountabilitySummary } from './core/practice-adaptation-accountability.js';
import { attachValidity,assessCandidateStability,assessJudgementValidity,markJudgementsForReview,supersedeJudgement,JUDGEMENT_VALIDITY } from './core/judgement-stability.js';
import { reconcileLongitudinalState,upsertMonthlyCouncilReport,journeyRecords } from './core/longitudinal-integrity.js';
import { buildDecisionBoundaries } from './core/decision-boundaries.js';
import { createCorrectionEvent,determineCorrectionImpact,applyCorrectionImpact,correctionAuditSummary,reconcileCorrectionAudit } from './core/correction-audit.js';
import { CHOICE_ACTIONS,createChoiceRecord,applyChoiceToJudgement,summarizeChoice,reconcileChoiceLog } from './core/person-choice.js';
import { createPreferenceCandidate,upsertPreferenceCandidate,applyPreferenceCorrection,expirePreferences,preferenceAudit } from './core/preference-governance.js';
import { createOutcomeRecord,markOutcomeStarted,markOutcomeCompleted,markOutcomeAbandoned,attachOutcomeReflection,learningEligibility,reconcileOutcomeRecords,outcomeSummary } from './core/choice-outcome.js';
import { reconcileAgencyState,agencyConsistencySnapshot,learningSourceSummary } from './core/agency-integrity.js';
import { createCommitment,commitmentAvailability,markCommitmentStarted,markCommitmentCompleted,cancelCommitment,reconcileCommitments,commitmentSummary } from './core/commitment-integrity.js';
import { createFrictionPlan,markFrictionEncountered,frictionReadiness,suggestedResponse,canBeginWithFriction,reconcileFrictionPlans,frictionSummary } from './core/friction-plan.js';
import { createFallbackPlan,acceptFallback,declineFallback,startFallback,completeFallback,abandonFallback,fallbackOutcomeRecord,fallbackLearningEligibility,reconcileFallbackPlans,fallbackSummary } from './core/adaptive-fallback.js';
import { reconcileFollowThroughState,followThroughSnapshot,followThroughSummary } from './core/follow-through-integrity.js';
import { createStructuredReflection,reflectionLearningSignal,reflectionContradiction,reflectionCompleteness,reconcileStructuredReflections,reflectionSummary } from './core/reflection-integrity.js';
import { createOutcomeAttribution,calibrateLearningWithAttribution,attributionContradiction,reconcileOutcomeAttributions,attributionSummary } from './core/outcome-attribution.js';
import { createOutcomeEpisode,upsertOutcomePattern,rejectOutcomePattern,reconcileOutcomePatterns,outcomePatternSummary } from './core/outcome-patterns.js';
import { assessPatternTransfer,createTransferRecord,rejectTransferRecord,reconcilePatternTransfers,transferSummary } from './core/pattern-transfer.js';
import { buildLongitudinalEvidence,longitudinalEvidenceSummary } from './core/longitudinal-evidence.js';
import { reconcileJudgementLongitudinalIntegrity,buildLongitudinalAuditEntry,longitudinalAccountabilitySummary } from './core/longitudinal-accountability.js';
import { createJudgementForecast,resolveJudgementForecast,predictionCalibrationSummary,confidenceCorrection,reconcileJudgementForecasts,forecastSummary } from './core/prediction-calibration.js';
import { buildContextCalibrationEvidence } from './core/calibration-governance.js';
import { detectCalibrationDrift,calibrationDriftCorrection,buildCalibrationAccountability,reconcileCalibrationAccountability,calibrationAccountabilitySummary } from './core/calibration-drift.js';
import { createReflectionDraft,updateReflectionDraft,restoreReflectionDraft,clearReflectionDraft,reconcileDailyContinuity } from './core/daily-continuity.js';
import { resolveStartupDestination,resolveContinuityDestination,buildContinuityNotice,shouldShowContinuityCard } from './core/startup-continuity.js';
const app=document.querySelector('#app');window.__strategosStarted=true;
const a11yStatus=document.querySelector('#a11y-status');
const announceStatus=message=>{if(!a11yStatus)return;a11yStatus.textContent='';requestAnimationFrame(()=>{a11yStatus.textContent=message||''})};
const focusCurrentScreen=()=>requestAnimationFrame(()=>{const target=app.querySelector('main.screen');if(target&&!target.matches(':focus'))target.focus({preventScroll:true})});
async function registerServiceWorker(){if(!('serviceWorker' in navigator)||!/^https?:$/.test(location.protocol))return;try{await navigator.serviceWorker.register('./service-worker.js',{scope:'./'})}catch(error){console.warn('Strategos offline support unavailable.',error)}}
registerServiceWorker();
function reconcileLoadedState(input){
  let next=reconcileDailyContinuity(input);
  next.preferenceModel=expirePreferences(next.preferenceModel||[]);
  next=reconcilePatternTransfers(reconcileOutcomePatterns(reconcileOutcomeAttributions(reconcileStructuredReflections(reconcileFallbackPlans(reconcileFrictionPlans(reconcileCommitments(next)))))));
  ({state:next}=reconcileJudgementLongitudinalIntegrity(reconcileJudgementForecasts(reconcileCalibrationAccountability(next))));
  ({state:next}=reconcileFollowThroughState(next));
  ({state:next}=reconcileAgencyState(reconcileLongitudinalState(reconcileCorrectionAudit(reconcileChoiceLog(reconcileOutcomeRecords(next)))).state));
  return next;
}
let state=reconcileLoadedState(loadState());saveState(state);const startupContinuity=buildContinuityNotice(state);let settingsNotice=state.persistenceWarning||'',selectedInsightId=null,context={sleep:3,energy:2,time:15,challenge:'body',soreness:'none',emotionalLoad:'usual'},decision=null,timer=null,secondsLeft=0,phaseIndex=0,paused=false,wakeLock=null,onboardingStep=0,onboardingDraft={name:''};
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const vibrate=(p=12)=>{if(state.settings.haptics)navigator.vibrate?.(p)};
const persist=()=>{const result=saveState(state);if(!result.ok){settingsNotice=result.error;state.persistenceWarning=result.error}return result};
const setNotice=message=>{settingsNotice=message||''};
const shell=(content,cls='')=>app.innerHTML=`<main class="screen ${cls}" tabindex="-1" role="main">${content}</main>`;
const deltaMark=(size='large')=>`<svg class="delta ${size}" viewBox="0 0 140 140" aria-label="OneArete Delta"><circle class="ring" cx="70" cy="70" r="56"/><path class="glyph" d="M70 25 L112 108 M112 108 L28 108 M28 108 L63 39"/></svg>`;
const button=(label,action,secondary=false)=>`<button class="action ${secondary?'secondary':''}" data-action="${action}">${label}</button>`;
const header=(title='STRATEGOS',right='')=>`<header>${deltaMark('small')}<span>${title}</span>${right}</header>`;
const nav=active=>`<nav class="tabbar" aria-label="Primary navigation">${[['today','◉','Today'],['understanding','◇','Understanding'],['journey','↗','Journey'],['settings','••','Settings']].map(([a,i,l])=>`<button class="${active===a?'active':''}" data-action="${a}" aria-current="${active===a?'page':'false'}"><span class="tab-icon" aria-hidden="true">${i}</span><span>${l}</span></button>`).join('')}</nav>`;
const ROUTES={splash,onboarding,today,thinking,judgement,execute,resumePrompt,practiceExit,reflect,journal,understanding,correctUnderstanding,journey,settings,guide};
const HISTORY_ROUTES=new Set(['today','thinking','understanding','journey','settings','guide','judgement','reflect','resumePrompt']);
let currentRoute='splash',deliberationCycle=null,deliberationTimeout=null,deliberationRun=0,guideFocus='overview',practiceExitSource='active';
function cancelDeliberation(){if(deliberationCycle)clearInterval(deliberationCycle);if(deliberationTimeout)clearTimeout(deliberationTimeout);deliberationCycle=null;deliberationTimeout=null;deliberationRun+=1}
function route(name,{history='push',preserveScroll=false}={}){
  const next=ROUTES[name]?name:'splash';
  clearInterval(timer);timer=null;cancelDeliberation();stopVoice();
  currentRoute=next;
  if(HISTORY_ROUTES.has(next)){
    const statePayload={strategosRoute:next};
    const url=`#${next}`;
    if(history==='replace'||!window.history.state?.strategosRoute)window.history.replaceState(statePayload,'',url);
    else if(history==='push'&&window.history.state?.strategosRoute!==next)window.history.pushState(statePayload,'',url);
  }
  ROUTES[next]();
  if(!preserveScroll)window.scrollTo(0,0);
  focusCurrentScreen();
}
function rerenderJudgementAt(selector){
  route('judgement',{history:'none',preserveScroll:true});
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const target=document.querySelector(selector);
    if(target)target.scrollIntoView({behavior:'smooth',block:'center'});
  }));
}
window.addEventListener('popstate',event=>{
  const next=event.state?.strategosRoute||location.hash.replace('#','')||'today';
  route(ROUTES[next]?next:'today',{history:'none'});
});
function splash(){shell(`${deltaMark()}<div class="brand"><div class="eyebrow">ONEARETE</div><h1>STRATEGOS</h1><p>Understand first.<br/>Act deliberately.</p></div><button class="tap" data-action="begin">Tap to begin</button>`,'splash')}
function onboarding(){const steps=[`${header('WELCOME')}<section class="stack onboarding"><p class="eyebrow">A DELIBERATIVE COMPANION</p><h2>I will begin by listening.</h2><p class="muted">Strategos learns gradually, explains its judgement and leaves every choice with you.</p><div class="onboarding-mark">${deltaMark()}</div>${button('CONTINUE','onboarding-next')}</section>`,`${header('YOUR COMPANION')}<section class="stack onboarding"><p class="eyebrow">RELATIONSHIP BEFORE PROFILE</p><h2>What should I call you?</h2><p class="muted">That is enough for today. Everything else can be learned in context, over time.</p><input class="name-input" id="onboarding-name" autocomplete="given-name" value="${esc(onboardingDraft.name)}" placeholder="Your name"/>${button('BEGIN','onboarding-complete')}</section>`];shell(steps[onboardingStep]||steps[0])}
function today(){const name=state.profile?.name||'';const continuity=buildContinuityNotice(state);const graph=buildHumanGraph(state.history,context);const latest=state.judgements.find(j=>!['reviewed','abandoned'].includes(j.status));const validity=latest?assessJudgementValidity(latest,context):null;if(latest&&validity&&validity.status!==latest.validity?.status){latest.validity=validity;persist()}const reviewNotice=validity&&[JUDGEMENT_VALIDITY.REVIEW_REQUIRED,JUDGEMENT_VALIDITY.EXPIRED].includes(validity.status)?`<section class="judgement-review-notice"><p class="eyebrow">JUDGEMENT REVIEW</p><strong>${validity.status===JUDGEMENT_VALIDITY.EXPIRED?'The previous judgement has expired.':'The previous judgement needs review.'}</strong><p>${esc(validity.reviewReason)}</p></section>`:'';shell(`${header('TODAY','<button class="icon-btn" aria-label="Open settings" data-action="settings">•••</button>')}${shouldShowContinuityCard(state)?`<section class="continuity-card"><div><p class="eyebrow">CONTINUE</p><h3>${esc(continuity.message)}</h3></div><button class="action secondary" data-action="continue-flow">RESUME</button></section>`:''}<section class="stack observe-stack"><div><p class="eyebrow">BEFORE WE DECIDE</p><h2>${greeting()}${name?`, ${esc(name)}`:''}.</h2><p class="muted">I would like to understand how today looks.</p></div>${renderLivingGraph(graph,{compact:true})}<button class="context-help" data-guide-section="graph">What is the Living Human Graph?</button>${reviewNotice}<div class="signal-panel"><p class="eyebrow">TODAY'S SIGNALS</p>${question('How did you sleep?','sleep',[[4,'Excellent'],[3,'Good'],[2,'Fair'],[1,'Poor']])}${question('Energy','energy',[[3,'High'],[2,'Medium'],[1,'Low']])}${question('Time available','time',[[5,'5'],[15,'15'],[30,'30'],[60,'60+']])}${question('What has the strongest claim on today?','challenge',[['body','Body'],['mind','Mind'],['focus','Focus'],['recovery','Recovery'],['family','Family'],['work','Work']])}${question('Physical soreness','soreness',[['none','None'],['mild','Mild'],['significant','Significant']])}${question('Emotional load','emotionalLoad',[['light','Light'],['usual','Usual'],['heavy','Heavy']])}</div>${button('CONVENE THE AGORA','consult')}</section>${nav('today')}`)}
function question(title,key,opts){return `<div class="question"><h3>${title}</h3><div class="choice-row" role="group" aria-label="${title}">${opts.map(([v,l])=>`<button class="pill ${context[key]===v?'selected':''}" data-key="${key}" data-value="${v}" aria-pressed="${context[key]===v?'true':'false'}">${l}${key==='time'?' min':''}</button>`).join('')}</div></div>`}
function thinking(){shell(`<div class="agora-orbit">${deltaMark()}</div><div class="thinking-copy"><p class="eyebrow">THE AGORA</p><h2>The council is deliberating.</h2><div class="advisor-lights">${['Body','Recovery','Mind','Agency','Purpose','Relationships'].map(x=>`<span><i></i>${x}</span>`).join('')}</div><p id="thinking-line" class="muted">Listening to each perspective…</p></div>`,'thinking');const lines=['Listening to each perspective…','Testing competing priorities…','Forming a prudent judgement…','Preparing an explanation…'];let i=0;const run=deliberationRun;deliberationCycle=setInterval(()=>{const el=document.querySelector('#thinking-line');if(el)el.textContent=lines[Math.min(++i,lines.length-1)]},520);deliberationTimeout=setTimeout(()=>{if(run!==deliberationRun||currentRoute!=='thinking')return;clearInterval(deliberationCycle);deliberationCycle=null;const targetContextKey=[context.challenge||'unknown',context.soreness||'unknown',context.emotionalLoad||'unknown'].join('|');for(const pattern of state.outcomePatterns||[]){const assessment=assessPatternTransfer(pattern,{targetContextKey,targetPracticeId:pattern.practiceId});if(assessment.applies){const record=createTransferRecord({pattern,targetContextKey,assessment});state.patternTransfers=[record,...(state.patternTransfers||[]).filter(item=>!(item.patternId===record.patternId&&item.targetContextKey===record.targetContextKey))].slice(0,100)}}const understanding=buildUnderstanding(context,state.history);const longitudinalEvidence=buildLongitudinalEvidence({patterns:state.outcomePatterns,transfers:state.patternTransfers,context});let candidate=attachValidity(conveneAgora(context,understanding,state.history,state.advisorMemories,longitudinalEvidence,null),context);candidate.calibrationEvidence=buildContextCalibrationEvidence(state.judgementForecasts,{judgement:candidate,context});candidate.calibrationDrift=detectCalibrationDrift(state.judgementForecasts,{domain:candidate.domain||candidate.practice?.domain||context.challenge,practiceId:candidate.practice?.id||'unknown',challenge:context.challenge});const driftCorrection=calibrationDriftCorrection(candidate.calibrationDrift);if(candidate.calibrationEvidence.status==='applied'||driftCorrection.applies){candidate.baseConfidence=candidate.confidence;const totalCalibrationAdjustment=Number(candidate.calibrationEvidence.adjustment||0)+Number(driftCorrection.adjustment||0);candidate.confidence=Math.max(45,Math.min(90,Math.round((candidate.confidence+totalCalibrationAdjustment*100)*10)/10));candidate.confidenceLevel=confidenceLabel(candidate.confidence);candidate.confidenceCalibration={applied:true,adjustment:totalCalibrationAdjustment,confidence:candidate.confidence,driftAdjustment:driftCorrection.adjustment};const accountability=buildCalibrationAccountability({calibrationEvidence:candidate.calibrationEvidence,drift:candidate.calibrationDrift,judgementId:candidate.id});state.calibrationAccountability=[accountability,...(state.calibrationAccountability||[]).filter(item=>item.judgementId!==candidate.id)].slice(0,200)}candidate.explain=buildExplanation(candidate,context);candidate.boundaries=buildDecisionBoundaries(candidate,context);const previous=state.current?.decision;const previousContext=state.current?.context||previous?.context;const stability=assessCandidateStability(previous,candidate,previousContext,context);if(stability.action==='retain-previous'){decision={...previous,stability:{...stability,retainedAt:new Date().toISOString()}};decision.boundaries=buildDecisionBoundaries(decision,context);state.current={...state.current,context:{...context},decision};}else{decision={...candidate,stability};if(previous){const index=state.judgements.findIndex(item=>item.id===previous.id);if(index>=0)state.judgements[index]=supersedeJudgement(state.judgements[index],decision.id);}state.current={context:{...context},decision,startedAt:null};state.judgements.unshift({...decision,status:'proposed'});state.judgements=state.judgements.slice(0,100);}const forecast=createJudgementForecast({judgement:decision,context,expectedEffect:'better',confidence:decision.confidence>=75?'high':decision.confidence>=60?'medium':'low'});state.judgementForecasts=[forecast,...(state.judgementForecasts||[]).filter(item=>item.judgementId!==decision.id)].slice(0,200);state.current={...(state.current||{}),forecastId:forecast.id};persist();route('judgement',{history:'replace'})},2350)}
function judgement(){
  decision ||= state.current?.decision;
  if(!decision)return route('today');

  const d=decision;
  const p=d.practice;
  const ex=d.explain||buildExplanation(d,context);
  const boundaries=d.boundaries||buildDecisionBoundaries(d,context);
  const decisive=(ex.decisiveFactors||[]).slice(0,2);
  const currentForecast=state.judgementForecasts.find(item=>item.id===state.current?.forecastId||item.judgementId===d.id);

  shell(`${header('CURRENT JUDGEMENT','<button class="icon-btn" aria-label="Close and return to Today" data-action="today">×</button>')}
    <section class="judgement-focus">
      <div class="judgement-focus-head">
        <p class="eyebrow">MY CURRENT JUDGEMENT</p>
        <h2>${esc(d.judgement)}</h2>
        <div class="judgement-meta"><span>${esc(d.confidenceLevel||confidenceLabel(d.confidence))} confidence</span><span>${d.duration} min</span></div>
      </div>

      <section class="practice-proposal focused-practice">
        <div><p class="eyebrow">PRACTICE</p><h2>${esc(p.name)}</h2><p>${esc(d.intention)}</p></div>
        <div class="delta-score"><span>EXPECTED HUMAN RETURN</span><strong>+${d.delta.overall.toFixed(2)}</strong></div>
      </section>

      <section class="judgement-rationale">
        <p class="eyebrow">WHY THIS, TODAY</p>
        <p>${esc(ex.confidenceStatement)}</p>
        ${decisive.length?`<ul>${decisive.map(item=>`<li><strong>${esc(item.advisor)}</strong> — ${esc(item.reason)}</li>`).join('')}</ul>`:''}
        ${boundaries.runnerUp?`<p class="nearest-alternative">Nearest alternative: <strong>${esc(boundaries.runnerUp.name)}</strong></p>`:''}
      </section>

      ${d.calibrationDrift?.drift?`<section class="compact-caution"><strong>Confidence reduced.</strong><span>Recent forecast calibration has deteriorated.</span></section>`:''}
      ${currentForecast?`<section class="compact-forecast"><span>Forecast</span><strong>${esc(forecastSummary(currentForecast))}</strong></section>`:''}

      <button class="reasoning-link" data-action="understanding">See the full reasoning in Understanding</button><button class="context-help" data-guide-section="judgement">How do I use this judgement?</button>

      <section class="person-choice focused-choice">
        <p class="eyebrow">YOUR CHOICE</p>
        <h3>Strategos advises. You decide.</h3>
        <div class="choice-actions">
          <button data-choice-action="accept">Accept judgement</button>
          ${boundaries.runnerUp?`<button data-choice-action="choose-alternative" data-choice-practice="${esc(boundaries.runnerUp.id)}">Choose ${esc(boundaries.runnerUp.name)}</button>`:''}
          <button data-choice-action="defer">Decide later</button>
          <button data-choice-action="decline">Decline</button>
        </div>
        ${d.personChoice?`<p class="choice-record">${esc(summarizeChoice(d.personChoice))}</p>`:''}
      </section>

      ${(d.status==='accepted'||d.status==='overridden')?`<section class="commitment-panel" id="commitment-panel"><p class="eyebrow">VOLUNTARY COMMITMENT</p><h3>When do you intend to begin?</h3><p class="muted">A temporary start window, never an obligation.</p>${state.current?.commitmentId?(()=>{const c=state.commitments.find(item=>item.id===state.current.commitmentId),f=state.frictionPlans.find(item=>item.id===state.current?.frictionPlanId);return c?`<p class="commitment-status">${esc(commitmentSummary(c))}</p><div class="friction-prep"><h4>What could get in the way?</h4>${f?`<p>${esc(frictionSummary(f))}</p><small>${esc(f.response||suggestedResponse(f.frictionType))}</small>${f.fallback?`<small>Fallback: ${esc(f.fallback)}</small>`:''}${state.current?.fallbackPlanId?(()=>{const fp=state.fallbackPlans.find(item=>item.id===state.current.fallbackPlanId);return fp?`<div class="fallback-card"><p>${esc(fallbackSummary(fp))}</p><small>${esc(fp.scope)} · ${Math.round(fp.reductionRatio*100)}% scale</small><div class="fallback-actions">${fp.status==='proposed'?`<button data-fallback-action="accept">Use fallback</button><button data-fallback-action="decline">Keep original</button>`:''}</div></div>`:''})():`<button data-fallback-action="create">Create adaptive fallback</button>`}`:`<div class="friction-actions">${['time','environment','energy','emotion','social','uncertainty','other'].map(type=>`<button data-friction-type="${type}">${type}</button>`).join('')}</div>`}</div><div class="commitment-actions" id="commitment-start">${commitmentAvailability(c).canStart&&canBeginWithFriction(c,f).canBegin?button('BEGIN PRACTICE','commit'):''}<button data-commitment-action="cancel">Cancel commitment</button></div>`:''})():`<div class="commitment-actions" id="commitment-options"><button data-commitment-action="now">Begin within 30 minutes</button><button data-commitment-action="later">Schedule for later</button></div>`}</section>`:''}

      <div class="bottom-actions"><button class="text-btn" data-action="speak-judgement">Hear this judgement</button><button class="text-btn" data-action="today">Reassess today</button></div>
    </section>
    ${nav('today')}`)
}
async function requestWakeLock(){if(!state.settings.keepAwake||!('wakeLock'in navigator))return;try{wakeLock=await navigator.wakeLock.request('screen')}catch(_){}}
function releaseWakeLock(){try{wakeLock?.release()}catch(_){}wakeLock=null}
function execute(){
  const d=decision||state.current?.decision;if(!d)return route('today');
  const phases=d.practice.phases,total=d.duration*60,source=phases.reduce((a,x)=>a+x[1],0),scale=total/source;
  phaseIndex=0;paused=false;
  state.current.adjusted=phases.map(x=>[x[0],Math.max(20,Math.round(x[1]*scale)),x[2],x[3]||[]]);
  state.current.startedAt=new Date().toISOString();
  state.current.execution={...createExecutionState(state.current.adjusted),startedAt:state.current.startedAt};
  const outcomeIndex=state.outcomeRecords.findIndex(item=>item.id===state.current.outcomeRecordId);
  if(outcomeIndex>=0)state.outcomeRecords[outcomeIndex]=markOutcomeStarted(state.outcomeRecords[outcomeIndex],d.practice.id,state.current.startedAt);
  updateJudgementStatus('in-practice');
  persist();requestWakeLock();playTone('begin',state.settings.sound);runPhase(state.current.adjusted,{announce:true});
}
function resumePrompt(){
  const d=state.current?.decision,execution=state.current?.execution;
  if(!d||!isResumable(execution))return route('today');
  const snapshot=buildPracticeSessionSnapshot({phases:state.current.adjusted,execution});
  shell(`${header('PRACTICE PAUSED')}<section class="stack center resume-practice"><p class="eyebrow">AN INTERRUPTED PRACTICE</p><h2>${esc(d.practice.name)}</h2><p class="muted">${esc(describePracticeResume(snapshot))}</p><div class="resume-session-summary"><strong>${esc(practiceSessionSummary(snapshot))}</strong><span>${Math.round(snapshot.progressRatio*100)}% complete</span></div>${snapshot.next?`<div class="resume-next"><span>Next</span><strong>${esc(snapshot.next.name)}</strong></div>`:''}${button('RESUME PRACTICE','resume-practice')}${button('END AND RECORD','end-interrupted',true)}<button class="text-btn" data-action="discard-interrupted">Discard this session</button></section>`);
}
function practiceExit(){
  const d=state.current?.decision,execution=state.current?.execution;
  if(!d||!canResumePractice(execution))return route('today');

  if(execution.status===EXECUTION_STATUS.ACTIVE){
    state.current.execution=pauseExecution(execution);
    persist();
  }

  const model=buildPracticeExitModel({phases:state.current.adjusted,execution:state.current.execution});
  shell(`${header('PRACTICE')}<section class="stack practice-exit-screen">
    <div><p class="eyebrow">YOUR CONTROL</p><h2>${esc(model.title)}</h2><p class="muted">${esc(model.statement)}</p></div>
    <div class="practice-exit-progress"><strong>${model.percent}% complete</strong><span>${esc(practiceSessionSummary(model.snapshot))}</span></div>
    <div class="practice-exit-actions">
      <button class="action primary" data-action="continue-practice">Continue Practice</button>
      <button class="action secondary" data-action="record-practice-exit">End and record</button>
      <p>${esc(model.recordStatement)}</p>
      <button class="danger-btn subtle" data-action="discard-practice-session">Discard session</button>
      <p>${esc(model.discardStatement)}</p>
    </div>
  </section>`);
}
function runPhase(phases,{announce=false}={}){
  const execution=state.current?.execution;
  if(!execution)return route('today');
  phaseIndex=execution.phaseIndex;
  const p=phases[phaseIndex];if(!p)return finishPractice();
  paused=execution.status===EXECUTION_STATUS.PAUSED;
  secondsLeft=remainingSeconds(execution);
  const phaseGuidance=buildPhaseGuidance({phase:p,practice:(decision||state.current.decision).practice,context});
  const guidanceDecision=buildGuidanceDecision({guidance:phaseGuidance,experience:state.profile?.experience,context});
  const selectedAdaptation=getPhaseAdaptationChoice(state.current,phaseIndex);
  const adaptationChoice=resolveAdaptationChoice({guidance:phaseGuidance,recommendedLevel:guidanceDecision.appliedLevel||guidanceDecision.requestedLevel,selectedLevel:selectedAdaptation});
  const recommendedGuidance=adaptationChoice.text?{level:adaptationChoice.appliedLevel,text:adaptationChoice.text}:guidanceDecision.recommendation;
  if(announce){playTone('phase',state.settings.sound);speak(state.settings.voice==='guided'?phaseGuidance.voiceCue:`${p[0]}.`,state.settings.voice,true);announceStatus(`Phase ${phaseIndex+1} of ${phases.length}: ${p[0]}`)}
  const snapshot=buildPracticeSessionSnapshot({phases,execution});
  shell(`<header><span class="eyebrow">PRACTICE IN PROGRESS</span><button class="icon-btn" aria-label="End practice" data-action="abandon">×</button></header><section class="execution"><div class="practice-session-strip"><span>${phaseIndex+1} / ${phases.length}</span><strong>${esc(practiceSessionSummary(snapshot))}</strong></div><p class="practice-intention">${esc((decision||state.current.decision).intention)}</p><h2>${p[0]}</h2><div class="clock" id="clock" role="timer" aria-label="Time remaining">${formatTime(secondsLeft)}</div><p class="phase-summary">${p[2]}</p>${snapshot.next?`<div class="next-phase-card"><span>NEXT</span><strong>${esc(snapshot.next.name)}</strong><small>${formatTime(snapshot.next.duration)}</small></div>`:`<div class="next-phase-card final"><span>FINAL PHASE</span><strong>Reflection follows</strong></div>`}${phaseGuidance.hasDetail?`<section class="practice-guidance-card">${recommendedGuidance?`<div class="guidance-recommendation" data-active-adaptation="${esc(adaptationChoice.appliedLevel||'none')}"><span>${esc(adaptationChoiceSummary(adaptationChoice).toUpperCase())}</span><strong id="active-guidance-text">${esc(recommendedGuidance.text)}</strong>${adaptationChoice.personSelected?`<small>Your choice overrides today’s suggested level for this phase only.</small>`:guidanceDecision.adapted?`<small>${esc(guidanceDecision.reason)}</small>`:''}</div>`:''}${availableAdaptationLevels(phaseGuidance).length>1?`<div class="adaptation-choice" role="group" aria-label="Choose guidance level">${availableAdaptationLevels(phaseGuidance).map(level=>`<button data-adaptation-level="${level}" aria-pressed="${adaptationChoice.appliedLevel===level?'true':'false'}" class="${adaptationChoice.appliedLevel===level?'selected':''}">${level==='regression'?'Easier':level==='progression'?'Harder':'Standard'}</button>`).join('')}</div>`:''}<details class="exercise-guide" open><summary>Technique</summary><ul>${phaseGuidance.technique.map(x=>`<li>${esc(x)}</li>`).join('')||'<li>Move slowly enough to preserve control.</li>'}</ul></details>${phaseGuidance.regression.length?`<details class="exercise-guide"><summary>Easier version</summary><ul>${phaseGuidance.regression.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>`:''}${phaseGuidance.progression.length?`<details class="exercise-guide"><summary>Harder version</summary><ul>${phaseGuidance.progression.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>`:''}${shouldShowSafetyPanel(phaseGuidance)?`<details class="exercise-guide safety-guide"><summary>Safety</summary><ul>${[...phaseGuidance.cautions,...phaseGuidance.stopSignals].map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>`:''}</section>`:''}<div class="progress"><span id="phase-progress"></span></div><div class="practice-total-progress"><span id="practice-progress" style="width:${Math.round(snapshot.progressRatio*100)}%"></span></div></section><div class="practice-controls"><button class="round-control" aria-label="Previous phase" data-action="previous-phase" ${canMovePhase(phases,execution,-1)?'':'disabled'}>‹</button><button class="pause-control" aria-label="${paused?'Resume practice':'Pause practice'}" data-action="pause">${paused?'Resume':'Pause'}</button><button class="round-control" aria-label="Next phase" data-action="next-phase" ${canMovePhase(phases,execution,1)?'':'disabled'}>›</button></div>`,'execute');
  clearInterval(timer);let lastCountdown=null;
  const refresh=()=>{
    const current=state.current?.execution;if(!current)return;
    secondsLeft=remainingSeconds(current);
    const c=document.querySelector('#clock'),bar=document.querySelector('#phase-progress'),totalBar=document.querySelector('#practice-progress');
    if(c)c.textContent=formatTime(secondsLeft);
    if(bar)bar.style.width=`${100*(1-secondsLeft/current.phaseDuration)}%`;
    if(totalBar){const session=buildPracticeSessionSnapshot({phases,execution:current});totalBar.style.width=`${Math.round(session.progressRatio*100)}%`}
    if(current.status===EXECUTION_STATUS.ACTIVE&&secondsLeft<=3&&secondsLeft>0&&lastCountdown!==secondsLeft){lastCountdown=secondsLeft;playTone('countdown',state.settings.sound);if(secondsLeft===3)announceStatus('Three seconds remaining in this phase')}
    if(current.status===EXECUTION_STATUS.ACTIVE&&secondsLeft<=0){clearInterval(timer);advancePhase(1)}
  };
  refresh();timer=setInterval(refresh,250);
}
function advancePhase(direction){
  const phases=state.current?.adjusted;if(!phases)return route('today');
  const next=Math.max(0,(state.current.execution?.phaseIndex||0)+direction);
  if(next>=phases.length)return finishPractice();
  state.current.execution=startPhase(state.current.execution,phases,next);
  persist();runPhase(phases,{announce:true});
}
function togglePause(){
  const current=state.current?.execution;if(!current)return;
  state.current.execution=current.status===EXECUTION_STATUS.PAUSED?resumeExecution(current):pauseExecution(current);
  paused=state.current.execution.status===EXECUTION_STATUS.PAUSED;
  persist();runPhase(state.current.adjusted,{announce:false});playTone(paused?'pause':'resume',state.settings.sound);announceStatus(paused?'Practice paused':'Practice resumed');
}
function updateJudgementStatus(status,extra={}){const id=state.current?.decision?.id;const j=state.judgements.find(x=>x.id===id);if(j){Object.assign(j,{status,...extra});if(['reviewed','abandoned'].includes(status))j.validity={...(j.validity||{}),status:JUDGEMENT_VALIDITY.CLOSED,closedAt:new Date().toISOString()}}}
function discardPracticeSession(reason='person-discarded'){
  if(!state.current)return route('today');
  const discardedAt=new Date().toISOString();
  const outcomeIndex=state.outcomeRecords.findIndex(item=>item.id===state.current.outcomeRecordId);
  if(outcomeIndex>=0){
    state.outcomeRecords[outcomeIndex]=markOutcomeAbandoned(
      state.outcomeRecords[outcomeIndex],
      {reason:normalisePracticeExitReason(reason),completedPhases:0,totalPhases:state.current.adjusted?.length||0,at:discardedAt}
    );
  }
  updateJudgementStatus('abandoned',{closureReason:normalisePracticeExitReason(reason),discarded:true});
  state=clearReflectionDraft(state);
  state.current=null;
  decision=null;
  releaseWakeLock();
  persist();
  announceStatus('Practice session discarded.');
  route('today');
}
function abandonPractice(reason='person-ended'){
  if(!state.current)return route('today');
  state.current.execution=closeExecution(state.current.execution||{},EXECUTION_STATUS.ABANDONED,{reason});
  const abandonedAt=new Date().toISOString();
  const outcomeIndex=state.outcomeRecords.findIndex(item=>item.id===state.current.outcomeRecordId);
  if(outcomeIndex>=0)state.outcomeRecords[outcomeIndex]=markOutcomeAbandoned(state.outcomeRecords[outcomeIndex],{reason,completedPhases:state.current.execution?.phaseIndex||0,totalPhases:state.current.adjusted?.length||0,at:abandonedAt});
  const commitmentIndex=state.commitments.findIndex(item=>item.id===state.current?.commitmentId);
  if(commitmentIndex>=0)state.commitments[commitmentIndex]=cancelCommitment(state.commitments[commitmentIndex],{reason:'practice-ended-early',at:abandonedAt});
  const fallbackIndex=state.fallbackPlans.findIndex(item=>item.id===state.current?.fallbackPlanId);
  if(fallbackIndex>=0&&['accepted','started'].includes(state.fallbackPlans[fallbackIndex].status))state.fallbackPlans[fallbackIndex]=abandonFallback(state.fallbackPlans[fallbackIndex],{completedRatio:sessionCompletionRatio(state.current.adjusted,state.current.execution),reason});
  const completionRatio=sessionCompletionRatio(state.current.adjusted,state.current.execution);
  const entry={...state.current,outcomeRecord:outcomeIndex>=0?state.outcomeRecords[outcomeIndex]:null,completed:false,abandoned:true,abandonedAt,closureReason:reason,completionRatio};
  state.history.unshift(entry);state.history=state.history.slice(0,100);
  updateJudgementStatus('abandoned',{closureReason:reason});
  state=clearReflectionDraft(state);state.current=null;decision=null;releaseWakeLock();persist();route('today');
}
function finishPractice(){
  if(state.current?.execution)state.current.execution=closeExecution(state.current.execution,EXECUTION_STATUS.COMPLETED);
  const outcomeIndex=state.outcomeRecords.findIndex(item=>item.id===state.current?.outcomeRecordId);
  if(outcomeIndex>=0)state.outcomeRecords[outcomeIndex]=markOutcomeCompleted(state.outcomeRecords[outcomeIndex],{practiceId:state.current?.decision?.practice?.id,completedPhases:state.current?.adjusted?.length||0,totalPhases:state.current?.adjusted?.length||0});
  const commitmentIndex=state.commitments.findIndex(item=>item.id===state.current?.commitmentId);
  if(commitmentIndex>=0)state.commitments[commitmentIndex]=markCommitmentCompleted(state.commitments[commitmentIndex]);
  const fallbackIndex=state.fallbackPlans.findIndex(item=>item.id===state.current?.fallbackPlanId);
  if(fallbackIndex>=0&&state.fallbackPlans[fallbackIndex].status==='started')state.fallbackPlans[fallbackIndex]=completeFallback(state.fallbackPlans[fallbackIndex],{completedRatio:1});
  updateJudgementStatus('completed');persist();releaseWakeLock();playTone('complete',state.settings.sound);announceStatus('Practice complete');route('reflect');
}
function reflect(){
  const restored=restoreReflectionDraft(state,state.current);
  const values=restored?.values||createReflectionDraft({current:state.current}).values;
  if(!restored){state.reflectionDraft=createReflectionDraft({current:state.current,values});persist()}
  const friction=state.frictionPlans.find(item=>item.id===state.current?.frictionPlanId&&item.status==='active');
  const adaptationPrompt=adaptationReflectionPrompt(state.current,state.current?.adjusted||[]);
  shell(`${header('REFLECTION')}<section class="stack reflection-screen"><div><p class="eyebrow">LOOKING BACK</p><h2>What actually happened?</h2><p class="muted">Three answers are enough. Add detail only when it helps.</p></div>
    <div class="reflection-essential">
      <label>Effect<select id="reflection-effect" data-reflection-draft="effect"><option value="better" ${values.effect==='better'?'selected':''}>Better than expected</option><option value="right" ${values.effect==='right'?'selected':''}>About right</option><option value="worse" ${values.effect==='worse'?'selected':''}>Worse than expected</option></select></label>
      <label>Goal fit<select id="reflection-goal" data-reflection-draft="goalFit"><option value="strong" ${values.goalFit==='strong'?'selected':''}>Strong</option><option value="partial" ${values.goalFit==='partial'?'selected':''}>Partial</option><option value="poor" ${values.goalFit==='poor'?'selected':''}>Poor</option><option value="unknown" ${values.goalFit==='unknown'?'selected':''}>Unknown</option></select></label>
      <label>Burden<select id="reflection-burden" data-reflection-draft="burden"><option value="low" ${values.burden==='low'?'selected':''}>Low</option><option value="moderate" ${values.burden==='moderate'?'selected':''}>Moderate</option><option value="high" ${values.burden==='high'?'selected':''}>High</option><option value="unknown" ${values.burden==='unknown'?'selected':''}>Unknown</option></select></label>
      ${friction?`<label>Did the anticipated friction appear?<select id="reflection-friction" data-reflection-draft="frictionOutcome"><option value="managed" ${values.frictionOutcome==='managed'?'selected':''}>Yes, and I managed it</option><option value="partly-managed" ${values.frictionOutcome==='partly-managed'?'selected':''}>Yes, partly managed</option><option value="blocked" ${values.frictionOutcome==='blocked'?'selected':''}>Yes, it blocked me</option><option value="not-relevant" ${values.frictionOutcome==='not-relevant'?'selected':''}>It did not appear</option></select></label>`:''}
      ${adaptationPrompt?`<label>${esc(adaptationPrompt.title)}<select id="reflection-adaptation-fit" data-reflection-draft="adaptationFit"><option value="right" ${values.adaptationFit==='right'?'selected':''}>About right</option><option value="better" ${values.adaptationFit==='better'?'selected':''}>Better than suggested</option><option value="worse" ${values.adaptationFit==='worse'?'selected':''}>Worse than suggested</option><option value="unknown" ${values.adaptationFit==='unknown'?'selected':''}>Not sure</option></select><small class="field-note">${esc(adaptationPrompt.description)}</small></label>`:''}
    </div>
    <details class="reflection-detail"><summary>Add more context</summary><div class="structured-reflection">
      <label>Surprise<select id="reflection-surprise" data-reflection-draft="surprise"><option value="none" ${values.surprise==='none'?'selected':''}>None</option><option value="some" ${values.surprise==='some'?'selected':''}>Some</option><option value="material" ${values.surprise==='material'?'selected':''}>Material</option></select></label>
      <label>Confidence<select id="reflection-confidence" data-reflection-draft="confidence"><option value="low" ${values.confidence==='low'?'selected':''}>Low</option><option value="medium" ${values.confidence==='medium'?'selected':''}>Medium</option><option value="high" ${values.confidence==='high'?'selected':''}>High</option></select></label>
      <label>What most likely caused the outcome?<select id="attribution-source" data-reflection-draft="attributionSource"><option value="practice" ${values.attributionSource==='practice'?'selected':''}>The Practice</option><option value="mixed" ${values.attributionSource==='mixed'?'selected':''}>Practice and external factors</option><option value="time" ${values.attributionSource==='time'?'selected':''}>Passage of time</option><option value="external" ${values.attributionSource==='external'?'selected':''}>External factors</option><option value="unclear" ${values.attributionSource==='unclear'?'selected':''}>Unclear</option></select></label>
      <label>Causal confidence<select id="attribution-confidence" data-reflection-draft="attributionConfidence"><option value="low" ${values.attributionConfidence==='low'?'selected':''}>Low</option><option value="medium" ${values.attributionConfidence==='medium'?'selected':''}>Medium</option><option value="high" ${values.attributionConfidence==='high'?'selected':''}>High</option></select></label>
      <label>External factors<textarea id="attribution-factors" rows="2" data-reflection-draft="externalFactors" placeholder="Optional">${esc(values.externalFactors)}</textarea></label>
      <label>Note<textarea id="reflection-note" rows="3" data-reflection-draft="note" placeholder="Optional context">${esc(values.note)}</textarea></label>
    </div></details>
    <button class="action primary" data-structured-reflection="save">SAVE REFLECTION</button>
    <p class="reflection-save-note">Your answers are saved automatically on this device.</p>
  </section>`)
}
function saveReflection(value){
  const reflectedAt=new Date().toISOString();
  const outcomeIndex=state.outcomeRecords.findIndex(item=>item.id===state.current?.outcomeRecordId);
  let outcomeRecord=outcomeIndex>=0?state.outcomeRecords[outcomeIndex]:null;
  if(outcomeRecord){
    outcomeRecord=attachOutcomeReflection(outcomeRecord,value,reflectedAt);
    state.outcomeRecords[outcomeIndex]=outcomeRecord;
  }
  const frictionIndex=state.frictionPlans.findIndex(item=>item.id===state.current?.frictionPlanId);
  if(frictionIndex>=0&&state.frictionPlans[frictionIndex].status==='active'){
    const frictionOutcome=state.reflectionDraft?.values?.frictionOutcome||'not-relevant';
    state.frictionPlans[frictionIndex]=markFrictionEncountered(state.frictionPlans[frictionIndex],{outcome:frictionOutcome});
  }
  let eligibility=learningEligibility(outcomeRecord);
  const fallback=state.fallbackPlans.find(item=>item.id===state.current?.fallbackPlanId);
  if(fallback){
    const fallbackEligibility=fallbackLearningEligibility(fallback,value);
    eligibility=fallbackEligibility;
  }
  const structuredReflection=state.structuredReflections.find(item=>item.id===state.current?.structuredReflectionId);
  let outcomeAttribution=null;
  if(structuredReflection){
    const friction=state.frictionPlans.find(item=>item.id===state.current?.frictionPlanId);
    eligibility=reflectionLearningSignal(structuredReflection,{completionRatio:fallback?.completedRatio??outcomeRecord?.completionRatio??0,wasFallback:Boolean(fallback),frictionOutcome:friction?.outcome||null});
    outcomeAttribution=state.outcomeAttributions.find(item=>item.id===state.current?.outcomeAttributionId)||null;
    eligibility=calibrateLearningWithAttribution(eligibility,outcomeAttribution);
  }
  const adaptationAccountability=hasPersonAdaptations(state.current)?buildAdaptationAccountability({
    phaseAdaptations:state.current.phaseAdaptations,
    phases:state.current.adjusted,
    reflectionValue:value,
    fit:state.reflectionDraft?.values?.adaptationFit||'unknown',
    at:reflectedAt
  }):null;
  const forecastIndex=state.judgementForecasts.findIndex(item=>item.id===state.current?.forecastId||item.judgementId===state.current?.decision?.id);
  let resolvedForecast=null;
  if(forecastIndex>=0){
    resolvedForecast=resolveJudgementForecast(state.judgementForecasts[forecastIndex],{actualEffect:value,causalSource:outcomeAttribution?.source||'unclear',at:reflectedAt});
    state.judgementForecasts[forecastIndex]=resolvedForecast;
  }
  const entry={...state.current,structuredReflection,outcomeAttribution,resolvedForecast,adaptationAccountability,fallbackOutcome:fallbackOutcomeRecord(fallback,value),judgementId:state.current?.decision?.id||null,outcomeRecord,learningEligibility:eligibility,reflection:value,completed:true,completedAt:reflectedAt};
  const episode=createOutcomeEpisode({historyEntry:entry,structuredReflection,attribution:outcomeAttribution,learningSignal:eligibility});
  state.outcomeEpisodes=[episode,...(state.outcomeEpisodes||[]).filter(item=>item.id!==episode.id)].slice(0,200);
  state.outcomePatterns=upsertOutcomePattern(state.outcomePatterns,episode);
  state.history.unshift(entry);
  if(eligibility.eligible){
    state.advisorMemories=learnFromReflection(state.advisorMemories,entry);
    const choice=state.choiceLog.find(item=>item.id===outcomeRecord?.choiceId);
    if(choice?.action==='choose-alternative'){
      const candidate=createPreferenceCandidate({choice,context:entry.context||context,at:reflectedAt});
      state.preferenceModel=upsertPreferenceCandidate(state.preferenceModel,candidate);
    }
  }
  state.deltaTotal=+(state.deltaTotal+entry.decision.delta.overall).toFixed(2);
  const j=state.judgements.find(x=>x.id===entry.decision.id);
  if(j){j.status='reviewed';j.reflection=value;j.outcomeRecordId=outcomeRecord?.id||null;j.validity={...(j.validity||{}),status:JUDGEMENT_VALIDITY.CLOSED,closedAt:reflectedAt}}
  state=clearReflectionDraft(state);state.current=null;decision=null;state.councilReports=upsertMonthlyCouncilReport(state.councilReports,state);({state}=reconcileLongitudinalState(state));persist();journal(entry)
}
function journal(entry){const missed=entry.reflection==='worse';shell(`${header('LEARNING')}<section class="stack center"><p class="eyebrow">${missed?'A CORRECTION':'A NEW SIGNAL'}</p><h2>${missed?'I may have misunderstood today.':'Thank you. I will carry this forward.'}</h2><p class="journal-copy">${missed?'The next judgement should place less confidence in today’s assumptions. A mistaken judgement is useful when it improves the next one.':'This reflection has been added to the relationship, not merely to a log.'}</p>${entry.adaptationAccountability?`<div class="adaptation-accountability-note"><span>IN-SESSION CHOICE</span><p>${esc(adaptationAccountabilitySummary(entry.adaptationAccountability))}</p><small>Recorded for accountability. Not yet treated as a stable preference.</small></div>`:''}${button('RETURN TO TODAY','today')}</section>`)}
function understanding(){
  const activeJudgement=state.current?.decision||state.judgements.find(item=>!['reviewed','abandoned','declined','superseded'].includes(item.status))||state.judgements[0];
  const latest=activeJudgement?.understanding||buildUnderstanding(context,state.history);
  const discoveries=deriveDiscoveries();
  const changes=(state.understandingModel?.changes||[]).slice(0,6);
  state.advisorMemories=expireStaleLearnings(normalizeAdvisorMemories(state.advisorMemories));
  const coverage=advisorCoverage(state.advisorMemories);
  const learningItems=learningReviewItems(state.advisorMemories).slice(0,12);
  state.councilReports=upsertMonthlyCouncilReport(state.councilReports,state);const council=state.councilReports[0]||buildMonthlyCouncil(state.advisorMemories,state.history);
  shell(`${header('UNDERSTANDING')}<section class="stack understanding-screen"><div><p class="eyebrow">WHAT I CURRENTLY UNDERSTAND ABOUT YOU</p><h2>A council that accumulates experience.</h2><p class="muted">Each Advisor learns only from reflections in its own domain. Their uncertainty remains visible and correctable.</p><button class="context-help inline" data-guide-section="understanding">How should I read Understanding?</button></div>
    <div class="understanding-summary"><span>${discoveries.filter(x=>x.level==='pattern').length} patterns</span><span>${discoveries.filter(x=>x.level==='hypothesis').length} hypotheses</span><span>${latest.unknowns.length} open questions</span></div>
    ${(()=>{const d=activeJudgement,ex=d?.explain||null,b=d?.boundaries||null;if(!d||!ex||!b)return '';return `<section class="latest-deliberation understanding-group" data-understanding-group="overview"><div class="section-heading"><div><p class="eyebrow">LATEST DELIBERATION</p><h3>${esc(d.practice?.name||'Current judgement')}</h3></div><span>${esc(d.confidenceLevel||confidenceLabel(d.confidence))}</span></div><p>${esc(d.judgement)}</p><details class="understanding-deliberation"><summary>Open full reasoning</summary><div class="explain-section"><p class="eyebrow">WHAT I OBSERVED</p><ul>${(ex.observations||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="explain-section"><p class="eyebrow">WHAT I INFERRED</p><ul>${(ex.inferences||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="explain-section"><p class="eyebrow">WHAT INFLUENCED ME MOST</p>${(ex.decisiveFactors||[]).map(x=>`<article><strong>${esc(x.advisor)}</strong><p>${esc(x.reason)}</p></article>`).join('')}</div><div class="explain-section"><p class="eyebrow">AGORA</p>${(d.advisors||[]).map(a=>`<article><div><strong>${esc(a.advisor)}</strong><span>${esc(a.position)}</span></div><p>${esc(a.reason)}</p></article>`).join('')}</div>${(d.minorityReports||[]).length?`<div class="explain-section"><p class="eyebrow">MINORITY REPORTS</p>${d.minorityReports.map(r=>`<article><strong>${esc(r.advisor)}</strong><p>${esc(r.reason)}</p></article>`).join('')}</div>`:''}<div class="explain-section"><p class="eyebrow">DECISION BOUNDARIES</p><ul>${(b.changeConditions||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p>${esc(b.provenance?.statement||'')}</p></div></details></section>`})()}

    <nav class="understanding-switcher" aria-label="Understanding sections">
      <button class="active" data-understanding-view="overview" aria-pressed="true">Overview</button>
      <button data-understanding-view="patterns" aria-pressed="false">Patterns</button>
      <button data-understanding-view="outcomes" aria-pressed="false">Outcomes</button>
      <button data-understanding-view="agency" aria-pressed="false">Agency</button>
      <button data-understanding-view="audit" aria-pressed="false">Audit</button>
    </nav>
    <section class="advisor-coverage understanding-group" data-understanding-group="overview"><div class="section-heading"><div><p class="eyebrow">UNDERSTANDING COVERAGE</p><h3>How well each Advisor knows you</h3></div></div>${coverage.map(x=>`<article><div class="coverage-head"><strong>${x.name}</strong><span>${x.coverage}%</span></div><div class="coverage-track"><i style="width:${x.coverage}%"></i></div><p>${x.experience?`${x.experience} reflected experience${x.experience===1?'':'s'} · ${x.confidence}% advisor confidence`:'Still establishing a personal baseline.'}</p></article>`).join('')}</section>
    <section class="pattern-transfers understanding-group is-hidden" data-understanding-group="patterns"><div class="section-heading"><div><p class="eyebrow">PATTERN TRANSFER</p><h3>Where a pattern may — or may not — generalise</h3></div></div>${(state.patternTransfers||[]).length?(state.patternTransfers||[]).slice(0,12).map(record=>`<article class="pattern-transfer-item ${esc(record.status)}"><div><strong>${esc(record.practiceId)}</strong><span>${esc(record.status)}</span></div><p>${esc(transferSummary(record))}</p><small>${esc(record.sourceContextKey.replaceAll('|',' · '))} → ${esc(record.targetContextKey.replaceAll('|',' · '))}</small>${record.status!=='rejected'?`<button data-transfer-action="reject" data-transfer-id="${esc(record.id)}">Do not generalise this</button>`:''}${record.rejectionNote?`<small>${esc(record.rejectionNote)}</small>`:''}</article>`).join(''):`<div class="empty"><p class="muted">No pattern transfer has been assessed yet.</p></div>`}</section>
    <section class="outcome-patterns understanding-group is-hidden" data-understanding-group="patterns"><div class="section-heading"><div><p class="eyebrow">LONGITUDINAL OUTCOMES</p><h3>Patterns that require repeated experience</h3></div></div>${(state.outcomePatterns||[]).length?(state.outcomePatterns||[]).slice(0,12).map(pattern=>`<article class="outcome-pattern-item ${esc(pattern.status)}"><div><strong>${esc(pattern.practiceId)}</strong><span>${esc(pattern.status)}</span></div><p>${esc(outcomePatternSummary(pattern))}</p><small>${esc(pattern.contextKey.replaceAll('|',' · '))}</small>${pattern.status!=='rejected'?`<button data-outcome-pattern-action="reject" data-pattern-id="${esc(pattern.id)}">This pattern is misleading</button>`:''}${pattern.rejectionNote?`<small>${esc(pattern.rejectionNote)}</small>`:''}</article>`).join(''):`<div class="empty"><p class="muted">No repeated outcome pattern exists yet.</p></div>`}</section>
    <section class="attribution-history understanding-group is-hidden" data-understanding-group="outcomes"><div class="section-heading"><div><p class="eyebrow">OUTCOME ATTRIBUTION</p><h3>What probably caused the result</h3></div></div>${(state.outcomeAttributions||[]).length?(state.outcomeAttributions||[]).slice(0,12).map(a=>{const r=state.structuredReflections.find(item=>item.id===a.reflectionId),x=attributionContradiction(r,a);return `<article class="attribution-item"><div><strong>${esc(a.source)}</strong><span>${esc(a.causalConfidence)}</span></div><p>${esc(attributionSummary(a))}</p>${x.present?`<small>Contradiction: ${esc(x.reasons.join(' '))}</small>`:''}</article>`}).join(''):`<div class="empty"><p class="muted">No outcome attribution has been recorded yet.</p></div>`}</section>
    <section class="reflection-history understanding-group is-hidden" data-understanding-group="outcomes"><div class="section-heading"><div><p class="eyebrow">REFLECTION INTEGRITY</p><h3>Effect, goal fit, burden and confidence</h3></div></div>${(state.structuredReflections||[]).length?(state.structuredReflections||[]).slice(0,12).map(r=>{const c=reflectionCompleteness(r),x=reflectionContradiction(r);return `<article class="reflection-item"><div><strong>${esc(r.effect)}</strong><span>${Math.round(c.score*100)}%</span></div><p>${esc(reflectionSummary(r))}</p>${x.present?`<small>Contradiction: ${esc(x.reasons.join(' '))}</small>`:''}${r.note?`<small>${esc(r.note)}</small>`:''}</article>`}).join(''):`<div class="empty"><p class="muted">No structured reflection has been recorded yet.</p></div>`}</section>
    <section class="follow-through-summary understanding-group is-hidden" data-understanding-group="outcomes">${(()=>{const s=followThroughSnapshot(state);return `<p class="eyebrow">FOLLOW-THROUGH INTEGRITY</p><div class="integrity-stats"><span>${s.activeCommitments} active</span><span>${s.startedCommitments} started</span><span>${s.managedFriction} managed frictions</span><span>${s.blockedFriction} blocked</span><span>${s.completedFallbacks} completed fallbacks</span></div><p>${esc(followThroughSummary(state))}</p>${s.status==='review-required'?`<p class="integrity-warning">Some follow-through records require review.</p>`:''}`})()}</section>
    <section class="fallback-history understanding-group is-hidden" data-understanding-group="outcomes"><div class="section-heading"><div><p class="eyebrow">ADAPTIVE FALLBACKS</p><h3>Reduced practices, kept distinct from the original</h3></div></div>${(state.fallbackPlans||[]).length?(state.fallbackPlans||[]).slice(0,12).map(plan=>`<article class="fallback-item ${esc(plan.status)}"><div><strong>${esc(plan.fallbackPracticeId)}</strong><span>${esc(plan.status)}</span></div><p>${esc(fallbackSummary(plan))}</p><small>Original: ${esc(plan.originalPracticeId)} · ${esc(plan.scope)} · ${Math.round(plan.reductionRatio*100)}%</small></article>`).join(''):`<div class="empty"><p class="muted">No adaptive fallback has been created yet.</p></div>`}</section>
    <section class="friction-history understanding-group is-hidden" data-understanding-group="outcomes"><div class="section-heading"><div><p class="eyebrow">FRICTION HISTORY</p><h3>Obstacles anticipated and what happened</h3></div></div>${(state.frictionPlans||[]).length?(state.frictionPlans||[]).slice(0,12).map(plan=>`<article class="friction-item ${esc(plan.status)}"><div><strong>${esc(plan.frictionType)}</strong><span>${esc(plan.status)}</span></div><p>${esc(plan.description||'Unnamed obstacle')}</p><small>Response: ${esc(plan.response||'none')}</small>${plan.fallback?`<small>Fallback: ${esc(plan.fallback)}</small>`:''}${plan.outcome?`<small>Outcome: ${esc(plan.outcome)}</small>`:''}</article>`).join(''):`<div class="empty"><p class="muted">No friction plan has been created yet.</p></div>`}</section>
    <section class="commitment-history understanding-group is-hidden" data-understanding-group="agency"><div class="section-heading"><div><p class="eyebrow">COMMITMENT HISTORY</p><h3>Temporary start windows, without compliance pressure</h3></div></div>${(state.commitments||[]).length?(state.commitments||[]).slice(0,12).map(c=>`<article class="commitment-item ${esc(c.status)}"><div><strong>${esc(c.practiceId||'Practice')}</strong><span>${esc(c.status)}</span></div><p>${esc(commitmentSummary(c))}</p><small>${new Date(c.createdAt).toLocaleDateString(undefined,{day:'numeric',month:'short'})} · ${esc(c.startMode)}</small>${c.reason?`<small>${esc(c.reason)}</small>`:''}</article>`).join(''):`<div class="empty"><p class="muted">No temporary commitment has been created yet.</p></div>`}</section>
    <section class="agency-integrity-summary understanding-group is-hidden" data-understanding-group="agency">${(()=>{const s=agencyConsistencySnapshot(state),l=learningSourceSummary(state);return `<p class="eyebrow">AGENCY INTEGRITY</p><div class="integrity-stats"><span>${s.choices} choices</span><span>${s.outcomes} outcomes</span><span>${s.reflected} reflected</span><span>${s.eligiblePreferences} active preferences</span></div><p>${esc(l.statement)}</p>${s.mismatches?`<p class="integrity-warning">${s.mismatches} execution mismatch${s.mismatches===1?'':'es'} require review.</p>`:''}`})()}</section>
    <section class="outcome-integrity understanding-group is-hidden" data-understanding-group="agency"><div class="section-heading"><div><p class="eyebrow">CHOICE → OUTCOME</p><h3>What was chosen, started, completed and reflected</h3></div></div>${(state.outcomeRecords||[]).length?(state.outcomeRecords||[]).slice(0,12).map(record=>`<article class="outcome-item ${esc(record.stage)}"><div><strong>${esc(record.chosenPracticeId||'No practice')}</strong><span>${esc(record.stage)}</span></div><p>${esc(outcomeSummary(record))}</p><small>Recommended: ${esc(record.recommendedPracticeId||'unknown')} · Integrity: ${esc(record.integrity)}</small>${record.reflection?`<small>Reflection: ${esc(record.reflection)}</small>`:''}</article>`).join(''):`<div class="empty"><p class="muted">No choice-to-outcome record exists yet.</p></div>`}</section>
    <section class="preference-governance understanding-group is-hidden" data-understanding-group="agency"><div class="section-heading"><div><p class="eyebrow">PREFERENCE GOVERNANCE</p><h3>Contextual preferences Strategos is carrying</h3></div></div>${(state.preferenceModel||[]).length?(state.preferenceModel||[]).slice(0,12).map(pref=>`<article class="preference-item ${esc(pref.status)}"><div><strong>${esc(pref.preferredPracticeId)}</strong><span>${esc(pref.status)}</span></div><p>Preferred over ${esc(pref.recommendedPracticeId)} in ${esc(pref.contextKey.replaceAll('|',' · '))}.</p><small>${pref.evidenceCount} observation${pref.evidenceCount===1?'':'s'} · context-bound</small><div class="insight-actions">${pref.status==='candidate'?`<button data-preference-action="confirm" data-preference-id="${esc(pref.id)}">Confirm preference</button><button data-preference-action="reject" data-preference-id="${esc(pref.id)}">This is not a real preference</button>`:''}${pref.status==='confirmed'?`<button data-preference-action="reject" data-preference-id="${esc(pref.id)}">Correct preference</button>`:''}${pref.status==='rejected'?`<button data-preference-action="reopen" data-preference-id="${esc(pref.id)}">Reopen as candidate</button>`:''}</div>${pref.correction?.note?`<small>Correction: ${esc(pref.correction.note)}</small>`:''}</article>`).join(''):`<div class="empty"><p class="muted">No contextual preference has been inferred yet.</p></div>`}<p class="muted preference-summary">${(()=>{const a=preferenceAudit(state.preferenceModel||[]);return `${a.confirmed} confirmed · ${a.candidate} candidate · ${a.rejected} rejected · ${a.expired} expired`;})()}</p></section>
    <section class="choice-audit understanding-group is-hidden" data-understanding-group="audit"><div class="section-heading"><div><p class="eyebrow">CHOICE HISTORY</p><h3>Where you accepted, deferred or overrode Strategos</h3></div></div>${(state.choiceLog||[]).length?(state.choiceLog||[]).slice(0,12).map(choice=>`<article class="choice-event"><div><strong>${new Date(choice.at).toLocaleDateString(undefined,{day:'numeric',month:'short'})}</strong><span>${esc(choice.action.replaceAll('-',' '))}</span></div><p>${esc(summarizeChoice(choice))}</p>${choice.reason?`<small>${esc(choice.reason)}</small>`:''}</article>`).join(''):`<div class="empty"><p class="muted">No explicit choice has been recorded yet.</p></div>`}</section>
    <section class="calibration-accountability understanding-group is-hidden" data-understanding-group="audit">${(()=>{const summary=calibrationAccountabilitySummary(state.calibrationAccountability);return `<div class="section-heading"><div><p class="eyebrow">CALIBRATION ACCOUNTABILITY</p><h3>${esc(summary.statement)}</h3></div></div>${(state.calibrationAccountability||[]).slice(0,12).map(record=>`<article class="calibration-accountability-item"><div><strong>${esc(record.calibrationScope)}</strong><span>${record.totalAdjustment>0?'+':''}${(record.totalAdjustment*100).toFixed(1)} pts</span></div><p>${record.cohortSize} comparable forecasts · drift ${esc(record.driftStatus)}</p><small>${esc(record.cohortKey||'No cohort key')}</small></article>`).join('')||`<div class="empty"><p class="muted">No calibration adjustment has been applied yet.</p></div>`}`})()}</section>
<section class="prediction-calibration understanding-group is-hidden" data-understanding-group="audit">${(()=>{const summary=predictionCalibrationSummary(state.judgementForecasts),correction=confidenceCorrection(summary);return `<div class="section-heading"><div><p class="eyebrow">PREDICTION CALIBRATION</p><h3>${esc(summary.statement)}</h3></div></div><p>${esc(correction.reason)}</p>${(state.judgementForecasts||[]).filter(item=>item.status==='resolved').slice(0,12).map(item=>`<article class="forecast-audit-item ${esc(item.calibration.direction)}"><div><strong>${esc(item.practiceId||'Practice')}</strong><span>${esc(item.calibration.direction)}</span></div><p>${esc(forecastSummary(item))}</p><small>Calibration score ${Math.round(item.calibration.score*100)}%</small></article>`).join('')||`<div class="empty"><p class="muted">No resolved forecast exists yet.</p></div>`}`})()}</section>
<section class="longitudinal-accountability understanding-group is-hidden" data-understanding-group="audit">${(()=>{const summary=longitudinalAccountabilitySummary(state);return `<div class="section-heading"><div><p class="eyebrow">LONGITUDINAL ACCOUNTABILITY</p><h3>${esc(summary.statement)}</h3></div></div>${(state.judgements||[]).filter(j=>j.longitudinalEvidence?.items?.length).slice(0,12).map(j=>{const audit=buildLongitudinalAuditEntry(j);return `<article class="longitudinal-audit-item ${esc(audit.status)}"><div><strong>${esc(j.practice?.name||j.practice?.id||'Judgement')}</strong><span>${esc(audit.status)}</span></div><p>${audit.sourceCount} longitudinal source${audit.sourceCount===1?'':'s'}</p>${audit.sources.map(source=>`<small>${esc(source.practiceId)} · ${esc(source.direction)} · ${source.adjustment>0?'+':''}${Number(source.adjustment).toFixed(3)}</small>`).join('')}${audit.reasons.map(reason=>`<small class="audit-warning">${esc(reason)}</small>`).join('')}</article>`}).join('')||`<div class="empty"><p class="muted">No judgement has used longitudinal evidence yet.</p></div>`}`})()}</section>
<section class="correction-audit understanding-group is-hidden" data-understanding-group="audit"><div class="section-heading"><div><p class="eyebrow">DECISION AUDIT</p><h3>How corrections propagated</h3></div></div>${(state.correctionAudit||[]).length?(state.correctionAudit||[]).slice(0,10).map(event=>`<details class="audit-event"><summary>${new Date(event.at).toLocaleDateString(undefined,{day:'numeric',month:'short'})} · ${esc(event.type.replaceAll('-',' '))}</summary><p>${esc(event.note||'Correction recorded.')}</p><p><strong>${esc(correctionAuditSummary(event))}</strong></p>${event.impact?.affectedJudgements?.length?`<h4>Judgements</h4><ul>${event.impact.affectedJudgements.map(item=>`<li>${esc(item.id)} — ${esc(item.reasons.join(' '))}</li>`).join('')}</ul>`:''}${event.impact?.affectedLearnings?.length?`<h4>Learnings</h4><ul>${event.impact.affectedLearnings.map(item=>`<li>${esc(item.advisor)} · ${esc(item.id)} — ${esc(item.reasons.join(' '))}</li>`).join('')}</ul>`:''}${event.impact?.affectedHistory?.length?`<h4>Historical records</h4><ul>${event.impact.affectedHistory.map(item=>`<li>${esc(item.judgementId||'unlinked record')} — ${esc(item.reasons.join(' '))}</li>`).join('')}</ul>`:''}</details>`).join(''):`<div class="empty"><p class="muted">No correction has required propagation yet.</p></div>`}</section>
    <details class="monthly-council" open><summary>Monthly Council · ${esc(council.month)}</summary><p class="council-summary">${esc(council.summary)}</p>${council.voices.map(v=>`<article><div><strong>${v.advisor}</strong><span>${v.coverage}% coverage</span></div><p>${esc(v.statement)}</p></article>`).join('')}</details>
    <section class="learning-review understanding-group" data-understanding-group="overview"><div class="section-heading"><div><p class="eyebrow">ACCOUNTABLE LEARNING</p><h3>What remains candidate, confirmed or rejected</h3></div></div>${learningItems.length?learningItems.map(item=>`<article class="learning-item ${item.status}"><div class="learning-head"><strong>${esc(item.advisor)}</strong><span>${esc(item.status)}</span></div><p>${esc(item.learning)}</p><small>${item.evidenceCount} observation${item.evidenceCount===1?'':'s'} · last seen ${new Date(item.lastObservedAt).toLocaleDateString(undefined,{day:'numeric',month:'short'})}</small><div class="insight-actions">${item.status==='candidate'?`<button data-learning-action="confirmed" data-learning-advisor="${esc(item.advisor)}" data-learning-id="${esc(item.id)}">Confirm this learning</button><button data-learning-action="rejected" data-learning-advisor="${esc(item.advisor)}" data-learning-id="${esc(item.id)}">This is not right</button>`:''}${item.status==='confirmed'?`<button data-learning-action="rejected" data-learning-advisor="${esc(item.advisor)}" data-learning-id="${esc(item.id)}">Correct this learning</button>`:''}${item.status==='rejected'?`<button data-learning-action="candidate" data-learning-advisor="${esc(item.advisor)}" data-learning-id="${esc(item.id)}">Reopen as candidate</button>`:''}</div>${item.correction?.note?`<small>Correction: ${esc(item.correction.note)}</small>`:''}</article>`).join(''):`<div class="empty"><p class="muted">No Advisor learning has been proposed yet.</p></div>`}</section>
    ${discoveries.map(x=>`<article class="insight ${x.feedback==='disagree'?'challenged':''}"><div class="insight-head"><p class="eyebrow">${x.level==='pattern'?'CURRENT PATTERN':'WORKING HYPOTHESIS'}</p><span>${x.confidence}% confidence</span></div><strong>${esc(x.title)}</strong><p>${esc(x.copy)}</p><div class="insight-actions"><button data-insight-feedback="agree" data-insight-id="${x.id}">This feels right</button><button data-insight-feedback="disagree" data-insight-id="${x.id}">${x.feedback==='disagree'?'Correction recorded':'Not quite'}</button></div>${x.feedback==='disagree'?`<small>I will reduce confidence in this interpretation until new evidence supports it.</small>`:''}</article>`).join('')}
    <section class="unknowns understanding-group" data-understanding-group="overview"><p class="eyebrow">STILL LEARNING</p><ul>${latest.unknowns.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>
    ${changes.length?`<section class="understanding-changes understanding-group is-hidden" data-understanding-group="audit"><p class="eyebrow">HOW MY UNDERSTANDING CHANGED</p>${changes.map(c=>`<article><time>${new Date(c.at).toLocaleDateString(undefined,{day:'numeric',month:'short'})}</time><div><strong>${esc(c.title)}</strong><p>${esc(c.note)}</p></div></article>`).join('')}</section>`:''}
  </section>${nav('understanding')}`)
}
function deriveDiscoveries(){
  const h=state.history.slice(0,12), feedback=state.understandingModel?.feedback||{};
  const short=h.filter(x=>x.decision?.duration<=15), good=short.filter(x=>x.reflection!=='worse').length;
  const recovery=h.filter(x=>x.context?.challenge==='recovery'||x.context?.sleep<=2);
  const relational=h.filter(x=>x.context?.challenge==='family');
  const raw=[
    {id:'consistency-over-intensity',level:h.length>=4?'pattern':'hypothesis',title:'Consistency may matter more than intensity.',copy:h.length?'Your recent pattern suggests that completing a bounded practice is often more valuable than increasing its size.':'I need several completed reflections before treating this as more than a hypothesis.',confidence:Math.min(84,42+h.length*4)},
    {id:'short-practices-sustainable',level:short.length>=3?'pattern':'hypothesis',title:'Short practices appear sustainable.',copy:short.length?`${good} of ${short.length} recent short practices were judged useful or approximately right.`:'There is not enough evidence yet.',confidence:Math.min(82,38+short.length*7)},
    {id:'priorities-change-action',level:h.length>=3?'pattern':'hypothesis',title:'Your priorities change the best action.',copy:'Body, work, recovery and relationships are treated as competing legitimate claims—not as distractions from fitness.',confidence:Math.min(82,58+h.length*3)},
    {id:'recovery-response',level:recovery.length>=3?'pattern':'hypothesis',title:'Recovery signals may deserve more weight on low-capacity days.',copy:recovery.length?`I have ${recovery.length} recent decisions involving recovery or poorer sleep. I am testing whether restraint improves the following day.`:'I do not yet have enough recovery-specific reflections.',confidence:Math.min(78,35+recovery.length*9)},
    {id:'relational-return',level:relational.length>=2?'pattern':'hypothesis',title:'Relational presence may sometimes create the highest return.',copy:relational.length?`Family was the strongest claim on ${relational.length} recent day${relational.length===1?'':'s'}. I am learning when presence should outrank a physical practice.`:'I have not yet observed enough days where relationships were the leading priority.',confidence:Math.min(75,32+relational.length*12)}
  ];
  return raw.map(x=>{const f=feedback[x.id];let confidence=x.confidence;if(f==='agree')confidence=Math.min(92,confidence+6);if(f==='disagree')confidence=Math.max(20,confidence-22);return {...x,confidence,feedback:f||null}})
}
function correctUnderstanding(){
  const insight=deriveDiscoveries().find(x=>x.id===selectedInsightId);
  if(!insight)return route('understanding');
  shell(`${header('CORRECT MY UNDERSTANDING','<button class="icon-btn" aria-label="Close correction" data-action="understanding">×</button>')}<section class="stack correction-screen"><div><p class="eyebrow">YOUR PERSPECTIVE MATTERS</p><h2>${esc(insight.title)}</h2><p class="muted">Tell me what I misunderstood. I will preserve the correction as part of how my model changes.</p></div><textarea id="correction-note" maxlength="280" placeholder="For example: short practices work only on busy days…"></textarea>${button('SAVE CORRECTION','save-correction')}${button('CANCEL','understanding',true)}</section>`)
}
function recordInsightFeedback(id,value,note=''){
  state.understandingModel ||= {feedback:{},changes:[]};
  state.understandingModel.feedback ||= {};state.understandingModel.changes ||= [];
  const insight=deriveDiscoveries().find(x=>x.id===id);
  state.understandingModel.feedback[id]=value;
  state.understandingModel.changes.unshift({id:`change-${Date.now()}`,insightId:id,at:new Date().toISOString(),title:value==='agree'?'Understanding confirmed':'Understanding corrected',note:value==='agree'?`You confirmed: “${insight?.title||id}”`:(note||`You challenged: “${insight?.title||id}”`)});
  state.understandingModel.changes=state.understandingModel.changes.slice(0,50);
  if(value==='disagree'){
    const correction=createCorrectionEvent({type:'understanding-correction',sourceId:id,note:note||'Understanding corrected by the person.'});
    const impact=determineCorrectionImpact(state,correction);
    state=applyCorrectionImpact(state,correction,impact);
  }
  persist()
}
function journey(){const items=journeyRecords(state);shell(`${header('JOURNEY')}<section class="stack"><div><p class="eyebrow">DELIBERATION ARCHIVE</p><h2>How my judgement is evolving.</h2><p class="muted">Every meaningful judgement leaves an understandable record.</p></div>${items.length?items.map(j=>`<article class="journey-item"><time>${new Date(j.createdAt).toLocaleDateString(undefined,{day:'numeric',month:'short'})}</time><div><strong>${esc(j.practice.name)}</strong><p>${esc(j.judgement)}</p><span>${esc(j.confidenceLevel||confidenceLabel(j.confidence))} confidence · ${j.reflection||'not reviewed'} · ${j.historyLinked?'linked record':'recovered record'}</span></div></article>`).join(''):`<div class="empty"><h2>No reviewed judgements yet.</h2><p class="muted">Complete and reflect on a practice to begin the archive.</p></div>`}</section>${nav('journey')}`)}
function guide(){
  const sections=[
    ['overview','What Strategos is',`<p>Strategos is a deliberative companion. It helps you understand the present context, forms a judgement, proposes a Practice and learns from what actually happened.</p><p><strong>Strategos advises. You decide.</strong></p>`],
    ['today','How Today works',`<p>Today is where each daily cycle begins. Answer the current signals honestly and approximately. They are not tests and there is no ideal answer.</p><div class="guide-flow"><span>Today</span><i>→</i><span>Agora</span><i>→</i><span>Judgement</span><i>→</i><span>Practice</span><i>→</i><span>Reflection</span></div>`],
    ['graph','The Living Human Graph',`<p>The graph is not a score or diagnosis. It is a slowly changing model of the dimensions currently visible in your choices and reflections.</p><p>A stronger emphasis means that dimension currently carries more weight or clearer evidence. It does not mean that the other dimensions are unimportant.</p>`],
    ['judgement','How a judgement works',`<p>A judgement is Strategos’ best current recommendation, not an instruction. Read the proposed Practice, confidence, duration and the short explanation of why it fits today.</p><p>You may accept it, choose the nearest alternative, decide later or decline. None of these choices is treated as obedience or failure.</p>`],
    ['practice','Practices and interruption',`<p>A Practice is the action proposed for the available time and present context. During execution you may pause, resume or end early.</p><p>If the app closes, Strategos preserves the active flow. The next opening still starts in Today, where a Resume card lets you return deliberately.</p>`],
    ['reflection','Reflection and learning',`<p>Reflection records what actually happened. The three essential answers are effect, goal fit and burden. Additional context is optional.</p><p>Strategos learns cautiously from repeated, context-matched outcomes. A single result does not become a permanent rule.</p>`],
    ['understanding','Understanding and Journey',`<p><strong>Understanding</strong> contains accumulated meaning: patterns, outcomes, agency and audit. Detailed reasoning from the latest deliberation lives there.</p><p><strong>Journey</strong> is the chronological record of meaningful judgements and reflections. It shows how your decisions evolve over time.</p>`],
    ['privacy','Data and control',`<p>Your Strategos state is stored locally in this browser. Use Settings to export a private backup before changing device or clearing browser data.</p><p>You may correct inferred preferences, reject misleading patterns, decline recommendations and erase the local state.</p>`]
  ];
  const ordered=guideFocus==='overview'?sections:[...sections.filter(([id])=>id===guideFocus),...sections.filter(([id])=>id!==guideFocus)];
  shell(`${header('HOW TO USE STRATEGOS','<button class="icon-btn" aria-label="Close guide and return to Settings" data-action="settings">×</button>')}<section class="stack usage-guide"><div><p class="eyebrow">SIMPLE GUIDE</p><h2>Use Strategos without having to understand the system behind it.</h2><p class="muted">Open only the sections that are useful now.</p></div><div class="guide-principle"><strong>Understand first.</strong><span>Act deliberately.</span></div>${ordered.map(([id,title,body],index)=>`<details class="guide-section" data-guide-id="${id}" ${index===0?'open':''}><summary>${title}</summary><div>${body}</div></details>`).join('')}<button class="action secondary" data-action="settings">Back to Settings</button></section>${nav('settings')}`)
}
function settings(){
  const voice=state.settings.voice;
  shell(`${header('SETTINGS','<button class="icon-btn" aria-label="Close and return to Today" data-action="today">×</button>')}<section class="stack settings"><div><p class="eyebrow">EXPERIENCE</p><h2>Quiet by design.</h2></div>
    ${settingToggle('Sound','Soft cues at transitions.','sound',state.settings.sound)}
    ${settingChoice('Voice guidance','How much Strategos says during a practice.','voice',[['off','Off'],['minimal','Minimal'],['guided','Guided']],voice)}
    <div class="setting-block"><h3>Strategos voice</h3><p>The natural voice calibration from v0.5 has been restored. Strategos now chooses the familiar best available English system voice automatically.</p><button class="action secondary voice-preview" data-action="preview-voice">Preview restored voice</button></div>
    ${settingToggle('Haptics','Subtle physical feedback.','haptics',state.settings.haptics)}
    ${settingToggle('Keep screen awake','During an active practice.','keepAwake',state.settings.keepAwake)}
    <div class="setting-block guide-entry"><p class="eyebrow">GUIDANCE</p><h3>How to use Strategos</h3><p>A simple guide to the daily cycle, judgements, Practices, reflection and learning.</p><button class="action secondary" data-guide-section="overview">Open guide</button></div>
    ${settingsNotice?`<div class="data-notice" role="status"><strong>Data status</strong><p>${esc(settingsNotice)}</p></div>`:''}
    <div class="setting-block"><h3>Your Strategos data</h3><p>Stored locally in this browser. Export a backup before changing devices, clearing browser data or importing another state.</p><div class="data-actions">${button('EXPORT STATE','export-state',true)}${button('IMPORT STATE','import-state',true)}</div><input id="state-import-file" type="file" accept="application/json,.json" hidden/></div>
    <div class="settings-section">${button('REPLAY ONBOARDING','replay-onboarding',true)}<button class="danger-btn" data-action="reset">Erase all Strategos data</button></div></section>${nav('settings')}`)
}
async function exportState(){
  try{
    const text=serializeStateExport(state);
    const blob=new Blob([text],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');
    link.href=url;link.download=exportFilename();document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    setNotice('A portable Strategos backup was exported. Keep it private.');
  }catch(_){setNotice('Strategos could not create the export file.');}
  route('settings');
}

async function importStateFile(file){
  if(!file){setNotice('No import file was selected.');return route('settings')}
  try{
    const result=validateStateImport(await file.text());
    if(!result.ok){setNotice(result.error);return route('settings')}
    const preview=createImportPreview(result.state,result.metadata);
    const summary=`Import the state for ${preview.profileName}? It contains ${preview.historyCount} completed practice record${preview.historyCount===1?'':'s'} and ${preview.judgementCount} judgement${preview.judgementCount===1?'':'s'}. Your current state will be backed up locally first.`;
    if(!confirm(summary)){setNotice('Import cancelled. Your current state was not changed.');return route('settings')}
    const backup=createLocalBackup();
    if(!backup.ok){setNotice(backup.error);return route('settings')}
    const saved=saveState(result.state);
    if(!saved.ok){setNotice(saved.error);return route('settings')}
    state=reconcileLoadedState(loadState());saveState(state);decision=null;setNotice('Strategos state imported and reconciled successfully.');
    return route('settings');
  }catch(_){setNotice('Strategos could not read the selected import file.');return route('settings')}
}

const settingToggle=(t,c,k,v)=>`<div class="setting-row"><div><h3>${t}</h3><p>${c}</p></div><button class="switch ${v?'on':''}" type="button" role="switch" aria-label="${t}" aria-checked="${v}" data-setting-toggle="${k}"><span aria-hidden="true"></span></button></div>`;
const settingChoice=(t,c,k,o,v)=>`<div class="setting-block"><h3>${t}</h3><p>${c}</p><div class="segmented">${o.map(([x,l])=>`<button class="${v===x?'selected':''}" aria-pressed="${v===x}" data-setting-choice="${k}" data-value="${x}">${l}</button>`).join('')}</div></div>`;
const confidenceLabel=value=>value>=82?'Relatively Strong':value>=66?'Moderate':'Limited';const formatTime=s=>`${String(Math.floor(Math.max(0,s)/60)).padStart(2,'0')}:${String(Math.max(0,s)%60).padStart(2,'0')}`;const greeting=()=>new Date().getHours()<12?'Good morning':new Date().getHours()<18?'Good afternoon':'Good evening';
app.addEventListener('input',e=>{const target=e.target.closest('[data-reflection-draft]');if(!target||!state.current?.decision)return;const key=target.dataset.reflectionDraft;const currentDraft=restoreReflectionDraft(state,state.current)||createReflectionDraft({current:state.current});state.reflectionDraft=updateReflectionDraft(currentDraft,{[key]:target.value});persist()});
app.addEventListener('change',e=>{const target=e.target.closest('[data-reflection-draft]');if(!target||!state.current?.decision)return;const key=target.dataset.reflectionDraft;const currentDraft=restoreReflectionDraft(state,state.current)||createReflectionDraft({current:state.current});state.reflectionDraft=updateReflectionDraft(currentDraft,{[key]:target.value});persist();announceStatus(`${target.closest('label')?.firstChild?.textContent?.trim()||'Reflection'} saved.`)});
app.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;unlockAudio();vibrate();if(t.dataset.adaptationLevel){const level=t.dataset.adaptationLevel;if(!state.current?.execution)return;state.current=setPhaseAdaptationChoice(state.current,state.current.execution.phaseIndex,level);persist();const phases=state.current.adjusted,phase=phases?.[state.current.execution.phaseIndex],guidance=buildPhaseGuidance({phase,practice:state.current.decision?.practice,context}),decisionForGuidance=buildGuidanceDecision({guidance,experience:state.profile?.experience,context}),choice=resolveAdaptationChoice({guidance,recommendedLevel:decisionForGuidance.appliedLevel||decisionForGuidance.requestedLevel,selectedLevel:level});document.querySelectorAll('[data-adaptation-level]').forEach(button=>{const selected=button.dataset.adaptationLevel===choice.appliedLevel;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',selected?'true':'false')});const card=document.querySelector('.guidance-recommendation'),text=document.querySelector('#active-guidance-text');if(card){card.dataset.activeAdaptation=choice.appliedLevel||'none';const label=card.querySelector('span');if(label)label.textContent=adaptationChoiceSummary(choice).toUpperCase();const note=card.querySelector('small');if(note)note.textContent='Your choice overrides today’s suggested level for this phase only.'}if(text)text.textContent=choice.text||'';if(state.settings.voice==='guided'&&choice.text)speak(choice.text,'guided',true);announceStatus(`${adaptationChoiceSummary(choice)} selected.`);return}if(t.dataset.guideSection){guideFocus=t.dataset.guideSection;return route('guide')}if(t.dataset.key){const k=t.dataset.key;context[k]=['sleep','energy','time'].includes(k)?Number(t.dataset.value):t.dataset.value;const row=t.closest('.choice-row');if(row){row.querySelectorAll('button[data-key]').forEach(button=>{const selected=button===t;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',selected?'true':'false')})}announceStatus(`${t.textContent.trim()} selected for ${k}.`);return}if(t.dataset.reflection)return saveReflection(t.dataset.reflection);if(t.dataset.structuredReflection){const outcome=state.outcomeRecords.find(item=>item.id===state.current?.outcomeRecordId);if(!outcome){alert('No outcome record is available.');return}const structured=createStructuredReflection({outcomeRecord:outcome,effect:document.getElementById('reflection-effect')?.value||'right',goalFit:document.getElementById('reflection-goal')?.value||'partial',burden:document.getElementById('reflection-burden')?.value||'moderate',surprise:document.getElementById('reflection-surprise')?.value||'none',confidence:document.getElementById('reflection-confidence')?.value||'medium',note:document.getElementById('reflection-note')?.value||''});const attribution=createOutcomeAttribution({reflection:structured,source:document.getElementById('attribution-source')?.value||'unclear',causalConfidence:document.getElementById('attribution-confidence')?.value||'low',externalFactors:(document.getElementById('attribution-factors')?.value||'').split(',')});state.structuredReflections=[structured,...(state.structuredReflections||[])].slice(0,200);state.outcomeAttributions=[attribution,...(state.outcomeAttributions||[])].slice(0,200);state.current={...(state.current||{}),structuredReflectionId:structured.id,outcomeAttributionId:attribution.id};persist();return saveReflection(structured.effect)}if(t.dataset.insightFeedback){const id=t.dataset.insightId,value=t.dataset.insightFeedback;if(value==='disagree'){selectedInsightId=id;return route('correctUnderstanding')}recordInsightFeedback(id,value);return route('understanding')}if(t.dataset.fallbackAction){const action=t.dataset.fallbackAction;const currentId=state.current?.fallbackPlanId;let index=state.fallbackPlans.findIndex(item=>item.id===currentId);if(action==='create'){const commitment=state.commitments.find(item=>item.id===state.current?.commitmentId),friction=state.frictionPlans.find(item=>item.id===state.current?.frictionPlanId),original=(decision||state.current?.decision)?.practice;if(!commitment||!original)return;const scope=prompt('Fallback type: reduced-duration, reduced-intensity, reduced-scope, or alternative-practice','reduced-duration')||'reduced-duration';const ratio=Math.max(.1,Math.min(1,Number(prompt('What fraction of the original practice?','0.5'))||.5));const fallback={...original,id:`${original.id}-fallback`,name:`${original.name} — reduced`};const plan=createFallbackPlan({commitment,frictionPlan:friction,originalPractice:original,fallbackPractice:fallback,scope,reductionRatio:ratio,reason:friction?.description||''});state.fallbackPlans=[plan,...(state.fallbackPlans||[])].slice(0,200);state.current={...(state.current||{}),fallbackPlanId:plan.id};persist();return route('judgement')}if(index<0)return;if(action==='accept')state.fallbackPlans[index]=acceptFallback(state.fallbackPlans[index]);if(action==='decline')state.fallbackPlans[index]=declineFallback(state.fallbackPlans[index]);persist();return route('judgement')}if(t.dataset.frictionType){const commitment=state.commitments.find(item=>item.id===state.current?.commitmentId);if(!commitment)return;const frictionType=t.dataset.frictionType,description=prompt('What specifically could get in the way?')||'',response=prompt('What will you do when that happens?',suggestedResponse(frictionType))||suggestedResponse(frictionType),fallback=prompt('Optional fallback: what is the smallest acceptable version?')||'';const plan=createFrictionPlan({commitment,frictionType,description,response,fallback});state.frictionPlans=[plan,...(state.frictionPlans||[])].slice(0,200);state.current={...(state.current||{}),frictionPlanId:plan.id};persist();return route('judgement')}if(t.dataset.commitmentAction){const action=t.dataset.commitmentAction;if(action==='cancel'){const id=state.current?.commitmentId,index=state.commitments.findIndex(item=>item.id===id);if(index>=0)state.commitments[index]=cancelCommitment(state.commitments[index],{reason:'person-cancelled'});delete state.current.commitmentId;persist();return rerenderJudgementAt('#commitment-panel')}const base=decision||state.current?.decision,choice=base?.personChoice;if(!choice){alert('Record an active choice before creating a commitment.');return}let startMode=action==='later'?'later':'now',startAfterMinutes=0,reason='';if(startMode==='later'){startAfterMinutes=Math.max(1,Math.min(1440,Number(prompt('How many minutes from now?','60'))||60));reason=prompt('Optional: what will help you begin then?')||'';}const commitment=createCommitment({judgement:base,choice,startMode,startAfterMinutes,reason});state.commitments=[commitment,...(state.commitments||[])].slice(0,200);state.current={...(state.current||{}),commitmentId:commitment.id};persist();return rerenderJudgementAt('#commitment-start')}if(t.dataset.understandingView){const view=t.dataset.understandingView;document.querySelectorAll('[data-understanding-view]').forEach(button=>{const active=button.dataset.understandingView===view;button.classList.toggle('active',active);button.setAttribute('aria-pressed',active?'true':'false')});document.querySelectorAll('[data-understanding-group]').forEach(section=>section.classList.toggle('is-hidden',section.dataset.understandingGroup!==view));announceStatus(`${t.textContent.trim()} understanding view selected.`);return}if(t.dataset.transferAction){const transferId=t.dataset.transferId,note=prompt('Why should this pattern not generalise here?')||'';state.patternTransfers=rejectTransferRecord(state.patternTransfers,{transferId,note});persist();return route('understanding')}if(t.dataset.outcomePatternAction){const patternId=t.dataset.patternId,note=prompt('What makes this pattern misleading?')||'';state.outcomePatterns=rejectOutcomePattern(state.outcomePatterns,{patternId,note});persist();return route('understanding')}if(t.dataset.preferenceAction){const action=t.dataset.preferenceAction,preferenceId=t.dataset.preferenceId;let note='';if(action==='reject')note=prompt('What did Strategos misunderstand about this preference?')||'';state.preferenceModel=applyPreferenceCorrection(state.preferenceModel,{preferenceId,action,note});persist();return route('understanding')}if(t.dataset.choiceAction){const action=t.dataset.choiceAction,selectedPracticeId=t.dataset.choicePractice||null;let reason='';if(action!=='accept')reason=prompt('Optional: what is behind this choice?')||'';const base=decision||state.current?.decision;const choice=createChoiceRecord({judgement:base,action,selectedPracticeId,reason});let updated=applyChoiceToJudgement(base,choice);if(action==='choose-alternative'){const selected=CODEX.find(item=>item.id===selectedPracticeId);if(selected){updated={...updated,practice:selected,mission:selected,intention:`You chose ${selected.name}. Strategos preserves this as your decision rather than relabelling it as its own recommendation.`};}}state.choiceLog=[choice,...(state.choiceLog||[])].slice(0,200);const outcome=createOutcomeRecord({judgement:updated,choice});state.outcomeRecords=[outcome,...(state.outcomeRecords||[])].slice(0,200);state.current={...(state.current||{}),outcomeRecordId:outcome.id};const index=state.judgements.findIndex(item=>item.id===updated.id);if(index>=0)state.judgements[index]=updated;state.current={...(state.current||{}),decision:updated};decision=updated;persist();if(['accept','choose-alternative'].includes(action))return rerenderJudgementAt('#commitment-panel');return route('judgement')}if(t.dataset.learningAction){const status=t.dataset.learningAction,advisor=t.dataset.learningAdvisor,learningId=t.dataset.learningId;let correction='';if(status==='rejected')correction=prompt('What did Strategos misunderstand? This correction will stop the learning from influencing future judgements.')||'';state.advisorMemories=updateLearningStatus(state.advisorMemories,{advisor,learningId,status,correction});state.understandingModel ||= {feedback:{},changes:[]};state.understandingModel.changes ||= [];state.understandingModel.changes.unshift({id:`learning-change-${Date.now()}`,at:new Date().toISOString(),title:status==='confirmed'?'Advisor learning confirmed':status==='rejected'?'Advisor learning corrected':'Advisor learning reopened',note:correction||`${advisor} learning is now ${status}.`});state.understandingModel.changes=state.understandingModel.changes.slice(0,50);if(status==='rejected'){const event=createCorrectionEvent({type:'learning-rejection',sourceId:learningId,note:correction||'Advisor learning rejected by the person.'});const impact=determineCorrectionImpact(state,event);state=applyCorrectionImpact(state,event,impact);}persist();return route('understanding')}if(t.dataset.settingToggle){const k=t.dataset.settingToggle;state.settings[k]=!state.settings[k];persist();return route('settings')}if(t.dataset.settingChoice){state.settings[t.dataset.settingChoice]=t.dataset.value;persist();return route('settings')}const a=t.dataset.action;if(a==='begin'){const destination=resolveStartupDestination(state);return route(destination.route)}if(a==='onboarding-next'){onboardingStep=1;return route('onboarding')}if(a==='onboarding-complete'){const input=document.querySelector('#onboarding-name');state.profile={name:input?.value.trim()||'Friend'};state.onboardingVersion=ONBOARDING_VERSION;persist();return route('today')}if(a==='continue-flow'){const destination=resolveContinuityDestination(state);return route(destination.route)}if(a==='consult')return route('thinking');if(a==='save-correction'){const note=document.querySelector('#correction-note')?.value.trim()||'';recordInsightFeedback(selectedInsightId,'disagree',note);selectedInsightId=null;return route('understanding');}if(a==='preview-voice')return previewVoice();if(a==='speak-judgement'){const d=decision||state.current?.decision;if(d)return speak(`Here is my current judgement. ${d.judgement} ${d.explain?.confidenceStatement||''}`, 'guided', true);}if(a==='commit'){const currentDecision=decision||state.current?.decision;if(!['accepted','overridden'].includes(currentDecision?.status)){alert('Record your choice before beginning the practice.');return}const index=state.commitments.findIndex(item=>item.id===state.current?.commitmentId);if(index<0){alert('Create a voluntary start window before beginning.');return}const availability=commitmentAvailability(state.commitments[index]);if(!availability.canStart){alert(availability.reason);return}const friction=state.frictionPlans.find(item=>item.id===state.current?.frictionPlanId),frictionGate=canBeginWithFriction(state.commitments[index],friction);if(!frictionGate.canBegin){alert(frictionGate.reason);return}state.commitments[index]=markCommitmentStarted(state.commitments[index]);const fallbackIndex=state.fallbackPlans.findIndex(item=>item.id===state.current?.fallbackPlanId);if(fallbackIndex>=0&&state.fallbackPlans[fallbackIndex].status==='accepted'){state.fallbackPlans[fallbackIndex]=startFallback(state.fallbackPlans[fallbackIndex]);const fp=state.fallbackPlans[fallbackIndex],original=state.current?.decision?.practice;state.current={...(state.current||{}),usingFallback:true,originalPractice:original,decision:{...state.current.decision,practice:{...original,id:fp.fallbackPracticeId,name:`${original.name} — reduced`},mission:{...original,id:fp.fallbackPracticeId,name:`${original.name} — reduced`}}};decision=state.current.decision;}persist();return route('execute');}if(a==='pause')return togglePause();if(a==='next-phase')return advancePhase(1);if(a==='previous-phase')return advancePhase(-1);if(a==='resume-practice'){state.current.execution=resumeExecution(state.current.execution);persist();requestWakeLock();return runPhase(state.current.adjusted,{announce:true})}if(a==='end-interrupted'){practiceExitSource='interrupted';return route('practiceExit',{history:'none'})}if(a==='discard-interrupted'){practiceExitSource='interrupted';return route('practiceExit',{history:'none'})}if(a==='abandon'){practiceExitSource='active';return route('practiceExit',{history:'none'})}if(a==='continue-practice'){state.current.execution=resumeExecution(state.current.execution);persist();requestWakeLock();return runPhase(state.current.adjusted,{announce:true})}if(a==='record-practice-exit')return abandonPractice(practiceExitSource==='interrupted'?'interrupted-ended':'person-ended');if(a==='discard-practice-session')return discardPracticeSession(practiceExitSource==='interrupted'?'interrupted-discarded':'person-discarded');if(['today','understanding','journey','settings'].includes(a))return route(a);if(a==='export-state')return exportState();if(a==='import-state'){document.querySelector('#state-import-file')?.click();return}if(a==='replay-onboarding'){onboardingStep=0;onboardingDraft={name:state.profile?.name||''};return route('onboarding')}if(a==='reset'){if(!confirm('Erase all Strategos data from this browser? A local recovery backup will be retained.'))return;if(!confirm('This will remove your active Strategos state. Continue?'))return;const result=resetState();if(!result.ok){setNotice(result.error);return route('settings')}state=loadState();settingsNotice='Strategos data was erased. A local recovery backup was retained.';onboardingStep=0;return route('splash')}});
app.addEventListener('change',e=>{if(e.target?.id==='state-import-file')importStateFile(e.target.files?.[0])});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&state.current?.startedAt)requestWakeLock()});try{
  window.history.replaceState({strategosRoute:'splash'},'',location.pathname+location.search);
  route('splash',{history:'none'});
}catch(error){
  console.error(error);
  shell(`<section class="stack center"><p class="eyebrow">STRATEGOS</p><h2>Unable to start.</h2><p class="muted">Refresh the page.</p></section>`)
}
