/* ══════════════════════════════════════════════════════════════
   CHALMA ART — Generator
   Produces deterministic artwork metadata from a seed (1–50000)
   ══════════════════════════════════════════════════════════════ */

'use strict';

/* ── Family definitions ── */
const FAMILIES = [
  {
    id: 0, name: 'Fractales', icon: '❄️',
    seeds: [1, 5000],
    desc: 'Mandelbrot, Julia, Newton, IFS et autres fractales infinies.',
    color: '#c9a84c',
    algorithms: [
      'mandelbrot','julia','burning_ship','newton','phoenix',
      'tricorn','buddhabrot','lyapunov','ifs_fern','ifs_dragon',
      'mandelbox','julia_param','multibrot','magnet','celtic'
    ]
  },
  {
    id: 1, name: 'Attracteurs', icon: '🌀',
    seeds: [5001, 10000],
    desc: 'Lorenz, Rössler, Chen, Sprott et autres attracteurs chaotiques.',
    color: '#00fff0',
    algorithms: [
      'lorenz','rossler','chen','aizawa','halvorsen',
      'dadras','sprott','thomas','dequan_li','arneodo',
      'burke_shaw','nose_hoover','chua','rabinovich','langford'
    ]
  },
  {
    id: 2, name: 'Particules', icon: '✨',
    seeds: [10001, 15000],
    desc: 'Champs magnétiques, gravité N-corps, boids et particules quantiques.',
    color: '#ff00aa',
    algorithms: [
      'magnetic_dipole','n_body','boids','sph_fluid','electrostatic',
      'quantum_superpos','brownian','reaction_chem','surface_riemann','vortex'
    ]
  },
  {
    id: 3, name: 'Automates', icon: '⬛',
    seeds: [15001, 20000],
    desc: "Conway, règles de Wolfram, Langton's Ant, Lenia et SmoothLife.",
    color: '#39ff14',
    algorithms: [
      'conway','wolfram1d','langton_ant','brians_brain','wireworld',
      'lenia','smoothlife','multiple_neighborhood','generations','vote'
    ]
  },
  {
    id: 4, name: 'Ondes', icon: '〰️',
    seeds: [20001, 25000],
    desc: "Figures de Chladni, séries de Fourier, solitons et ondes de Schrödinger.",
    color: '#8844ff',
    algorithms: [
      'chladni','fourier_series','standing_wave_2d','interference','kdv_soliton',
      'schrodinger','vibrating_string','membrane_2d','faraday','phonon'
    ]
  },
  {
    id: 5, name: 'Géométrie', icon: '🔷',
    seeds: [25001, 30000],
    desc: 'L-systems, spirographes, courbes paramétriques, surfaces minimales.',
    color: '#e8c96a',
    algorithms: [
      'lsystem','spirograph','lissajous_3d','sacred_geometry','rose_curve',
      'fermat_spiral','minimal_surface','torus_knot','polytope_4d','hypocycloid'
    ]
  },
  {
    id: 6, name: 'Fluides', icon: '💧',
    seeds: [30001, 35000],
    desc: 'Navier-Stokes, Gray-Scott, Belousov-Zhabotinsky et turbulences.',
    color: '#00bfff',
    algorithms: [
      'navier_stokes','gray_scott','turing_morpho','belousov','optical_flow',
      'kolmogorov','rayleigh_benard','kelvin_helmholtz','cahn_hilliard','swift_hohenberg'
    ]
  },
  {
    id: 7, name: 'Organique', icon: '🌿',
    seeds: [35001, 40000],
    desc: 'DLA, slime mold, phyllotaxie, vascularisation et croissance de coquillages.',
    color: '#7fff00',
    algorithms: [
      'dla','physarum','bacterial_colony','phyllotaxis','shell_growth',
      'vascular_cco','lightning','river_network','eden_growth','dbm'
    ]
  },
  {
    id: 8, name: 'Cosmique', icon: '🌌',
    seeds: [40001, 45000],
    desc: 'Galaxies spirales, nébuleuses, trous noirs, cosmic web et aurores.',
    color: '#ff6b35',
    algorithms: [
      'spiral_galaxy','nebula','supernova','black_hole','cosmic_web',
      'impact_crater','aurora','comet','planetary_system','pulsar'
    ]
  },
  {
    id: 9, name: 'Neural', icon: '🧠',
    seeds: [45001, 50000],
    desc: 'Perceptrons animés, SOM, Hopfield, réseaux convolutifs visualisés.',
    color: '#da70d6',
    algorithms: [
      'perceptron','som_kohonen','hopfield','convnet_features','lstm_unrolled',
      'boltzmann','growing_neural_gas','echo_state','cellular_nn','reservoir'
    ]
  }
];

