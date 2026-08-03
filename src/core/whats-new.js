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
    version: '0.63.0',
    headline: 'Accept means accepted for today',
    points: [
      'The artificial 30-minute start window and later scheduling choice have been removed.',
      'Accepting today’s judgement now creates one commitment for the day and reveals Begin Practice directly.',
      'If the accepted Practice is not started, Strategos records that fact when the day closes, without penalty or moral judgement.'
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
