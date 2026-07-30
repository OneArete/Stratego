import { normaliseDailySignals } from './daily-signals.js?v=0476p1';

// A real user opening a self-tracking app repeatedly wants an at-a-glance
// answer to "is this getting better?" without reading paragraphs. Every
// existing Journey section is text/list-based (daily story timeline, weekly
// review, deliberation archive) — none render the two signals the person
// enters most often (sleep, energy) as a shape the eye can read in one look.
// This module is descriptive only: it renders recorded history, it does not
// feed any judgement, advisor, or belief mechanism. Zero automatic influence.

export function buildTrendSeries(checkIns = [], limit = 14) {
  return [...(checkIns || [])]
    .filter(entry => entry?.day && entry?.signals)
    .sort((a, b) => String(a.day).localeCompare(String(b.day)))
    .slice(-limit)
    .map(entry => {
      const signals = normaliseDailySignals(entry.signals);
      return { day: entry.day, sleep: signals.sleep, energy: signals.energy };
    });
}

function clamp01(value) {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
}

export function trendDirection(series = [], key) {
  if (series.length < 2) return 'flat';
  const midpoint = Math.floor(series.length / 2);
  const earlier = series.slice(0, midpoint);
  const later = series.slice(midpoint);
  if (!earlier.length || !later.length) return 'flat';
  const avg = list => list.reduce((sum, point) => sum + point[key], 0) / list.length;
  const delta = avg(later) - avg(earlier);
  if (delta > 0.25) return 'rising';
  if (delta < -0.25) return 'falling';
  return 'flat';
}

export function renderTrendSparkline(series = [], options = {}) {
  const width = options.width || 280;
  const height = options.height || 96;
  const padding = 12;
  if (series.length < 2) return { svg: '', hasData: false };
  const sleepMax = 4;
  const energyMax = 3;
  const stepX = (width - padding * 2) / (series.length - 1);
  const yFor = (value, max) => padding + (1 - clamp01(value / max)) * (height - padding * 2);
  const lineFor = (key, max) => series
    .map((point, i) => `${(padding + i * stepX).toFixed(1)},${yFor(point[key], max).toFixed(1)}`)
    .join(' ');
  const dotsFor = (key, max, className) => series
    .map((point, i) => `<circle cx="${(padding + i * stepX).toFixed(1)}" cy="${yFor(point[key], max).toFixed(1)}" r="2.4" class="${className}"/>`)
    .join('');
  const svg = `<svg viewBox="0 0 ${width} ${height}" class="trend-sparkline-svg" role="img" aria-label="Sleep and energy across the last ${series.length} recorded days">` +
    `<polyline points="${lineFor('energy', energyMax)}" class="trend-line trend-line-energy"/>` +
    `<polyline points="${lineFor('sleep', sleepMax)}" class="trend-line trend-line-sleep"/>` +
    dotsFor('energy', energyMax, 'trend-dot trend-dot-energy') +
    dotsFor('sleep', sleepMax, 'trend-dot trend-dot-sleep') +
    `</svg>`;
  return { svg, hasData: true };
}

export function trendSummary(series = []) {
  if (series.length < 2) {
    return { hasEnoughData: false, statement: 'A trend appears once at least two recorded days exist.' };
  }
  const sleepTrend = trendDirection(series, 'sleep');
  const energyTrend = trendDirection(series, 'energy');
  const label = direction => direction === 'rising' ? 'improving' : direction === 'falling' ? 'declining' : 'holding steady';
  return {
    hasEnoughData: true,
    sleepTrend,
    energyTrend,
    statement: `Across ${series.length} recorded days, sleep is ${label(sleepTrend)} and energy is ${label(energyTrend)}.`
  };
}
