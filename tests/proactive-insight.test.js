import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { describeProactiveInsight } from '../src/core/proactive-insight.js';

const app = fs.readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

test('returns null when there is no winning practice on the judgement',()=>{
  assert.equal(describeProactiveInsight(null),null);
  assert.equal(describeProactiveInsight({}),null);
});

test('returns null when neither a belief nor advisor memory adjustment touched the winning practice',()=>{
  const judgement={practice:{id:'strength'},agora:{beliefAdjustments:[]},advisors:[{advisor:'Body',memory:{applied:[]}}]};
  assert.equal(describeProactiveInsight(judgement),null);
});

test('prefers a confirmed belief statement over an advisor memory adjustment for the same practice',()=>{
  const judgement={
    practice:{id:'strength'},
    agora:{beliefAdjustments:[{practiceId:'strength',adjustment:.08,statement:'Strength has 82% weighted helpfulness across 5 person-reported outcomes.'}]},
    advisors:[{advisor:'Body',memory:{applied:[{practice:'strength',delta:.05,observations:4,status:'confirmed'}]}}]
  };
  const insight=describeProactiveInsight(judgement);
  assert.equal(insight.source,'belief');
  assert.equal(insight.statement,'Strength has 82% weighted helpfulness across 5 person-reported outcomes.');
});

test('falls back to an advisor memory adjustment when no belief exists for the winning practice, preferring confirmed status',()=>{
  const judgement={
    practice:{id:'walk'},
    agora:{beliefAdjustments:[]},
    advisors:[
      {advisor:'Recovery',memory:{applied:[{practice:'walk',delta:-.03,observations:2,status:'candidate'}]}},
      {advisor:'Body',memory:{applied:[{practice:'walk',delta:.06,observations:5,status:'confirmed'}]}}
    ]
  };
  const insight=describeProactiveInsight(judgement);
  assert.equal(insight.source,'advisor-memory');
  assert.equal(insight.statement,'Body has noticed, from 5 reflected experiences, that this tends to help you more than usual.');
});

test('describes a negative advisor memory adjustment honestly, without a belief present',()=>{
  const judgement={
    practice:{id:'focus'},
    agora:{beliefAdjustments:[]},
    advisors:[{advisor:'Mind',memory:{applied:[{practice:'focus',delta:-.04,observations:1,status:'candidate'}]}}]
  };
  const insight=describeProactiveInsight(judgement);
  assert.equal(insight.statement,'Mind has noticed, from 1 reflected experience, that this has tended to help you less than usual.');
});

test('ignores adjustments attached to a different practice than the one that won',()=>{
  const judgement={
    practice:{id:'strength'},
    agora:{beliefAdjustments:[{practiceId:'walk',adjustment:.1,statement:'Walk has high helpfulness.'}]},
    advisors:[{advisor:'Body',memory:{applied:[{practice:'recovery',delta:.05,observations:4,status:'confirmed'}]}}]
  };
  assert.equal(describeProactiveInsight(judgement),null);
});

test('Today surfaces a proactive insight for the judgement moment, derived from the same judgement it renders',()=>{
  assert.match(app,/describeProactiveInsight\(gate\.judgement\)/);
  assert.match(app,/model\.mode===['"]judgement['"]\?describeProactiveInsight/);
});
