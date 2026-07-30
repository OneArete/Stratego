// Both the Belief System (ADR-022) and Advisor Memory (ADR-024) already
// compute a specific, truthful statement about why a judgement shaped itself
// the way it did — but both were only ever rendered inside "How this
// judgement was formed", a collapsed detail panel a person has to choose to
// open. Someone who never opens it never sees that Strategos noticed
// anything about them at all, even when it did. This module picks the single
// most relevant existing statement and makes it available to surface
// proactively on Today, without inventing any new claim — it is a different
// rendering of data these two systems already produced, not a new inference.

export function describeProactiveInsight(judgement) {
  const practiceId = judgement?.practice?.id;
  if (!practiceId) return null;

  const beliefAdjustments = judgement.agora?.beliefAdjustments || [];
  const belief = beliefAdjustments.find(item => item.practiceId === practiceId);
  if (belief?.statement) return { source: 'belief', statement: belief.statement };

  const memoryAdjustments = (judgement.advisors || [])
    .flatMap(advisor => (advisor.memory?.applied || [])
      .filter(item => item.practice === practiceId)
      .map(item => ({ ...item, advisor: advisor.advisor })));
  if (!memoryAdjustments.length) return null;

  const chosen = memoryAdjustments.find(item => item.status === 'confirmed') || memoryAdjustments[0];
  const direction = chosen.delta > 0 ? 'tends to help you more than usual' : 'has tended to help you less than usual';
  const observationWord = chosen.observations === 1 ? 'experience' : 'experiences';
  return {
    source: 'advisor-memory',
    statement: `${chosen.advisor} has noticed, from ${chosen.observations} reflected ${observationWord}, that this ${direction}.`
  };
}
