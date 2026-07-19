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
import { attachValidity,assessCandidateStability,assessJudgementValidity,markJudgementsForReview,supersedeJudgement,JUDGEMENT_VALIDITY } from './core/judgement-stability.js';
import { reconcileLongitudinalState,upsertMonthlyCouncilReport,journeyRecords } from './core/longitudinal-integrity.js';
const app=document.querySelector('#app');window.__strategosStarted=true;
const a11yStatus=document.querySelector('#a11y-status');
const announceStatus=message=>{if(!a11yStatus)return;a11yStatus.textContent='';requestAnimationFrame(()=>{a11yStatus.textContent=message||''})};
const focusCurrentScreen=()=>requestAnimationFrame(()=>{const target=app.querySelector('main.screen');if(target&&!target.matches(':focus'))target.focus({preventScroll:true})});
async function registerServiceWorker(){if(!('serviceWorker' in navigator)||!/^https?:$/.test(location.protocol))return;try{await navigator.serviceWorker.register('./service-worker.js',{scope:'./'})}catch(error){console.warn('Strategos offline support unavailable.',error)}}
registerServiceWorker();
let state=loadState();({state}=reconcileLongitudinalState(state));saveState(state);let settingsNotice=state.persistenceWarning||'',selectedInsightId=null,context={sleep:3,energy:2,time:15,challenge:'body',soreness:'none',emotionalLoad:'usual'},decision=null,timer=null,secondsLeft=0,phaseIndex=0,paused=false,wakeLock=null,onboardingStep=0,onboardingDraft={name:''};
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const vibrate=(p=12)=>{if(state.settings.haptics)navigator.vibrate?.(p)};
const persist=()=>{const result=saveState(state);if(!result.ok){settingsNotice=result.error;state.persistenceWarning=result.error}return result};
const setNotice=message=>{settingsNotice=message||''};
const shell=(content,cls='')=>app.innerHTML=`<main class="screen ${cls}" tabindex="-1" role="main">${content}</main>`;
const deltaMark=(size='large')=>`<svg class="delta ${size}" viewBox="0 0 140 140" aria-label="OneArete Delta"><circle class="ring" cx="70" cy="70" r="56"/><path class="glyph" d="M70 25 L112 108 M112 108 L28 108 M28 108 L63 39"/></svg>`;
const button=(label,action,secondary=false)=>`<button class="action ${secondary?'secondary':''}" data-action="${action}">${label}</button>`;
const header=(title='STRATEGOS',right='')=>`<header>${deltaMark('small')}<span>${title}</span>${right}</header>`;
const nav=active=>`<nav class="tabbar">${[['today','Today'],['understanding','Understanding'],['journey','Journey'],['settings','Settings']].map(([a,l])=>`<button class="${active===a?'active':''}" data-action="${a}">${l}</button>`).join('')}</nav>`;
function route(name){clearInterval(timer);timer=null;stopVoice();({splash,onboarding,today,thinking,judgement,execute,resumePrompt,reflect,journal,understanding,correctUnderstanding,journey,settings}[name]||splash)();window.scrollTo(0,0);focusCurrentScreen()}
function splash(){shell(`${deltaMark()}<div class="brand"><div class="eyebrow">ONEARETE</div><h1>STRATEGOS</h1><p>Understand first.<br/>Act deliberately.</p></div><button class="tap" data-action="begin">Tap to begin</button>`,'splash')}
function onboarding(){const steps=[`${header('WELCOME')}<section class="stack onboarding"><p class="eyebrow">A DELIBERATIVE COMPANION</p><h2>I will begin by listening.</h2><p class="muted">Strategos learns gradually, explains its judgement and leaves every choice with you.</p><div class="onboarding-mark">${deltaMark()}</div>${button('CONTINUE','onboarding-next')}</section>`,`${header('YOUR COMPANION')}<section class="stack onboarding"><p class="eyebrow">RELATIONSHIP BEFORE PROFILE</p><h2>What should I call you?</h2><p class="muted">That is enough for today. Everything else can be learned in context, over time.</p><input class="name-input" id="onboarding-name" autocomplete="given-name" value="${esc(onboardingDraft.name)}" placeholder="Your name"/>${button('BEGIN','onboarding-complete')}</section>`];shell(steps[onboardingStep]||steps[0])}
function today(){const name=state.profile?.name||'';const graph=buildHumanGraph(state.history,context);const latest=state.judgements.find(j=>!['reviewed','abandoned'].includes(j.status));const validity=latest?assessJudgementValidity(latest,context):null;if(latest&&validity&&validity.status!==latest.validity?.status){latest.validity=validity;persist()}const reviewNotice=validity&&[JUDGEMENT_VALIDITY.REVIEW_REQUIRED,JUDGEMENT_VALIDITY.EXPIRED].includes(validity.status)?`<section class="judgement-review-notice"><p class="eyebrow">JUDGEMENT REVIEW</p><strong>${validity.status===JUDGEMENT_VALIDITY.EXPIRED?'The previous judgement has expired.':'The previous judgement needs review.'}</strong><p>${esc(validity.reviewReason)}</p></section>`:'';shell(`${header('TODAY','<button class="icon-btn" aria-label="Open settings" data-action="settings">•••</button>')}<section class="stack observe-stack"><div><p class="eyebrow">BEFORE WE DECIDE</p><h2>${greeting()}${name?`, ${esc(name)}`:''}.</h2><p class="muted">I would like to understand how today looks.</p></div>${renderLivingGraph(graph,{compact:true})}${reviewNotice}<div class="signal-panel"><p class="eyebrow">TODAY'S SIGNALS</p>${question('How did you sleep?','sleep',[[4,'Excellent'],[3,'Good'],[2,'Fair'],[1,'Poor']])}${question('Energy','energy',[[3,'High'],[2,'Medium'],[1,'Low']])}${question('Time available','time',[[5,'5'],[15,'15'],[30,'30'],[60,'60+']])}${question('What has the strongest claim on today?','challenge',[['body','Body'],['mind','Mind'],['focus','Focus'],['recovery','Recovery'],['family','Family'],['work','Work']])}${question('Physical soreness','soreness',[['none','None'],['mild','Mild'],['significant','Significant']])}${question('Emotional load','emotionalLoad',[['light','Light'],['usual','Usual'],['heavy','Heavy']])}</div>${button('CONVENE THE AGORA','consult')}</section>${nav('today')}`)}
function question(title,key,opts){return `<div class="question"><h3>${title}</h3><div class="choice-row">${opts.map(([v,l])=>`<button class="pill ${context[key]===v?'selected':''}" data-key="${key}" data-value="${v}">${l}${key==='time'?' min':''}</button>`).join('')}</div></div>`}
function thinking(){shell(`${deltaMark()}<div class="thinking-copy"><p class="eyebrow">THE AGORA</p><h2>The council is deliberating.</h2><div class="advisor-lights">${['Body','Recovery','Mind','Agency','Purpose','Relationships'].map(x=>`<span><i></i>${x}</span>`).join('')}</div><p id="thinking-line" class="muted">Listening to each perspective…</p></div>`,'thinking');const lines=['Listening to each perspective…','Testing competing priorities…','Forming a prudent judgement…','Preparing an explanation…'];let i=0;const cycle=setInterval(()=>{const el=document.querySelector('#thinking-line');if(el)el.textContent=lines[Math.min(++i,lines.length-1)]},520);setTimeout(()=>{clearInterval(cycle);const understanding=buildUnderstanding(context,state.history);let candidate=attachValidity(conveneAgora(context,understanding,state.history,state.advisorMemories),context);candidate.explain=buildExplanation(candidate,context);const previous=state.current?.decision;const previousContext=state.current?.context||previous?.context;const stability=assessCandidateStability(previous,candidate,previousContext,context);if(stability.action==='retain-previous'){decision={...previous,stability:{...stability,retainedAt:new Date().toISOString()}};state.current={...state.current,context:{...context},decision};}else{decision={...candidate,stability};if(previous){const index=state.judgements.findIndex(item=>item.id===previous.id);if(index>=0)state.judgements[index]=supersedeJudgement(state.judgements[index],decision.id);}state.current={context:{...context},decision,startedAt:null};state.judgements.unshift({...decision,status:'proposed'});state.judgements=state.judgements.slice(0,100);}persist();route('judgement')},2350)}
function judgement(){
  decision ||= state.current?.decision;
  if(!decision) return route('today');
  const d=decision,p=d.practice,projected=projectHumanReturn(buildHumanGraph(state.history,context),d.delta);
  const ex=d.explain||buildExplanation(d,context);
  shell(`${header('CURRENT JUDGEMENT','<button class="icon-btn" aria-label="Close and return to Today" data-action="today">×</button>')}
    <section class="understanding-card"><p class="eyebrow">HERE'S WHAT I THINK I UNDERSTAND TODAY</p><h2>${esc(d.understanding.summary)}</h2><p class="epistemic">This is a provisional understanding, not a certainty.</p></section>
    <section class="judgement-card"><p class="eyebrow">MY CURRENT JUDGEMENT</p><h2>${esc(d.judgement)}</h2><div class="judgement-meta"><span>${esc(d.confidenceLevel||confidenceLabel(d.confidence))} confidence</span><span>${d.duration} min</span></div><p class="confidence-copy">${esc(ex.confidenceStatement)}</p>${d.stability?`<p class="stability-note"><strong>Judgement stability:</strong> ${esc(d.stability.reason)}</p>`:''}<p class="validity-note">Current for this context until ${new Date(d.validity?.validUntil||Date.now()).toLocaleString(undefined,{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}, unless a review trigger occurs.</p></section>
    <details class="explain-panel" open><summary>Why this judgement?</summary>
      <div class="explain-section"><p class="eyebrow">WHAT I OBSERVED</p><ul>${ex.observations.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
      <div class="explain-section"><p class="eyebrow">WHAT I INFERRED</p><ul>${ex.inferences.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
      <div class="explain-section"><p class="eyebrow">WHAT INFLUENCED ME MOST</p>${ex.decisiveFactors.map(x=>`<article><strong>${esc(x.advisor)}</strong><p>${esc(x.reason)}</p></article>`).join('')}</div>
      <div class="explain-section"><p class="eyebrow">EVIDENCE DIVERSITY</p><p>${esc(d.evidenceDiversity?.statement||'The evidence basis has not yet been classified.')}</p></div>
      ${d.contradictions?.length?`<div class="explain-section contradiction-section"><p class="eyebrow">TENSIONS I PRESERVED</p><ul>${d.contradictions.map(x=>`<li><strong>${esc(x.statement)}</strong> ${esc(x.implication)}</li>`).join('')}</ul></div>`:''}
    </details>
    <details class="agora-panel"><summary>Hear every member of the Agora</summary>${d.advisors.map(a=>`<article><div><strong>${a.advisor}</strong><span class="position ${a.position.toLowerCase()}">${a.position}</span></div><p>${esc(a.reason)}</p>${a.memory?`<small>${a.memory.experience} reflected experiences · ${a.memory.coverage}% coverage</small>`:''}</article>`).join('')}</details>
    <section class="unknowns"><p class="eyebrow">WHAT I MAY BE MISSING</p><ul>${ex.unknowns.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p class="eyebrow change-title">WHAT WOULD CHANGE MY JUDGEMENT</p><ul>${ex.changeConditions.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>
    ${renderLivingGraph(projected,{compact:true})}
    <section class="practice-proposal"><p class="eyebrow">PRACTICE</p><h2>${p.name}</h2><p>${esc(d.intention)}</p><div class="delta-score"><span>EXPECTED HUMAN RETURN</span><strong>+${d.delta.overall.toFixed(2)}</strong></div></section>
    <div class="bottom-actions">${button('CHOOSE THIS PRACTICE','commit')}<button class="text-btn" data-action="speak-judgement">Hear this judgement</button><button class="text-btn" data-action="today">Reassess today</button></div>`)
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
  updateJudgementStatus('in-practice');
  persist();requestWakeLock();playTone('begin',state.settings.sound);runPhase(state.current.adjusted,{announce:true});
}
function resumePrompt(){
  const d=state.current?.decision,execution=state.current?.execution;
  if(!d||!isResumable(execution))return route('today');
  const phase=state.current.adjusted?.[execution.phaseIndex];
  shell(`${header('PRACTICE PAUSED')}<section class="stack center resume-practice"><p class="eyebrow">AN INTERRUPTED PRACTICE</p><h2>${esc(d.practice.name)}</h2><p class="muted">${phase?`You were in “${esc(phase[0])}”.`:''} Strategos preserved the session so you can choose what happens next.</p>${button('RESUME PRACTICE','resume-practice')}${button('END AND RECORD','end-interrupted',true)}<button class="text-btn" data-action="discard-interrupted">Discard this session</button></section>`);
}
function runPhase(phases,{announce=false}={}){
  const execution=state.current?.execution;
  if(!execution)return route('today');
  phaseIndex=execution.phaseIndex;
  const p=phases[phaseIndex];if(!p)return finishPractice();
  paused=execution.status===EXECUTION_STATUS.PAUSED;
  secondsLeft=remainingSeconds(execution);
  if(announce){playTone('phase',state.settings.sound);speak(state.settings.voice==='guided'?`${p[0]}. ${p[2]} ${p[3]?.[0]||''}`:`${p[0]}.`,state.settings.voice,true);announceStatus(`Phase ${phaseIndex+1} of ${phases.length}: ${p[0]}`)}
  shell(`<header><span class="eyebrow">PRACTICE IN PROGRESS</span><button class="icon-btn" aria-label="End practice" data-action="abandon">×</button></header><section class="execution"><p class="phase-count">${phaseIndex+1} / ${phases.length}</p><p class="practice-intention">${esc((decision||state.current.decision).intention)}</p><h2>${p[0]}</h2><div class="clock" id="clock" role="timer" aria-label="Time remaining">${formatTime(secondsLeft)}</div><p class="phase-summary">${p[2]}</p>${p[3]?.length?`<details class="exercise-guide" open><summary>How to do it</summary><ul>${p[3].map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>`:''}<div class="progress"><span id="phase-progress"></span></div></section><div class="practice-controls"><button class="round-control" aria-label="Previous phase" data-action="previous-phase">‹</button><button class="pause-control" aria-label="${paused?'Resume practice':'Pause practice'}" data-action="pause">${paused?'Resume':'Pause'}</button><button class="round-control" aria-label="Next phase" data-action="next-phase">›</button></div>`,'execute');
  clearInterval(timer);let lastCountdown=null;
  const refresh=()=>{
    const current=state.current?.execution;if(!current)return;
    secondsLeft=remainingSeconds(current);
    const c=document.querySelector('#clock'),bar=document.querySelector('#phase-progress');
    if(c)c.textContent=formatTime(secondsLeft);
    if(bar)bar.style.width=`${100*(1-secondsLeft/current.phaseDuration)}%`;
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
function abandonPractice(reason='person-ended'){
  if(!state.current)return route('today');
  state.current.execution=closeExecution(state.current.execution||{},EXECUTION_STATUS.ABANDONED,{reason});
  const entry={...state.current,completed:false,abandoned:true,abandonedAt:new Date().toISOString(),closureReason:reason};
  state.history.unshift(entry);state.history=state.history.slice(0,100);
  updateJudgementStatus('abandoned',{closureReason:reason});
  state.current=null;decision=null;releaseWakeLock();persist();route('today');
}
function finishPractice(){
  if(state.current?.execution)state.current.execution=closeExecution(state.current.execution,EXECUTION_STATUS.COMPLETED);
  updateJudgementStatus('completed');persist();releaseWakeLock();playTone('complete',state.settings.sound);announceStatus('Practice complete');route('reflect');
}
function reflect(){shell(`${header('REFLECTION')}<section class="stack center"><p class="eyebrow">LOOKING BACK</p><h2>Did today’s judgement help?</h2><p class="muted">This evaluates my judgement, not your performance.</p><div class="reflection"><button class="choice" data-reflection="better">Better than expected</button><button class="choice" data-reflection="right">About right</button><button class="choice" data-reflection="worse">Worse than expected</button></div></section>`)}
function saveReflection(value){const entry={...state.current,judgementId:state.current?.decision?.id||null,reflection:value,completed:true,completedAt:new Date().toISOString()};state.history.unshift(entry);state.advisorMemories=learnFromReflection(state.advisorMemories,entry);state.deltaTotal=+(state.deltaTotal+entry.decision.delta.overall).toFixed(2);const j=state.judgements.find(x=>x.id===entry.decision.id);if(j){j.status='reviewed';j.reflection=value;j.validity={...(j.validity||{}),status:JUDGEMENT_VALIDITY.CLOSED,closedAt:new Date().toISOString()}}state.current=null;decision=null;state.councilReports=upsertMonthlyCouncilReport(state.councilReports,state);({state}=reconcileLongitudinalState(state));persist();journal(entry)}
function journal(entry){const missed=entry.reflection==='worse';shell(`${header('LEARNING')}<section class="stack center"><p class="eyebrow">${missed?'A CORRECTION':'A NEW SIGNAL'}</p><h2>${missed?'I may have misunderstood today.':'Thank you. I will carry this forward.'}</h2><p class="journal-copy">${missed?'The next judgement should place less confidence in today’s assumptions. A mistaken judgement is useful when it improves the next one.':'This reflection has been added to the relationship, not merely to a log.'}</p>${button('RETURN TO TODAY','today')}</section>`)}
function understanding(){
  const latest=state.judgements[0]?.understanding||buildUnderstanding(context,state.history);
  const discoveries=deriveDiscoveries();
  const changes=(state.understandingModel?.changes||[]).slice(0,6);
  state.advisorMemories=expireStaleLearnings(normalizeAdvisorMemories(state.advisorMemories));
  const coverage=advisorCoverage(state.advisorMemories);
  const learningItems=learningReviewItems(state.advisorMemories).slice(0,12);
  state.councilReports=upsertMonthlyCouncilReport(state.councilReports,state);const council=state.councilReports[0]||buildMonthlyCouncil(state.advisorMemories,state.history);
  shell(`${header('UNDERSTANDING')}<section class="stack understanding-screen"><div><p class="eyebrow">WHAT I CURRENTLY UNDERSTAND ABOUT YOU</p><h2>A council that accumulates experience.</h2><p class="muted">Each Advisor learns only from reflections in its own domain. Their uncertainty remains visible and correctable.</p></div>
    <div class="understanding-summary"><span>${discoveries.filter(x=>x.level==='pattern').length} patterns</span><span>${discoveries.filter(x=>x.level==='hypothesis').length} hypotheses</span><span>${latest.unknowns.length} open questions</span></div>
    <section class="advisor-coverage"><div class="section-heading"><div><p class="eyebrow">UNDERSTANDING COVERAGE</p><h3>How well each Advisor knows you</h3></div></div>${coverage.map(x=>`<article><div class="coverage-head"><strong>${x.name}</strong><span>${x.coverage}%</span></div><div class="coverage-track"><i style="width:${x.coverage}%"></i></div><p>${x.experience?`${x.experience} reflected experience${x.experience===1?'':'s'} · ${x.confidence}% advisor confidence`:'Still establishing a personal baseline.'}</p></article>`).join('')}</section>
    <details class="monthly-council" open><summary>Monthly Council · ${esc(council.month)}</summary><p class="council-summary">${esc(council.summary)}</p>${council.voices.map(v=>`<article><div><strong>${v.advisor}</strong><span>${v.coverage}% coverage</span></div><p>${esc(v.statement)}</p></article>`).join('')}</details>
    <section class="learning-review"><div class="section-heading"><div><p class="eyebrow">ACCOUNTABLE LEARNING</p><h3>What remains candidate, confirmed or rejected</h3></div></div>${learningItems.length?learningItems.map(item=>`<article class="learning-item ${item.status}"><div class="learning-head"><strong>${esc(item.advisor)}</strong><span>${esc(item.status)}</span></div><p>${esc(item.learning)}</p><small>${item.evidenceCount} observation${item.evidenceCount===1?'':'s'} · last seen ${new Date(item.lastObservedAt).toLocaleDateString(undefined,{day:'numeric',month:'short'})}</small><div class="insight-actions">${item.status==='candidate'?`<button data-learning-action="confirmed" data-learning-advisor="${esc(item.advisor)}" data-learning-id="${esc(item.id)}">Confirm this learning</button><button data-learning-action="rejected" data-learning-advisor="${esc(item.advisor)}" data-learning-id="${esc(item.id)}">This is not right</button>`:''}${item.status==='confirmed'?`<button data-learning-action="rejected" data-learning-advisor="${esc(item.advisor)}" data-learning-id="${esc(item.id)}">Correct this learning</button>`:''}${item.status==='rejected'?`<button data-learning-action="candidate" data-learning-advisor="${esc(item.advisor)}" data-learning-id="${esc(item.id)}">Reopen as candidate</button>`:''}</div>${item.correction?.note?`<small>Correction: ${esc(item.correction.note)}</small>`:''}</article>`).join(''):`<div class="empty"><p class="muted">No Advisor learning has been proposed yet.</p></div>`}</section>
    ${discoveries.map(x=>`<article class="insight ${x.feedback==='disagree'?'challenged':''}"><div class="insight-head"><p class="eyebrow">${x.level==='pattern'?'CURRENT PATTERN':'WORKING HYPOTHESIS'}</p><span>${x.confidence}% confidence</span></div><strong>${esc(x.title)}</strong><p>${esc(x.copy)}</p><div class="insight-actions"><button data-insight-feedback="agree" data-insight-id="${x.id}">This feels right</button><button data-insight-feedback="disagree" data-insight-id="${x.id}">${x.feedback==='disagree'?'Correction recorded':'Not quite'}</button></div>${x.feedback==='disagree'?`<small>I will reduce confidence in this interpretation until new evidence supports it.</small>`:''}</article>`).join('')}
    <section class="unknowns"><p class="eyebrow">STILL LEARNING</p><ul>${latest.unknowns.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>
    ${changes.length?`<section class="understanding-changes"><p class="eyebrow">HOW MY UNDERSTANDING CHANGED</p>${changes.map(c=>`<article><time>${new Date(c.at).toLocaleDateString(undefined,{day:'numeric',month:'short'})}</time><div><strong>${esc(c.title)}</strong><p>${esc(c.note)}</p></div></article>`).join('')}</section>`:''}
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
  if(value==='disagree')state.judgements=markJudgementsForReview(state.judgements,'The person corrected an understanding used by Strategos.');
  persist()
}
function journey(){const items=journeyRecords(state);shell(`${header('JOURNEY')}<section class="stack"><div><p class="eyebrow">DELIBERATION ARCHIVE</p><h2>How my judgement is evolving.</h2><p class="muted">Every meaningful judgement leaves an understandable record.</p></div>${items.length?items.map(j=>`<article class="journey-item"><time>${new Date(j.createdAt).toLocaleDateString(undefined,{day:'numeric',month:'short'})}</time><div><strong>${esc(j.practice.name)}</strong><p>${esc(j.judgement)}</p><span>${esc(j.confidenceLevel||confidenceLabel(j.confidence))} confidence · ${j.reflection||'not reviewed'} · ${j.historyLinked?'linked record':'recovered record'}</span></div></article>`).join(''):`<div class="empty"><h2>No reviewed judgements yet.</h2><p class="muted">Complete and reflect on a practice to begin the archive.</p></div>`}</section>${nav('journey')}`)}
function settings(){
  const voice=state.settings.voice;
  shell(`${header('SETTINGS','<button class="icon-btn" aria-label="Close and return to Today" data-action="today">×</button>')}<section class="stack settings"><div><p class="eyebrow">EXPERIENCE</p><h2>Quiet by design.</h2></div>
    ${settingToggle('Sound','Soft cues at transitions.','sound',state.settings.sound)}
    ${settingChoice('Voice guidance','How much Strategos says during a practice.','voice',[['off','Off'],['minimal','Minimal'],['guided','Guided']],voice)}
    <div class="setting-block"><h3>Strategos voice</h3><p>The natural voice calibration from v0.5 has been restored. Strategos now chooses the familiar best available English system voice automatically.</p><button class="action secondary voice-preview" data-action="preview-voice">Preview restored voice</button></div>
    ${settingToggle('Haptics','Subtle physical feedback.','haptics',state.settings.haptics)}
    ${settingToggle('Keep screen awake','During an active practice.','keepAwake',state.settings.keepAwake)}
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
    state=loadState();({state}=reconcileLongitudinalState(state));saveState(state);decision=null;setNotice('Strategos state imported and reconciled successfully.');
    return route('settings');
  }catch(_){setNotice('Strategos could not read the selected import file.');return route('settings')}
}

const settingToggle=(t,c,k,v)=>`<div class="setting-row"><div><h3>${t}</h3><p>${c}</p></div><button class="switch ${v?'on':''}" type="button" role="switch" aria-label="${t}" aria-checked="${v}" data-setting-toggle="${k}"><span aria-hidden="true"></span></button></div>`;
const settingChoice=(t,c,k,o,v)=>`<div class="setting-block"><h3>${t}</h3><p>${c}</p><div class="segmented">${o.map(([x,l])=>`<button class="${v===x?'selected':''}" aria-pressed="${v===x}" data-setting-choice="${k}" data-value="${x}">${l}</button>`).join('')}</div></div>`;
const confidenceLabel=value=>value>=82?'Relatively Strong':value>=66?'Moderate':'Limited';const formatTime=s=>`${String(Math.floor(Math.max(0,s)/60)).padStart(2,'0')}:${String(Math.max(0,s)%60).padStart(2,'0')}`;const greeting=()=>new Date().getHours()<12?'Good morning':new Date().getHours()<18?'Good afternoon':'Good evening';
app.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;unlockAudio();vibrate();if(t.dataset.key){const k=t.dataset.key;context[k]=['sleep','energy','time'].includes(k)?Number(t.dataset.value):t.dataset.value;return route('today')}if(t.dataset.reflection)return saveReflection(t.dataset.reflection);if(t.dataset.insightFeedback){const id=t.dataset.insightId,value=t.dataset.insightFeedback;if(value==='disagree'){selectedInsightId=id;return route('correctUnderstanding')}recordInsightFeedback(id,value);return route('understanding')}if(t.dataset.learningAction){const status=t.dataset.learningAction,advisor=t.dataset.learningAdvisor,learningId=t.dataset.learningId;let correction='';if(status==='rejected')correction=prompt('What did Strategos misunderstand? This correction will stop the learning from influencing future judgements.')||'';state.advisorMemories=updateLearningStatus(state.advisorMemories,{advisor,learningId,status,correction});state.understandingModel ||= {feedback:{},changes:[]};state.understandingModel.changes ||= [];state.understandingModel.changes.unshift({id:`learning-change-${Date.now()}`,at:new Date().toISOString(),title:status==='confirmed'?'Advisor learning confirmed':status==='rejected'?'Advisor learning corrected':'Advisor learning reopened',note:correction||`${advisor} learning is now ${status}.`});state.understandingModel.changes=state.understandingModel.changes.slice(0,50);if(status==='rejected')state.judgements=markJudgementsForReview(state.judgements,'The person rejected Advisor learning that may have influenced the judgement.');persist();return route('understanding')}if(t.dataset.settingToggle){const k=t.dataset.settingToggle;state.settings[k]=!state.settings[k];persist();return route('settings')}if(t.dataset.settingChoice){state.settings[t.dataset.settingChoice]=t.dataset.value;persist();return route('settings')}const a=t.dataset.action;if(a==='begin')return route(!state.profile||state.onboardingVersion<ONBOARDING_VERSION?'onboarding':isResumable(state.current?.execution)?'resumePrompt':'today');if(a==='onboarding-next'){onboardingStep=1;return route('onboarding')}if(a==='onboarding-complete'){const input=document.querySelector('#onboarding-name');state.profile={name:input?.value.trim()||'Friend'};state.onboardingVersion=ONBOARDING_VERSION;persist();return route('today')}if(a==='consult')return route('thinking');if(a==='save-correction'){const note=document.querySelector('#correction-note')?.value.trim()||'';recordInsightFeedback(selectedInsightId,'disagree',note);selectedInsightId=null;return route('understanding');}if(a==='preview-voice')return previewVoice();if(a==='speak-judgement'){const d=decision||state.current?.decision;if(d)return speak(`Here is my current judgement. ${d.judgement} ${d.explain?.confidenceStatement||''}`, 'guided', true);}if(a==='commit')return route('execute');if(a==='pause')return togglePause();if(a==='next-phase')return advancePhase(1);if(a==='previous-phase')return advancePhase(-1);if(a==='resume-practice'){state.current.execution=resumeExecution(state.current.execution);persist();requestWakeLock();return runPhase(state.current.adjusted,{announce:true})}if(a==='end-interrupted')return abandonPractice('interrupted-ended');if(a==='discard-interrupted'&&confirm('Discard this interrupted session?'))return abandonPractice('interrupted-discarded');if(a==='abandon'&&confirm('End this practice?'))return abandonPractice('person-ended');if(['today','understanding','journey','settings'].includes(a))return route(a);if(a==='export-state')return exportState();if(a==='import-state'){document.querySelector('#state-import-file')?.click();return}if(a==='replay-onboarding'){onboardingStep=0;onboardingDraft={name:state.profile?.name||''};return route('onboarding')}if(a==='reset'){if(!confirm('Erase all Strategos data from this browser? A local recovery backup will be retained.'))return;if(!confirm('This will remove your active Strategos state. Continue?'))return;const result=resetState();if(!result.ok){setNotice(result.error);return route('settings')}state=loadState();settingsNotice='Strategos data was erased. A local recovery backup was retained.';onboardingStep=0;return route('splash')}});
app.addEventListener('change',e=>{if(e.target?.id==='state-import-file')importStateFile(e.target.files?.[0])});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&state.current?.startedAt)requestWakeLock()});try{route('splash')}catch(error){console.error(error);shell(`<section class="stack center"><p class="eyebrow">STRATEGOS</p><h2>Unable to start.</h2><p class="muted">Refresh the page.</p></section>`)}
