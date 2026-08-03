import { localDayKey } from './daily-signals.js?v=0630r1';

// Continuity is currently only visible by opening Journey's trend chart or
// scrolling its daily story timeline — nothing on Today itself communicates
// "you have been showing up." This computes a simple, honest streak (based on
// recorded check-ins, not on completed practices or reflections, since a
// check-in is the one thing every counted day actually has in common) and is
// deliberately silent below two days: a "1-day streak" is just today, and
// showing it as a streak would be a small, needless invention of momentum
// that is not really there yet.

export function computeCheckInStreak(checkIns = [], now = new Date()) {
  const days = new Set((checkIns || []).map(item => item?.day).filter(Boolean));
  const todayKey = localDayKey(now);
  const includesToday = days.has(todayKey);
  const cursor = new Date(now);
  if (!includesToday) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (days.has(localDayKey(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { count, includesToday };
}

export function describeStreak(streak) {
  if (!streak || streak.count < 2) return null;
  return `${streak.count}-day streak`;
}
