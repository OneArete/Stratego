const polar = (cx, cy, radius, angle) => {
  const radians = (angle - 90) * Math.PI / 180;
  return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
};

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const pulseTiming = (index, emphasis = 0) => ({
  begin:`${(index * .72).toFixed(2)}s`,
  duration:(5.2 - emphasis * .55).toFixed(2)
});

const dominantScore = node =>
  Number(node.energy || 0) * .62 +
  Math.max(0, Number(node.momentum || 0)) * .24 +
  Number(node.confidence || 0) * .14;

const closedPath = nodes => {
  const parts = nodes.map((node,index) => `${index ? 'L' : 'M'} ${node.x.toFixed(1)} ${node.y.toFixed(1)}`);
  return `${parts.join(' ')} Z`;
};

const displacedPath = (nodes, center, dominantIndex, phase = 1) => {
  const displaced = nodes.map((node,index) => {
    const dx = node.x - center;
    const dy = node.y - center;
    const distance = Math.hypot(dx,dy) || 1;
    const neighbourDistance = Math.min(
      (index - dominantIndex + nodes.length) % nodes.length,
      (dominantIndex - index + nodes.length) % nodes.length
    );
    const dominantInfluence = neighbourDistance === 0 ? 1 : neighbourDistance === 1 ? .48 : neighbourDistance === 2 ? .18 : .06;
    const wave = Math.sin((index * 1.37) + phase * 1.7) * 2.2;
    const outward = 1.4 + dominantInfluence * 7.2 + wave;
    return {
      ...node,
      x:node.x + dx / distance * outward,
      y:node.y + dy / distance * outward
    };
  });
  return closedPath(displaced);
};

