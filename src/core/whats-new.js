// v0.62.0 — In-app "What's New" disclosure.
//
// Root cause addressed: after shipping v0.60.0/v0.61.0, Pedro reported he could
// not tell anything had changed. The changes were real and present in the
// running app, but nothing on screen ever announced that a change had
// happened — the burden of noticing was entirely on the person. This module
// gives the app a small, honest voice for its own release notes: the single
// most recent entry is surfaced once, the first time a person opens the app
// after the version advances, then never shown again for that version.
//
// Deliberately shows only the single latest entry rather than a cumulative
// backlog: if someone skips several versions, a wall of old notes is worse
// than a short, current one. This keeps the mechanism honest without turning
// into a changelog viewer.

export const WHATS_NEW_ENTRIES = [
  {
    version: '0.72.0',
    headline: 'Returning to Practice is now one clear decision',
    points: [
      'Resume Practice is the single dominant action after an interruption.',
      'Ending early remains available without competing with resuming.',
      'Permanent discard is protected behind a deliberate disclosure.'
    ]
  },
  {
    version: '0.71.0',
    headline: 'Ending a Practice is now calm and reliable',
    points: [
      'Continue remains the only dominant action when leaving an active Practice.',
      'Ending early records the moment without breaking the session flow.',
      'Permanent discard is now protected behind a deliberate disclosure.'
    ]
  },
  {
    version: '0.67.0',
    headline: 'Practice now feels like one continuous moment',
    points: [
      'The active Practice surface is quieter, more focused and dominated by one cue.',
      'Progress and the next phase remain visible without competing with the action.',
      'Completion now pauses before Reflection so the person can notice the result first.'
    ]
  },
  {
    version: '0.66.0',
    headline: 'A new person can now understand Strategos before using it',
    points: [
      'The first experience now explains the human problem before any product mechanics.',
      'Strategos is introduced as one clear direction for the reality of today — never as a dashboard or a coach.',
      'The final step moves directly into understanding today with only a name required.'
    ]
  },
  {
    version: '0.65.0',
    headline: 'Today now gets out of the way after you decide',
    points: [
      'After acceptance, the decision controls disappear and Today becomes one executable commitment.',
      'Begin Practice is now the single dominant action, including when a safety boundary needs acknowledgement.',
      'Reflection and obstacle planning remain outside the pre-Practice commitment state.'
    ]
  },
  {
    version: '0.64.0',
    headline: 'The Strategos Kernel is now active',
    points: [
      'Today now receives one canonical state and one next action from the Strategos Kernel.',
      'The Kernel blocks deliberation until current-day evidence is sufficient.',
      'Every new recommendation is preserved as an explicit Current Judgement with reason, confidence, unknowns, risk and validity.'
    ]
  },
  {
    version: '0.62.0',
    headline: 'A few things changed since you last looked',
    points: [
      'This note: Strategos now tells you, once, when something has changed — so an update is never invisible again.',
      'If you are not using the installed Home Screen version, a one-time note now explains why that matters.'
    ]
  },
  {
    version: '0.61.0',
    headline: 'Organism labels and the bottom bar',
    points: [
      'The six dimension labels around the organism are now sized so the longest one ("Relationships") no longer throws the shape off-center.',
      'The bottom navigation bar was rebuilt as one authoritative rule instead of competing with itself.'
    ]
  },
  {
    version: '0.60.0',
    headline: 'The organism now tells you what it noticed',
    points: [
      'When your day closes, the organism reveals one sentence naming what stood out, instead of going silent.',
      'A streak badge appears once you have two or more days of check-ins in a row.',
      'Repeating yesterday’s check-in is now one tap when nothing has changed.'
    ]
  }
];

export function pendingWhatsNewEntry(seenVersion, entries = WHATS_NEW_ENTRIES){
  const latest = entries[0] || null;
  if(!latest) return null;
  if(seenVersion === latest.version) return null;
  return latest;
}

export const CURRENT_APP_VERSION = WHATS_NEW_ENTRIES[0]?.version || null;