/* ── Title generation vocabulary ── */
const TITLE_VOCAB = {
  adj: [
    'Éternel','Cristallin','Silencieux','Vibrant','Doré','Fractal','Quantique',
    'Infini','Lumineux','Sombre','Céleste','Profond','Mystique','Asymptotique',
    'Résonant','Chaotique','Ordonné','Fluide','Rigide','Emergent','Latent',
    'Récursif','Singulier','Pluriel','Convergent','Divergent','Tourbillonnant',
    'Pulsant','Gelé','Brûlant','Spiralé','Fracturé','Tissé','Entrelacé',
    'Harmonique','Dissonant','Radiant','Absorbant','Transitoire','Permanent',
    'Subliminal','Transcendant','Immanent','Ondulant','Scintillant','Opaque',
    'Translucide','Magnétique','Électrique','Gravitationnel','Nucléaire'
  ],
  noun: [
    'Cascade','Cristal','Nébuleuse','Attracteur','Tourbillon','Fractale',
    'Résonance','Soliton','Membrane','Vortex','Labyrinthe','Spirale',
    'Constellation','Équilibre','Singularité','Horizon','Manifold','Tenseur',
    'Champ','Onde','Particule','Symétrie','Divergence','Flux','Gradient',
    'Orbite','Trajectoire','Frontière','Limite','Infini','Zéro','Unité',
    'Dualité','Trinité','Nexus','Matrice','Réseau','Tissu','Trame',
    'Écho','Miroir','Ombre','Lumière','Feu','Glace','Vent','Terre',
    'Cristallisation','Dissolution','Transformation','Émergence','Convergence'
  ],
  prep: [
    'de l\'Infini','du Chaos','du Vide','de la Lumière','des Étoiles',
    'du Temps','de l\'Espace','des Profondeurs','du Silence','de l\'Éveil',
    'du Néant','de l\'Être','des Mathématiques','du Code','de l\'Algorithme',
    'des Nombres','des Formes','des Forces','des Couleurs','des Vibrations',
    'N°' // triggers numeric suffix
  ]
};

const EQUATIONS = {
  0: ['z_{n+1} = z_n² + c', 'z → z² + c, |z| < 2', 'f(z) = zⁿ − 1', 'z_{n+1} = z_n² + z_{n-1} + c'],
  1: ['ẋ = σ(y−x), ẏ = x(ρ−z)−y, ż = xy−βz', 'ẋ = −y−z, ẏ = x+ay, ż = b+z(x−c)', 'ẋ = αx−βy+δxz, ẏ = γy−δxz, ż = 1−z(x²+y²)/c'],
  2: ['F = q(E + v×B)', 'aᵢ = G·Σⱼ mⱼ(rⱼ−rᵢ)/|rⱼ−rᵢ|³', '∂f/∂t + v·∇f = 0'],
  3: ['s(t+1) = f(Σ nᵢ(t))', 'A → AB, B → A', 'Rule 110: 01110111'],
  4: ['∂²u/∂t² = c²∇²u', 'u(x,t) = A·cos(kx−ωt)', '∂ψ/∂t = iħ∇²ψ/2m − iV(x)ψ/ħ'],
  5: ['x = (R−r)cos(θ) + d·cos((R−r)θ/r)', 'F(θ) = L(F) → aF[+F]F[−F]F', 'r = cos(nθ)'],
  6: ['∂u/∂t = Du∇²u − uv² + f(1−u)', '∂v/∂t = Dv∇²v + uv² − (f+k)v', '∂ω/∂t + (u·∇)ω = ν∇²ω'],
  7: ['∂φ/∂t = Δφ − f(φ)', 'xₙ₊₁ = xₙ + Δt·v(xₙ,t)', 'dR/dθ = ae^(bθ)'],
  8: ['v_c = √(GM/r)', 'L = ∫ρΦdV', 'Rμν − ½Rgμν = 8πGTμν/c⁴'],
  9: ['yⱼ = σ(Σ wᵢⱼxᵢ + bⱼ)', 'Δwᵢⱼ = η·δⱼ·xᵢ', 'E = −½Σᵢⱼ wᵢⱼsᵢsⱼ']
};

