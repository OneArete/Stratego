import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// v0.62.0 — accessibility/contrast audit, requested as part of the pre-deploy
// improvement pass. This computes real WCAG 2.x relative-luminance contrast
// ratios (not a guess) for every foreground/background pair introduced by the
// two new v0.62.0 overlays, plus a spot check of pre-existing core colors, so
// a future edit that quietly weakens contrast fails loudly here instead of
// only being discoverable on a real device.

function srgbToLin(c){ c/=255; return c<=0.03928? c/12.92 : Math.pow((c+0.055)/1.055,2.4); }
function luminance([r,g,b]){ const [R,G,B]=[srgbToLin(r),srgbToLin(g),srgbToLin(b)]; return 0.2126*R+0.7152*G+0.0722*B; }
function contrast(fg,bg){ const L1=luminance(fg),L2=luminance(bg); const [light,dark]=L1>L2?[L1,L2]:[L2,L1]; return (light+0.05)/(dark+0.05); }
function blend(fg,alpha,bg){ return fg.map((c,i)=>alpha*c+(1-alpha)*bg[i]); }
function hex(h){ h=h.replace('#',''); if(h.length===3) h=h.split('').map(c=>c+c).join(''); const n=parseInt(h,16); return [(n>>16)&255,(n>>8)&255,n&255]; }

const bg090909=hex('#090909');
const bgPanel=hex('#11110f');
const bgTabbar=[6,6,5];

// WCAG 2.x AA minimum for normal-size text.
const AA_NORMAL=4.5;

const pairs=[
  ['app-wide --muted body text on --bg', hex('#969086'), bg090909, AA_NORMAL],
  ["whats-new-card list text (#d6cec0) on --panel", hex('#d6cec0'), bgPanel, AA_NORMAL],
  ['install-guidance-banner body text (#d6cec0) on its near-opaque panel background', hex('#d6cec0'), bgPanel, AA_NORMAL],
  ['install-guidance-banner headline (#f1d9b0) on its panel background', hex('#f1d9b0'), bgPanel, AA_NORMAL],
  ['tabbar inactive label (rgba(222,215,203,.6)) blended over the tabbar background', blend(hex('#ded7cb'),0.6,bgTabbar), bgTabbar, AA_NORMAL],
  ['tabbar active label (#ddb974) on the tabbar background', hex('#ddb974'), bgTabbar, AA_NORMAL],
  ['primary action button text (#100e0a) on --bronze', hex('#100e0a'), hex('#b89458'), AA_NORMAL]
];

for(const [label,fg,bgc,minimum] of pairs){
  test(`contrast — ${label} — meets WCAG AA (${minimum}:1)`,()=>{
    const ratio=contrast(fg,bgc);
    assert.ok(ratio>=minimum,`expected contrast >= ${minimum}:1, measured ${ratio.toFixed(2)}:1`);
  });
}

test('the two new v0.62.0 dismiss controls reuse existing, already-sized tap targets rather than introducing undersized new ones',()=>{
  const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
  assert.match(app,/data-action="dismiss-whats-new">Got it<\/button>/,'reuses the full-width .action button, not a bespoke small control');
  assert.match(app,/class="action" data-action="dismiss-whats-new"/);
  assert.match(app,/class="text-btn" data-action="dismiss-install-guidance"/,'reuses the existing .text-btn class, already audited for its 14px padding tap target');
});
