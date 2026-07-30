import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildTrendSeries, renderTrendSparkline, trendSummary, trendDirection } from '../src/core/trend-chart.js';

const app = fs.readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

const checkIns = [
  { day: '2026-07-20', signals: { sleep: 2, energy: 1, time: 15, challenge: 'body', soreness: 'none', emotionalLoad: 'usual' } },
  { day: '2026-07-21', signals: { sleep: 2, energy: 1, time: 15, challenge: 'body', soreness: 'none', emotionalLoad: 'usual' } },
  { day: '2026-07-22', signals: { sleep: 3, energy: 2, time: 15, challenge: 'body', soreness: 'none', emotionalLoad: 'usual' } },
  { day: '2026-07-23', signals: { sleep: 4, energy: 3, time: 15, challenge: 'body', soreness: 'none', emotionalLoad: 'usual' } }
];

test('buildTrendSeries extracts sleep and energy in chronological order, ignoring incomplete rows',()=>{
  const series=buildTrendSeries([...checkIns].reverse(),14);
  assert.equal(series.length,4);
  assert.equal(series[0].day,'2026-07-20');
  assert.equal(series[3].day,'2026-07-23');
  assert.equal(series[3].sleep,4);
  assert.equal(series[3].energy,3);
});

test('buildTrendSeries ignores rows without recorded signals',()=>{
  const series=buildTrendSeries([...checkIns,{day:'2026-07-24',signals:null}],14);
  assert.equal(series.length,4);
});

test('buildTrendSeries respects the limit, keeping the most recent days',()=>{
  const series=buildTrendSeries(checkIns,2);
  assert.equal(series.length,2);
  assert.equal(series[0].day,'2026-07-22');
  assert.equal(series[1].day,'2026-07-23');
});

test('trendDirection detects a rising trend when the second half averages meaningfully higher',()=>{
  const series=buildTrendSeries(checkIns,14);
  assert.equal(trendDirection(series,'sleep'),'rising');
  assert.equal(trendDirection(series,'energy'),'rising');
});

test('trendDirection reports flat for fewer than two points or no meaningful change',()=>{
  assert.equal(trendDirection([],'sleep'),'flat');
  assert.equal(trendDirection([{sleep:2,energy:1}],'sleep'),'flat');
  const flatSeries=[{sleep:2,energy:2},{sleep:2,energy:2},{sleep:2,energy:2},{sleep:2,energy:2}];
  assert.equal(trendDirection(flatSeries,'sleep'),'flat');
});

test('renderTrendSparkline requires at least two points and renders both series as SVG polylines',()=>{
  const single=renderTrendSparkline(buildTrendSeries(checkIns.slice(0,1),14));
  assert.equal(single.hasData,false);
  assert.equal(single.svg,'');
  const series=buildTrendSeries(checkIns,14);
  const result=renderTrendSparkline(series);
  assert.equal(result.hasData,true);
  assert.match(result.svg,/<svg/);
  assert.match(result.svg,/trend-line-sleep/);
  assert.match(result.svg,/trend-line-energy/);
  assert.match(result.svg,/role="img"/);
});

test('trendSummary states there is not enough data with fewer than two recorded days',()=>{
  const summary=trendSummary(buildTrendSeries(checkIns.slice(0,1),14));
  assert.equal(summary.hasEnoughData,false);
});

test('trendSummary produces a plain-language statement once at least two days exist',()=>{
  const series=buildTrendSeries(checkIns,14);
  const summary=trendSummary(series);
  assert.equal(summary.hasEnoughData,true);
  assert.match(summary.statement,/4 recorded days/);
  assert.match(summary.statement,/improving/);
});

test('Journey renders the trend chart section, descriptive only',()=>{
  assert.match(app,/trend-chart-card/);
  assert.match(app,/buildTrendSeries\(state\.dailyCheckIns,14\)/);
  assert.match(app,/No automatic judgement influence/);
});

test('the trend chart never claims influence over judgement, belief, or advisor mechanisms',()=>{
  const sectionStart=app.indexOf('trend-chart-card');
  const sectionEnd=app.indexOf('</section>',sectionStart);
  const section=app.slice(sectionStart,sectionEnd);
  assert.match(section,/Descriptive only/);
});