const TAGS_BY_FAMILY = {
  0: ['fractale','récursion','infini','chaos','complexe','self-similar'],
  1: ['chaos','attracteur','système dynamique','bifurcation','trajectoire'],
  2: ['simulation','physique','collectif','émergent','interaction'],
  3: ['automate','cellulaire','règle','évolution','vie artificielle'],
  4: ['onde','vibration','résonance','fréquence','interférence'],
  5: ['géométrie','symétrie','procédural','nature','mathématique'],
  6: ['fluide','diffusion','réaction','morphogenèse','pattern'],
  7: ['croissance','organique','nature','diffusion','agrégation'],
  8: ['cosmos','astrophysique','gravité','espace-temps','lumière'],
  9: ['réseau','apprentissage','neurone','connexion','intelligence']
};

/* ── Palette generation ── */
function generatePalette(rng, familyId) {
  // Each family has a dominant hue range
  const hueRanges = [
    [200, 280], // fractales: blue-purple
    [160, 200], // attracteurs: cyan-teal
    [280, 340], // particules: pink-magenta
    [100, 150], // automates: green
    [240, 280], // ondes: purple
    [40, 70],   // géométrie: gold-yellow
    [180, 220], // fluides: blue-cyan
    [80, 130],  // organique: green
    [10, 40],   // cosmique: orange-red
    [280, 320]  // neural: purple-pink
  ];

  const [hMin, hMax] = hueRanges[familyId] || [0, 360];
  const h1 = rng.range(hMin, hMax);
  const h2 = (h1 + rng.range(30, 120)) % 360;
  const h3 = (h1 + rng.range(150, 210)) % 360;
  const h4 = rng.range(40, 65); // always a gold-ish accent

  const s = rng.range(70, 100);
  const l1 = rng.range(45, 70);
  const l2 = rng.range(35, 60);

  return {
    bg:      `hsl(${rng.range(220,260)}, ${rng.range(15,35)}%, ${rng.range(2,6)}%)`,
    primary: `hsl(${h1}, ${s}%, ${l1}%)`,
    secondary:`hsl(${h2}, ${rng.range(60,100)}%, ${l2}%)`,
    accent:  `hsl(${h3}, ${rng.range(80,100)}%, ${rng.range(50,75)}%)`,
    gold:    `hsl(${h4}, ${rng.range(60,85)}%, ${rng.range(50,65)}%)`,
    dark:    `hsl(${h1}, ${rng.range(20,40)}%, ${rng.range(6,12)}%)`,
    // Raw values for canvas usage
    h1, h2, h3, s, l1, l2
  };
}

/* ── Audio profile ── */
function generateAudioProfile(rng, familyId) {
  const profiles = [
    { type: 'arpeggio',   baseFreq: rng.range(220, 440),   waveform: 'sine',     reverb: 0.3 },
    { type: 'drone',      baseFreq: rng.range(40, 100),    waveform: 'sawtooth', reverb: 0.8 },
    { type: 'granular',   baseFreq: rng.range(400, 800),   waveform: 'noise',    reverb: 0.4 },
    { type: 'rhythmic',   baseFreq: rng.range(100, 200),   waveform: 'square',   reverb: 0.2 },
    { type: 'pure_tone',  baseFreq: rng.range(200, 600),   waveform: 'sine',     reverb: 0.5 },
    { type: 'spherical',  baseFreq: rng.range(150, 400),   waveform: 'sine',     reverb: 0.6 },
    { type: 'filtered',   baseFreq: rng.range(80, 200),    waveform: 'noise',    reverb: 0.4 },
    { type: 'nature',     baseFreq: rng.range(200, 500),   waveform: 'triangle', reverb: 0.5 },
    { type: 'pad',        baseFreq: rng.range(60, 150),    waveform: 'sawtooth', reverb: 0.95 },
    { type: 'glitch',     baseFreq: rng.range(300, 1200),  waveform: 'square',   reverb: 0.2 }
  ];

  const profile = profiles[familyId] || profiles[0];
  return {
    ...profile,
    harmonics:  Array.from({ length: rng.int(2, 8) }, (_, i) => rng.range(0.05, 1 / (i + 1))),
    tempo:      rng.range(60, 180),
    scale:      rng.pick(['pentatonic','major','minor','chromatic','lydian']),
    detune:     rng.range(0, 20),
    attack:     rng.range(0.05, 0.5),
    decay:      rng.range(0.1, 1.0),
    sustain:    rng.range(0.3, 0.9),
    release:    rng.range(0.5, 3.0)
  };
}

