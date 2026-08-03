export const COMMITMENT_STATUS={
  ACTIVE:'active',
  STARTED:'started',
  COMPLETED:'completed',
  CANCELLED:'cancelled',
  EXPIRED:'expired',
  NOT_COMPLETED:'not-completed'
};

export function createCommitment({
  judgement,
  choice,
  reason='',
  at=new Date().toISOString()
}={}){
  if(!judgement?.id)throw new Error('A judgement is required.');
  if(!choice?.id)throw new Error('An active person choice is required.');
  if(!['accept','choose-alternative'].includes(choice.action))
    throw new Error('Only an active choice can create a commitment.');

  const createdAt=new Date(at);
  const dayEndsAt=endOfLocalDay(createdAt);

  return {
    id:makeId('commitment'),
    judgementId:judgement.id,
    choiceId:choice.id,
    practiceId:choice.selectedPracticeId||judgement.practice?.id||null,
    startMode:'today',
    startAfterMinutes:0,
    reason:String(reason||'').trim(),
    createdAt:createdAt.toISOString(),
    notBeforeAt:createdAt.toISOString(),
    expiresAt:dayEndsAt.toISOString(),
    status:COMMITMENT_STATUS.ACTIVE,
    startedAt:null,
    completedAt:null,
    cancelledAt:null,
    cancelReason:null,
    notCompletedAt:null,
    consentVersion:2
  };
}

export function commitmentAvailability(commitment,now=Date.now()){
  if(!commitment)return {canStart:false,status:'missing',reason:'No commitment exists.'};
  if(commitment.status!==COMMITMENT_STATUS.ACTIVE)
    return {canStart:false,status:commitment.status,reason:`Commitment is ${commitment.status}.`};

  const current=Number(now);
  const notBefore=new Date(commitment.notBeforeAt||commitment.createdAt).getTime();
  const expires=new Date(commitment.expiresAt).getTime();

  // Backward compatibility for commitments created by releases that used scheduled windows.
  if(current<notBefore)return {
    canStart:false,
    status:'scheduled',
    waitMs:notBefore-current,
    reason:'The chosen start window has not opened yet.'
  };

  if(current>expires){
    const daily=commitment.startMode==='today'||Number(commitment.consentVersion||0)>=2;
    return {
      canStart:false,
      status:daily?COMMITMENT_STATUS.NOT_COMPLETED:COMMITMENT_STATUS.EXPIRED,
      reason:daily
        ?'The accepted Practice was not started before the day closed.'
        :'The commitment window expired and requires fresh consent.'
    };
  }

  return {
    canStart:true,
    status:COMMITMENT_STATUS.ACTIVE,
    remainingMs:expires-current,
    reason:'The accepted Practice may begin.'
  };
}

export function refreshExpiredCommitments(commitments=[],now=Date.now()){
  return (commitments||[]).map(item=>{
    const availability=commitmentAvailability(item,now);
    if(![COMMITMENT_STATUS.EXPIRED,COMMITMENT_STATUS.NOT_COMPLETED].includes(availability.status))return item;
    const at=new Date(now).toISOString();
    return availability.status===COMMITMENT_STATUS.NOT_COMPLETED
      ?{...item,status:COMMITMENT_STATUS.NOT_COMPLETED,notCompletedAt:at,closureReason:'accepted-not-started'}
      :{...item,status:COMMITMENT_STATUS.EXPIRED,expiredAt:at};
  });
}

export function markCommitmentNotCompleted(commitment,{
  reason='accepted-not-started',
  at=new Date().toISOString()
}={}){
  if(!commitment)throw new Error('A commitment is required.');
  if(commitment.status!==COMMITMENT_STATUS.ACTIVE)return commitment;
  return {
    ...commitment,
    status:COMMITMENT_STATUS.NOT_COMPLETED,
    notCompletedAt:at,
    closureReason:reason
  };
}

export function markCommitmentStarted(commitment,at=new Date().toISOString()){
  const availability=commitmentAvailability(commitment,new Date(at).getTime());
  if(!availability.canStart)throw new Error(availability.reason);
  return {
    ...commitment,
    status:COMMITMENT_STATUS.STARTED,
    startedAt:at
  };
}

export function markCommitmentCompleted(commitment,at=new Date().toISOString()){
  if(!commitment?.startedAt)throw new Error('Commitment must be started before completion.');
  return {
    ...commitment,
    status:COMMITMENT_STATUS.COMPLETED,
    completedAt:at
  };
}

export function cancelCommitment(commitment,{
  reason='person-cancelled',
  at=new Date().toISOString()
}={}){
  if(!commitment)throw new Error('A commitment is required.');
  if([COMMITMENT_STATUS.COMPLETED,COMMITMENT_STATUS.CANCELLED].includes(commitment.status))
    return commitment;
  return {
    ...commitment,
    status:COMMITMENT_STATUS.CANCELLED,
    cancelledAt:at,
    cancelReason:reason
  };
}

export function reconcileCommitments(state,now=Date.now()){
  const next=clone(state||{});
  next.commitments=refreshExpiredCommitments(next.commitments||[],now)
    .filter(item=>item?.id&&item?.judgementId&&item?.choiceId);

  const seen=new Set();
  next.commitments=next.commitments.filter(item=>{
    if(seen.has(item.id))return false;
    seen.add(item.id);
    return true;
  }).slice(0,200);

  if(next.current?.commitmentId){
    const current=next.commitments.find(item=>item.id===next.current.commitmentId);
    if(!current||[COMMITMENT_STATUS.CANCELLED,COMMITMENT_STATUS.EXPIRED,COMMITMENT_STATUS.NOT_COMPLETED,COMMITMENT_STATUS.COMPLETED].includes(current.status)){
      delete next.current.commitmentId;
    }
  }

  return next;
}

export function commitmentSummary(commitment,now=Date.now()){
  if(!commitment)return 'No commitment has been created.';
  const availability=commitmentAvailability(commitment,now);
  if(commitment.status===COMMITMENT_STATUS.CANCELLED)return 'Commitment cancelled without penalty.';
  if(commitment.status===COMMITMENT_STATUS.COMPLETED)return 'Commitment completed.';
  if(commitment.status===COMMITMENT_STATUS.STARTED)return 'Commitment started.';
  if(availability.status==='scheduled')return `Scheduled to open in ${Math.ceil(availability.waitMs/60000)} minutes.`;
  if(availability.status===COMMITMENT_STATUS.NOT_COMPLETED)return 'Accepted, but not started before the day closed.';
  if(availability.status===COMMITMENT_STATUS.EXPIRED)return 'Legacy commitment expired and requires fresh consent.';
  return 'Accepted for today.';
}

function endOfLocalDay(value){
  const end=new Date(value);
  end.setHours(23,59,59,999);
  return end;
}

function clone(value){return typeof structuredClone==='function'?structuredClone(value):JSON.parse(JSON.stringify(value))}
function makeId(prefix){return globalThis.crypto?.randomUUID?`${prefix}-${crypto.randomUUID()}`:`${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`}