export function renderLivingGraph(graph, { compact = false, ambient = false } = {}) {
  const size = ambient ? 320 : compact ? 214 : 276;
  const center = size / 2;
  const radius = ambient ? 105 : compact ? 67 : 88;

  const scores = graph.nodes.map(dominantScore);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const dominantIndex = scores.indexOf(maxScore);
  const scoreRange = Math.max(.001,maxScore-minScore);

  const nodes = graph.nodes.map((node, index) => {
    const angle = index * 60;
    const point = polar(center, center, radius, angle);
    const emphasis = clamp((scores[index]-minScore)/scoreRange);
    const rawCore = (compact ? 3.4 : 4.1) + node.energy * (compact ? 3.9 : 5.1) + emphasis * 1.05;
    const core = Math.min(compact ? 8.8 : 11.2, rawCore);
    const halo = Math.min(compact ? 13.8 : 17.5, core + 3.2 + node.volatility * 4.2 + emphasis * 1.8);
    return {
      ...node,
      ...point,
      angle,
      core,
      halo,
      emphasis,
      dominant:index===dominantIndex,
      pulse:pulseTiming(index, emphasis)
    };
  });

  const connections = nodes.map((node, index) => {
    const next = nodes[(index + 1) % nodes.length];
    const edgeEmphasis = Math.max(node.emphasis,next.emphasis);
    const opacity = 0.13 + ((node.energy + next.energy) / 2) * 0.22 + edgeEmphasis * .1;
    const bend = (index % 2 ? -1 : 1) * (compact ? 3.2 : 4.8);
    const d1 = `M ${node.x.toFixed(1)} ${node.y.toFixed(1)} Q ${center} ${center} ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
    const d2 = `M ${node.x.toFixed(1)} ${node.y.toFixed(1)} Q ${(center+bend).toFixed(1)} ${(center-bend*.55).toFixed(1)} ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
    const begin=(index*.72).toFixed(2);
    return `<path class="graph-link ${edgeEmphasis>.82?'dominant-link':''}" style="opacity:${opacity.toFixed(2)};--edge:${edgeEmphasis.toFixed(2)}" d="${d1}">
      <animate attributeName="d" values="${d1};${d2};${d1}" dur="6.4s" begin="${begin}s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="${opacity.toFixed(2)};${Math.min(.72,opacity+.32).toFixed(2)};${opacity.toFixed(2)}" dur="4.32s" begin="${begin}s" repeatCount="indefinite" />
      <animate attributeName="stroke-width" values="1;2.1;1" dur="4.32s" begin="${begin}s" repeatCount="indefinite" />
    </path>`;
  }).join('');

  const membraneBase = closedPath(nodes);
  const membraneA = displacedPath(nodes,center,dominantIndex,.55);
  const membraneB = displacedPath(nodes,center,dominantIndex,1.25);
  const membraneC = displacedPath(nodes,center,dominantIndex,2.05);
  const membraneD = displacedPath(nodes,center,dominantIndex,2.85);

  const nodeMarkup = nodes.map(node => {
    const labelPoint = polar(center, center, radius + (compact ? 25 : 34), node.angle);
    const trend = node.momentum > 0.04 ? '↑' : node.momentum < -0.04 ? '↓' : '•';
    const haloOpacity=(0.05 + node.confidence * 0.09 + node.emphasis*.04).toFixed(2);
    return `<g class="graph-node ${node.dominant?'dominant-node':''}" data-dimension="${node.id}" style="--emphasis:${node.emphasis.toFixed(2)}">
      <circle class="node-halo" cx="${node.x}" cy="${node.y}" r="${node.halo.toFixed(1)}" style="opacity:${haloOpacity}">
        <animate attributeName="r" values="${node.halo.toFixed(1)};${(node.halo+1.8).toFixed(1)};${node.halo.toFixed(1)}" dur="${node.pulse.duration}s" begin="${node.pulse.begin}" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="${haloOpacity};${Math.min(.3,Number(haloOpacity)+.12).toFixed(2)};${haloOpacity}" dur="${node.pulse.duration}s" begin="${node.pulse.begin}" repeatCount="indefinite"/>
      </circle>
      <circle class="node-core" cx="${node.x}" cy="${node.y}" r="${node.core.toFixed(1)}">
        <animate attributeName="r" values="${node.core.toFixed(1)};${(node.core+1.05).toFixed(1)};${node.core.toFixed(1)}" dur="${node.pulse.duration}s" begin="${node.pulse.begin}" repeatCount="indefinite"/>
      </circle>
      <text class="node-label" x="${labelPoint.x.toFixed(1)}" y="${labelPoint.y.toFixed(1)}">${node.label}</text>
      <text class="node-trend" x="${node.x.toFixed(1)}" y="${(node.y + 2.6).toFixed(1)}">${trend}</text>
    </g>`;
  }).join('');

  const dominant = nodes[dominantIndex];

  return `<section class="living-graph ${compact ? 'compact' : ''} ${ambient ? 'ambient' : ''}" aria-label="Living Human Graph">
    ${ambient ? '' : `<div class="graph-heading"><div><p class="eyebrow">LIVING HUMAN GRAPH</p><h3>Your current pattern</h3></div><span class="graph-state">${graph.state}</span></div>`}
    <svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Six dimensions of human flourishing. ${dominant.label} currently has the strongest emphasis.">
      ${ambient ? '' : `<circle class="graph-orbit" cx="${center}" cy="${center}" r="${radius}"/>`}
      <path class="graph-membrane" d="${membraneBase}">
        <animate attributeName="d" values="${membraneBase};${membraneA};${membraneB};${membraneC};${membraneD};${membraneBase}" keyTimes="0;0.18;0.39.0.58;0.78;1" calcMode="spline" keySplines=".42 0 .58 1;.42 0 .58 1;.42 0 .58 1;.42 0 .58 1;.42 0 .58 1" dur="8.8s" repeatCount="indefinite"/>
      </path>
      <g class="graph-web">${connections}</g>
      <circle class="graph-pulse" cx="${center}" cy="${center}" r="${compact ? 15 : 20}"/>
      <circle class="graph-center" cx="${center}" cy="${center}" r="${compact ? 5.8 : 7.5}"/>
      ${nodeMarkup}
    </svg>
    ${ambient ? '' : `<p class="graph-note">A living pattern. <strong>${dominant.label}</strong> currently carries the strongest emphasis.</p>`}
  </section>`;
}