/* ── Title generation ── */
function generateTitle(rng, familyId) {
  const { adj, noun, prep } = TITLE_VOCAB;
  const family = FAMILIES[familyId];

  const pattern = rng.int(0, 5);
  switch (pattern) {
    case 0: return `${rng.pick(adj)} ${rng.pick(noun)} ${rng.pick(prep).replace('N°', '')}`.trim();
    case 1: return `${rng.pick(noun)} ${rng.pick(prep).replace('N°', 'N°' + rng.int(1, 9999))}`;
    case 2: return `${family.name} — ${rng.pick(adj)} ${rng.pick(noun)}`;
    case 3: return `${rng.pick(adj)} ${rng.pick(noun)}`;
    case 4: return `${rng.pick(noun)} de ${rng.pick(['Lorenz','Julia','Mandelbrot','Fourier','Turing','Voronoi','Newton','Euler','Gauss','Riemann'])}`;
    case 5: return `Étude N°${rng.int(1, 9999)} — ${rng.pick(adj)}`;
    default: return `${rng.pick(adj)} ${rng.pick(noun)}`;
  }
}

/* ── Description generation ── */
const DESCRIPTIONS = [
  (rng) => `Une exploration des profondeurs fractales où chaque itération révèle une complexité nouvelle. Les frontières entre l'ordre et le chaos se dissolvent dans une danse mathématique infinie.`,
  (rng) => `Un attracteur étrange naît de l'intersection de trois équations différentielles. La trajectoire ne se répète jamais, dessinant une structure d'une beauté formelle absolue.`,
  (rng) => `Des milliers de particules s'organisent spontanément sous l'effet de forces invisibles. L'ordre émerge du chaos, révélant les lois profondes qui gouvernent la matière.`,
  (rng) => `Un automate cellulaire évolue selon des règles d'une simplicité trompeuse. De l'interaction locale naît une complexité globale impossible à prédire.`,
  (rng) => `Des ondes se propagent, s'interfèrent et créent des figures de standing wave d'une précision mathématique. Chaque fréquence révèle une géométrie cachée de la vibration.`,
  (rng) => `La géométrie procédurale explore les relations profondes entre nombre, forme et espace. Chaque courbe obéit à une loi mathématique universelle.`,
  (rng) => `Des équations de réaction-diffusion génèrent des patterns organiques d'une complexité troublante. La chimie devient art, la physique devient esthétique.`,
  (rng) => `La croissance procédurale imite les processus du vivant : agrégation, diffusion, ramification. La nature est le premier algorithme.`,
  (rng) => `Les forces cosmiques se jouent à l'échelle de l'univers. Gravité, lumière et espace-temps tissent une tapisserie d'une beauté transcendante.`,
  (rng) => `Un réseau neuronal s'illumine, ses connexions révélant la structure de la pensée. L'intelligence artificielle comme art de l'abstraction.`
];

/* ── Main generator function ── */
function generateArtwork(seed) {
  if (seed < 1 || seed > 50000) throw new Error('Seed must be between 1 and 50000');

  const rng = createRNG(seed);

  // Determine family (0-9) and variant (0-4999)
  const familyId = Math.min(9, Math.floor((seed - 1) / 5000));
  const variant  = (seed - 1) % 5000;
  const family   = FAMILIES[familyId];

  // Pick algorithm deterministically from variant
  const algoIndex = variant % family.algorithms.length;
  const algorithm = family.algorithms[algoIndex];

  // Generate all metadata
  const palette      = generatePalette(rng, familyId);
  const audioProfile = generateAudioProfile(rng, familyId);
  const title        = generateTitle(rng, familyId);
  const description  = DESCRIPTIONS[familyId](rng);
  const equations    = EQUATIONS[familyId] || ['y = f(x)'];
  const equation     = rng.pick(equations);
  const baseTags     = TAGS_BY_FAMILY[familyId] || [];
  const tags         = rng.shuffle([...baseTags]).slice(0, rng.int(2, 4));

  // Algorithm-specific parameters (used by renderer)
  const params = generateAlgorithmParams(familyId, variant, rng);

  return {
    seed,
    familyId,
    family: family.name,
    familyIcon: family.icon,
    algorithm,
    variant,
    params,
    palette,
    audioProfile,
    title,
    description,
    equation,
    tags,
    color: family.color
  };
}

