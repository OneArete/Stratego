const polar = (cx, cy, radius, angle) => {
  const radians = (angle - 90) * Math.PI / 180;
  return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
};

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const round = value => Number(value).toFixed(1);

const stableNoise = text => {
  let hash = 2166136261;
  for (const char of String(text)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 1000) / 1000;
};

const dominantScore = node =>
  Number(node.energy || 0) * .62 +
  Math.max(0, Number(node.momentum || 0)) * .24 +
  Number(node.confidence || 0) * .14;

const closedCurve = nodes => {
  if (!nodes.length) return '';
  const mid = (a,b) => ({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
  const firstMid = mid(nodes[nodes.length-1],nodes[0]);
  let path = `M ${round(firstMid.x)} ${round(firstMid.y)}`;
  nodes.forEach((node,index)=>{
    const next=nodes[(index+1)%nodes.length];
    const nextMid=mid(node,next);
    path += ` Q ${round(node.x)} ${round(node.y)} ${round(nextMid.x)} ${round(nextMid.y)}`;
  });
  return `${path} Z`;
};

const displacedNodes = (nodes, center, dominantIndex, phase = 1) => nodes.map((node,index) => {
  const dx = node.x - center;
  const dy = node.y - center;
  const distance = Math.hypot(dx,dy) || 1;
  const neighbourDistance = Math.min(
    (index - dominantIndex + nodes.length) % nodes.length,
    (dominantIndex - index + nodes.length) % nodes.length
  );
  const dominantInfluence = neighbourDistance === 0 ? 1 : neighbourDistance === 1 ? .44 : neighbourDistance === 2 ? .16 : .05;
  const wave = Math.sin((index * 1.41) + phase * 1.73) * 1.65;
  const outward = .9 + dominantInfluence * 4.8 + wave;
  return {...node,x:node.x+dx/distance*outward,y:node.y+dy/distance*outward};
});

const filamentPath = (from,to,center,index,phase=0) => {
  const mx=(from.x+to.x)/2;
  const my=(from.y+to.y)/2;
  const vx=mx-center;
  const vy=my-center;
  const length=Math.hypot(vx,vy)||1;
  const normal={x:-vy/length,y:vx/length};
  const inward=.18 + ((index%2)*.035);
  const organic=(stableNoise(`${from.id}:${to.id}`)-.5)*9 + Math.sin(index+phase)*2.2;
  const c1={
    x:from.x+(mx-from.x)*.55+(center-mx)*inward+normal.x*organic,
    y:from.y+(my-from.y)*.55+(center-my)*inward+normal.y*organic
  };
  const c2={
    x:to.x+(mx-to.x)*.55+(center-mx)*inward-normal.x*organic*.72,
    y:to.y+(my-to.y)*.55+(center-my)*inward-normal.y*organic*.72
  };
  return `M ${round(from.x)} ${round(from.y)} C ${round(c1.x)} ${round(c1.y)} ${round(c2.x)} ${round(c2.y)} ${round(to.x)} ${round(to.y)}`;
};


const renderAmbientOrganism = (graph,size,center) => {
  const nodes=(graph?.nodes||[]).slice(0,6);
  const radius=92;
  const points=nodes.map((node,index)=>({...node,...polar(center,center,radius,index*60)}));
  const petals=points.map((point,index)=>{
    const next=points[(index+1)%points.length];
    const opposite=points[(index+3)%points.length];
    const path=`M ${round(center)} ${round(center)} C ${round((center+point.x)/2)} ${round((center+point.y)/2)} ${round(point.x)} ${round(point.y)} ${round(next.x)} ${round(next.y)} C ${round((next.x+center)/2)} ${round((next.y+center)/2)} ${round((opposite.x+center)/2)} ${round((opposite.y+center)/2)} ${round(center)} ${round(center)}`;
    return `<path class="organism-petal" d="${path}" style="--petal-index:${index}"/>`;
  }).join('');
  const filaments=points.map((point,index)=>{
    const opposite=points[(index+3)%points.length];
    return `<path class="organism-filament" d="M ${round(point.x)} ${round(point.y)} Q ${round(center)} ${round(center)} ${round(opposite.x)} ${round(opposite.y)}"/>`;
  }).join('');
  const nuclei=points.map((point,index)=>`<g class="organism-nucleus" style="--nucleus-index:${index}"><circle cx="${round(point.x)}" cy="${round(point.y)}" r="8.5"/><circle class="organism-nucleus-core" cx="${round(point.x)}" cy="${round(point.y)}" r="3.2"/></g>`).join('');
  return `<section class="living-graph ambient living-organism" aria-label="Living Human Organism">
    <div class="organism-depth" aria-hidden="true"></div>
    <svg viewBox="0 0 ${size} ${size}" role="img" aria-label="A calm, balanced living representation awaiting today's evidence.">
      <g class="organism-body">
        <circle class="organism-boundary organism-boundary-outer" cx="${center}" cy="${center}" r="116"/>
        <circle class="organism-boundary organism-boundary-inner" cx="${center}" cy="${center}" r="70"/>
        <g class="organism-petals">${petals}</g>
        <g class="organism-filaments">${filaments}</g>
        <circle class="organism-heart-aura" cx="${center}" cy="${center}" r="24"/>
        <circle class="organism-heart" cx="${center}" cy="${center}" r="8"/>
        ${nuclei}
      </g>
    </svg>
  </section>`;
};
export function renderLivingGraph(graph, { compact = false, ambient = false } = {}) {
  const size = ambient ? 340 : compact ? 214 : 276;
  const center = size / 2;
  if (ambient) return renderAmbientOrganism(graph,size,center);
  const radius = ambient ? 105 : compact ? 67 : 88;
  const scores = graph.nodes.map(dominantScore);
  const neutral = graph.nodes.length > 0 && graph.nodes.every((node,index,array) =>
    Math.abs(Number(node.energy||0)-Number(array[0].energy||0)) < .0001 &&
    Math.abs(Number(node.momentum||0)) < .0001 &&
    Math.abs(Number(node.confidence||0)-Number(array[0].confidence||0)) < .0001
  );
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const dominantIndex = scores.indexOf(maxScore);
  const scoreRange = Math.max(.001,maxScore-minScore);

  const nodes = graph.nodes.map((node,index)=>{
    const emphasis=neutral ? 0 : clamp((scores[index]-minScore)/scoreRange);
    const irregularity=neutral ? 0 : (stableNoise(node.id)-.5)*(ambient?4.2:2.8);
    const angle=index*60+(neutral ? 0 : (stableNoise(`${node.id}:angle`)-.5)*(ambient?2.4:1.4));
    const localRadius=radius+irregularity+emphasis*(ambient?2.0:1.2);
    const point=polar(center,center,localRadius,angle);
    const core=Math.min(compact?8.4:ambient?10.8:10.6,(compact?3.4:4.1)+node.energy*(compact?3.8:5)+emphasis*.9);
    const halo=Math.min(compact?13.4:ambient?19:17,core+3+node.volatility*4+emphasis*1.5);
    return {...node,...point,angle,core,halo,emphasis,dominant:index===dominantIndex};
  });

  const membranePhases=[0,.65,1.35,2.1,2.85];
  const membraneFrames=neutral
    ? membranePhases.map(()=>closedCurve(nodes))
    : membranePhases.map(phase=>closedCurve(displacedNodes(nodes,center,dominantIndex,phase)));

  const connections=nodes.map((node,index)=>{
    const next=nodes[(index+1)%nodes.length];
    const edgeEmphasis=Math.max(node.emphasis,next.emphasis);
    const energy=(Number(node.energy||0)+Number(next.energy||0))/2;
    const opacity=.12+energy*.2+edgeEmphasis*.13;
    const base=neutral ? `M ${round(node.x)} ${round(node.y)} Q ${round(center)} ${round(center)} ${round(next.x)} ${round(next.y)}` : filamentPath(node,next,center,index,0);
    const drift=neutral ? base : filamentPath(node,next,center,index,.72);
    const begin=(index*-.93).toFixed(2);
    return `<path class="graph-link ${edgeEmphasis>.78?'dominant-link':''}" style="--edge:${edgeEmphasis.toFixed(2)};--filament-opacity:${opacity.toFixed(2)}" d="${base}">
      <animate attributeName="d" values="${base};${drift};${base}" dur="14s" begin="${begin}s" repeatCount="indefinite" />
    </path>`;
  }).join('');

  const nodeMarkup=nodes.map((node,index)=>{
    const labelPoint=polar(center,center,radius+(ambient?39:compact?25:34),node.angle);
    const haloOpacity=(.04+node.confidence*.08+node.emphasis*.04).toFixed(2);
    const duration=(12.6+(stableNoise(`${node.id}:breath`)-.5)*3.4).toFixed(2);
    const delay=(-index*1.17).toFixed(2);
    const trend=node.momentum>.04?'↑':node.momentum<-.04?'↓':'•';
    return `<g class="graph-node ${node.dominant?'dominant-node':''}" data-dimension="${node.id}" style="--emphasis:${node.emphasis.toFixed(2)};--node-duration:${duration}s;--node-delay:${delay}s">
      <circle class="node-halo" cx="${round(node.x)}" cy="${round(node.y)}" r="${round(node.halo)}" style="opacity:${haloOpacity}"/>
      <circle class="node-core" cx="${round(node.x)}" cy="${round(node.y)}" r="${round(node.core)}"/>
      <text class="node-label" x="${round(labelPoint.x)}" y="${round(labelPoint.y)}">${node.label}</text>
      <text class="node-trend" x="${round(node.x)}" y="${round(node.y+2.6)}">${trend}</text>
    </g>`;
  }).join('');

  const dominant=nodes[dominantIndex];
  return `<section class="living-graph ${compact?'compact':''} ${ambient?'ambient':''}" aria-label="Living Human Graph">
    ${ambient?'':`<div class="graph-heading"><div><p class="eyebrow">LIVING HUMAN GRAPH</p><h3>Your current pattern</h3></div><span class="graph-state">${graph.state}</span></div>`}
    <div class="organism-depth" aria-hidden="true"></div>
    <svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Six dimensions of human flourishing. ${dominant.label} currently has the strongest emphasis.">
      <g class="organism-body">
        <path class="graph-membrane graph-membrane-shadow" d="${membraneFrames[0]}"/>
        <path class="graph-membrane" d="${membraneFrames[0]}">
          <animate attributeName="d" values="${membraneFrames.join(';')};${membraneFrames[0]}" keyTimes="0;.18;.39;.58;.78;1" calcMode="spline" keySplines=".42 0 .58 1;.42 0 .58 1;.42 0 .58 1;.42 0 .58 1;.42 0 .58 1" dur="18s" repeatCount="indefinite"/>
        </path>
        <g class="graph-web">${connections}</g>
        <circle class="graph-pulse graph-pulse-outer" cx="${center}" cy="${center}" r="${compact?18:ambient?26:22}"/>
        <circle class="graph-pulse graph-pulse-inner" cx="${center}" cy="${center}" r="${compact?11:ambient?16:14}"/>
        <circle class="graph-center" cx="${center}" cy="${center}" r="${compact?5.8:ambient?7.8:7.5}"/>
        ${nodeMarkup}
      </g>
    </svg>
    ${ambient?'':`<p class="graph-note">A living pattern. <strong>${dominant.label}</strong> currently carries the strongest emphasis.</p>`}
  </section>`;
}