/* ── Algorithm parameter generation ── */
function generateAlgorithmParams(familyId, variant, rng) {
  switch (familyId) {
    case 0: return { // Fractales
      cx: rng.range(-2, 2),
      cy: rng.range(-2, 2),
      zoom: Math.pow(2, rng.range(0, 8)),
      maxIter: rng.int(50, 500),
      colorMode: rng.int(0, 4),
      power: rng.int(2, 6),
      escapeRadius: rng.range(2, 10)
    };
    case 1: return { // Attracteurs
      sigma: rng.range(5, 20),
      rho: rng.range(20, 50),
      beta: rng.range(1, 4),
      a: rng.range(-1, 1),
      b: rng.range(-0.5, 0.5),
      c: rng.range(1, 5),
      dt: rng.range(0.001, 0.01),
      steps: rng.int(50000, 200000),
      projection: rng.int(0, 2)
    };
    case 2: return { // Particules
      count: rng.int(200, 2000),
      charge: rng.range(-2, 2),
      mass: rng.range(0.1, 3),
      drag: rng.range(0.95, 0.999),
      forceScale: rng.range(0.1, 2),
      trailLength: rng.int(5, 50)
    };
    case 3: return { // Automates
      rule: rng.int(0, 255),
      density: rng.range(0.1, 0.6),
      cellSize: rng.pick([4, 6, 8]),
      wrap: rng.bool(),
      generations: rng.int(50, 200)
    };
    case 4: return { // Ondes
      modes: rng.int(1, 8),
      frequency: rng.range(0.5, 8),
      amplitude: rng.range(0.3, 1),
      harmonics: rng.int(2, 16),
      speed: rng.range(0.5, 3),
      phase: rng.range(0, Math.PI * 2)
    };
    case 5: return { // Géométrie
      R: rng.range(50, 150),
      r: rng.range(10, 80),
      d: rng.range(10, 100),
      n: rng.int(3, 12),
      k: rng.int(2, 9),
      iterations: rng.int(3, 8),
      angle: rng.range(15, 90),
      scale: rng.range(0.5, 0.85),
      symbol: rng.pick(['F', 'X', 'Y'])
    };
    case 6: return { // Fluides
      f: rng.range(0.01, 0.09),
      k: rng.range(0.04, 0.07),
      Du: rng.range(0.1, 0.25),
      Dv: rng.range(0.04, 0.1),
      viscosity: rng.range(0.0001, 0.002),
      resolution: rng.pick([64, 96, 128]),
      steps: rng.int(100, 500)
    };
    case 7: return { // Organique
      particles: rng.int(500, 5000),
      stickiness: rng.range(0.1, 1),
      killRadius: rng.range(1, 5),
      spawnRadius: rng.range(100, 300),
      growthRate: rng.range(0.001, 0.01),
      branches: rng.int(2, 8)
    };
    case 8: return { // Cosmique
      arms: rng.int(2, 6),
      bulgeSize: rng.range(0.05, 0.25),
      armTightness: rng.range(0.3, 1.5),
      stars: rng.int(2000, 10000),
      dustLanes: rng.bool(),
      rotation: rng.range(-1, 1),
      haloSize: rng.range(0.5, 1.5)
    };
    case 9: return { // Neural
      layers: rng.int(2, 6),
      neuronsPerLayer: rng.int(4, 16),
      connectivity: rng.range(0.3, 1),
      activationSpeed: rng.range(0.5, 3),
      learningVis: rng.bool(),
      pulseRate: rng.range(0.5, 3)
    };
    default: return {};
  }
}

/* ── Batch generation for gallery ── */
function generateArtworkBatch(seeds) {
  return seeds.map(s => generateArtwork(s));
}

/* ── Get seeds for a given filter ── */
function getSeedsForFilter({ familyId = null, sortMode = 'seed', count = 50000 } = {}) {
  let seeds;

  if (familyId !== null) {
    const family = FAMILIES[familyId];
    const [start, end] = family.seeds;
    seeds = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  } else {
    seeds = Array.from({ length: 50000 }, (_, i) => i + 1);
  }

  if (sortMode === 'random') {
    // Deterministic shuffle using a fixed seed
    const rng = createRNG(0xCAFEBABE);
    rng.shuffle(seeds);
  } else if (sortMode === 'family') {
    // Already ordered by family if no filter
  }

  return seeds.slice(0, count);
}

/* ── Export ── */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateArtwork, generateArtworkBatch, getSeedsForFilter, FAMILIES, TITLE_VOCAB };
} else {
  window.generateArtwork      = generateArtwork;
  window.generateArtworkBatch = generateArtworkBatch;
  window.getSeedsForFilter    = getSeedsForFilter;
  window.FAMILIES             = FAMILIES;
}
