/* ══════════════════════════════════════════════════════════════
   CHALMA ART — Artwork Detail Page Logic
   ══════════════════════════════════════════════════════════════ */
'use strict';

/* ── Custom cursor ── */
(function() {
  const ring = document.getElementById('cursor-ring');
  const dot  = document.getElementById('cursor-dot');
  if (!ring || !dot) return;
  let mx=-200,my=-200,rx=-200,ry=-200;
  document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });
  function lerp(a,b,t){return a+(b-a)*t;}
  (function tick(){
    rx=lerp(rx,mx,0.12); ry=lerp(ry,my,0.12);
    ring.style.left=rx+'px'; ring.style.top=ry+'px';
    dot.style.left=mx+'px';  dot.style.top=my+'px';
    requestAnimationFrame(tick);
  })();
  document.querySelectorAll('a,button,.neighbor-card').forEach(el=>{
    el.addEventListener('mouseenter',()=>document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave',()=>document.body.classList.remove('cursor-hover'));
  });
})();

/* ── Main artwork page ── */
(function() {
  const params  = new URLSearchParams(window.location.search);
  let seed = parseInt(params.get('seed')) || 1;
  if (seed < 1 || seed > 50000) seed = 1;

  const canvas    = document.getElementById('artwork-canvas');
  const ctx       = canvas.getContext('2d');
  let detailRenderer = null;
  let artwork = null;
  let isPlaying = false;
  let audioStop = null;
  let analyser = null;

  /* ── Resize canvas to fill container ── */
  function resizeCanvas() {
    const wrap = document.getElementById('canvas-wrap');
    if (!wrap) return;
    const W = wrap.clientWidth;
    const H = wrap.clientHeight;
    canvas.width  = W;
    canvas.height = H;
  }

  /* ── Load artwork by seed ── */
  function loadArtwork(s) {
    seed = Math.max(1, Math.min(50000, s));
    window.history.replaceState(null, '', `?seed=${seed}`);

    // Stop previous
    if (detailRenderer) detailRenderer.stop();
    if (audioStop) { audioStop(); audioStop = null; isPlaying = false; }
    document.getElementById('audioPlayBtn').classList.remove('playing');

    artwork = generateArtwork(seed);

    // Update page meta
    document.getElementById('pageTitle').textContent = `${artwork.title} — CHALMA ART`;
    document.getElementById('pageDesc').content      = artwork.description;

    // Nav
    document.getElementById('navSeed').textContent   = `SEED #${String(seed).padStart(5,'0')}`;
    document.getElementById('navFamily').textContent = `${artwork.familyIcon} ${artwork.family}`;

    // Panel
    document.getElementById('panelSeed').textContent       = `SEED #${String(seed).padStart(5,'0')}`;
    document.getElementById('panelTitle').textContent      = artwork.title;
    document.getElementById('panelIcon').textContent       = artwork.familyIcon;
    document.getElementById('panelFamilyName').textContent = artwork.family;
    document.getElementById('panelDesc').textContent       = artwork.description;
    document.getElementById('panelEquation').textContent   = artwork.equation;

    // Tags
    const tagsEl = document.getElementById('panelTags');
    tagsEl.innerHTML = artwork.tags.map(t => `<span class="panel-tag">${t}</span>`).join('');

    // Render
    resizeCanvas();
    detailRenderer = Renderer.createDetailRenderer(canvas, artwork);
    detailRenderer.start();

    // Param sliders
    buildParamSliders(artwork);

    // Neighbors
    buildNeighbors(seed);
  }

  /* ── Param sliders ── */
  function buildParamSliders(aw) {
    const container = document.getElementById('paramSliders');
    if (!container) return;

    const paramDefs = {
      0: [
        { key: 'zoom',    label: 'Zoom',        min: 0.1,  max: 10,  step: 0.1  },
        { key: 'maxIter', label: 'Itérations',  min: 20,   max: 500, step: 10   }
      ],
      1: [
        { key: 'sigma',   label: 'σ (Lorenz)',  min: 1,    max: 30,  step: 0.5  },
        { key: 'rho',     label: 'ρ (Lorenz)',  min: 10,   max: 60,  step: 1    }
      ],
      2: [
        { key: 'count',   label: 'Particules',  min: 100,  max: 2000, step: 50  },
        { key: 'forceScale', label: 'Force',    min: 0.1,  max: 5,   step: 0.1  }
      ],
      3: [
        { key: 'rule',    label: 'Règle',       min: 0,    max: 255, step: 1    },
        { key: 'density', label: 'Densité',     min: 0.05, max: 0.8, step: 0.05 }
      ],
      4: [
        { key: 'modes',   label: 'Modes',       min: 1,    max: 8,   step: 1    },
        { key: 'frequency', label: 'Fréquence', min: 0.5,  max: 8,   step: 0.5  }
      ],
      5: [
        { key: 'R',       label: 'R',           min: 30,   max: 180, step: 5    },
        { key: 'r',       label: 'r',           min: 5,    max: 90,  step: 5    },
        { key: 'd',       label: 'd',           min: 5,    max: 120, step: 5    }
      ],
      6: [
        { key: 'f',       label: 'f (feed)',    min: 0.01, max: 0.09, step: 0.002 },
        { key: 'k',       label: 'k (kill)',    min: 0.04, max: 0.07, step: 0.001 }
      ],
      7: [
        { key: 'particles', label: 'Particles', min: 200,  max: 5000, step: 100 },
        { key: 'growthRate',label: 'Croissance', min: 0.001,max: 0.05, step: 0.002 }
      ],
      8: [
        { key: 'arms',    label: 'Bras',        min: 1,    max: 8,   step: 1    },
        { key: 'stars',   label: 'Étoiles',     min: 1000, max: 10000,step: 500 }
      ],
      9: [
        { key: 'layers',  label: 'Couches',     min: 2,    max: 6,   step: 1    },
        { key: 'neuronsPerLayer', label: 'Neurones', min: 4, max: 16, step: 1   }
      ]
    };

    const defs = paramDefs[aw.familyId] || [];
    container.innerHTML = defs.map(def => {
      const val = aw.params[def.key] ?? def.min;
      const pct = ((val - def.min) / (def.max - def.min) * 100).toFixed(0);
      return `
        <div class="param-row">
          <div class="param-name">${def.label}</div>
          <input type="range" class="param-slider" data-key="${def.key}"
            min="${def.min}" max="${def.max}" step="${def.step}"
            value="${val}" style="--val:${pct}%">
          <div class="param-val">${Number(val).toFixed(def.step < 1 ? 3 : 0)}</div>
        </div>
      `;
    }).join('');

    // Live param update
    container.querySelectorAll('.param-slider').forEach(slider => {
      slider.addEventListener('input', () => {
        const key = slider.dataset.key;
        const val = parseFloat(slider.value);
        const pct = ((val - parseFloat(slider.min)) / (parseFloat(slider.max) - parseFloat(slider.min)) * 100).toFixed(0);
        slider.style.setProperty('--val', pct + '%');
        slider.nextElementSibling.textContent = Number(val).toFixed(parseFloat(slider.step) < 1 ? 3 : 0);

        // Update artwork params and reset algo state
        artwork.params[key] = val;
        // Reset cached state in algo
        const algoObj = Renderer._getAlgos()[artwork.familyId];
        if (algoObj) {
          const keys = Object.keys(algoObj).filter(k => k.startsWith('_'));
          for (const k of keys) delete algoObj[k];
        }
        // Restart renderer
        if (detailRenderer) detailRenderer.stop();
        detailRenderer = Renderer.createDetailRenderer(canvas, artwork);
        detailRenderer.start();
      });
    });
  }

  /* ── Neighbors ── */
  function buildNeighbors(currentSeed) {
    const grid = document.getElementById('neighborsGrid');
    if (!grid) return;

    // 3 seeds before, 3 after (wrap around)
    const neighborSeeds = [-3,-2,-1,1,2,3].map(offset => {
      let s = currentSeed + offset;
      if (s < 1) s += 50000;
      if (s > 50000) s -= 50000;
      return s;
    });

    grid.innerHTML = '';
    for (const ns of neighborSeeds) {
      const aw = generateArtwork(ns);
      const card = document.createElement('div');
      card.className = 'neighbor-card';
      card.title = `${aw.title} — Seed #${ns}`;

      // Mini canvas
      const miniCanvas = document.createElement('canvas');
      miniCanvas.width  = 80;
      miniCanvas.height = 80;
      card.appendChild(miniCanvas);

      const seedLabel = document.createElement('div');
      seedLabel.className = 'neighbor-seed';
      seedLabel.textContent = `#${ns}`;
      card.appendChild(seedLabel);

      card.addEventListener('click', () => loadArtwork(ns));
      grid.appendChild(card);

      // Render mini
      const miniRenderer = Renderer.createDetailRenderer(miniCanvas, aw);
      miniRenderer.start();
      setTimeout(() => miniRenderer.stop(), 3000); // render a few seconds then stop
    }
  }

  /* ── Audio visualizer ── */
  function startViz() {
    const vizCanvas = document.getElementById('vizCanvas');
    if (!vizCanvas) return;
    const vctx = vizCanvas.getContext('2d');
    const W = vizCanvas.width, H = vizCanvas.height;

    function drawViz() {
      if (!isPlaying) {
        vctx.clearRect(0, 0, W, H);
        // Idle bars
        for (let i = 0; i < 30; i++) {
          const x = i * (W / 30);
          const h = 2 + Math.sin(Date.now() * 0.002 + i * 0.4) * 3;
          vctx.fillStyle = `rgba(201,168,76,0.2)`;
          vctx.fillRect(x, (H - h) / 2, W/30 - 1, h);
        }
        requestAnimationFrame(drawViz);
        return;
      }

      if (analyser) {
        const bufLen = analyser.frequencyBinCount;
        const data = new Uint8Array(bufLen);
        analyser.getByteFrequencyData(data);

        vctx.clearRect(0, 0, W, H);
        const barW = W / 30;
        for (let i = 0; i < 30; i++) {
          const idx = Math.floor(i / 30 * bufLen);
          const h = Math.max(2, (data[idx] / 255) * H);
          const bright = 40 + (data[idx] / 255) * 30;
          vctx.fillStyle = `hsl(44, 80%, ${bright}%)`;
          vctx.fillRect(i * barW, H - h, barW - 1, h);
        }
      } else {
        // Animated bars without analyser
        vctx.clearRect(0, 0, W, H);
        for (let i = 0; i < 30; i++) {
          const h = 4 + Math.abs(Math.sin(Date.now() * 0.003 + i * 0.5)) * (H - 8);
          vctx.fillStyle = `hsl(44, 80%, ${40 + h/H*25}%)`;
          vctx.fillRect(i * (W/30), H - h, W/30 - 1, h);
        }
      }
      requestAnimationFrame(drawViz);
    }
    drawViz();
  }

  /* ── Event: audio play/pause ── */
  document.getElementById('audioPlayBtn')?.addEventListener('click', () => {
    if (isPlaying) {
      if (audioStop) { audioStop(); audioStop = null; }
      isPlaying = false;
      document.getElementById('audioPlayBtn').classList.remove('playing');
    } else {
      audioStop = AudioEngine.play(artwork);
      isPlaying = true;
      document.getElementById('audioPlayBtn').classList.add('playing');

      // Try to hook analyser
      try {
        analyser = AudioEngine.ctx.createAnalyser();
        analyser.fftSize = 64;
        AudioEngine._masterGain.connect(analyser);
      } catch(e) { analyser = null; }
    }
  });

  /* ── Volume slider ── */
  document.getElementById('volumeSlider')?.addEventListener('input', e => {
    AudioEngine.setVolume(parseInt(e.target.value) / 100);
  });

  /* ── Download PNG ── */
  document.getElementById('downloadBtn')?.addEventListener('click', () => {
    if (detailRenderer) {
      detailRenderer.downloadPNG(`chalma-art-${seed}.png`);
    }
  });

  /* ── Copy link ── */
  document.getElementById('copyLinkBtn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast('Lien copié !');
    });
  });

  /* ── Fullscreen ── */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
  document.getElementById('fullscreenBtn')?.addEventListener('click', toggleFullscreen);
  document.getElementById('fullscreenBtn2')?.addEventListener('click', toggleFullscreen);

  document.addEventListener('fullscreenchange', () => {
    resizeCanvas();
    if (detailRenderer) {
      detailRenderer.stop();
      detailRenderer = Renderer.createDetailRenderer(canvas, artwork);
      detailRenderer.start();
    }
  });

  /* ── Random ── */
  document.getElementById('randomBtn')?.addEventListener('click', () => {
    loadArtwork(Math.floor(Math.random() * 50000) + 1);
  });
  document.getElementById('randomNavBtn')?.addEventListener('click', () => {
    loadArtwork(Math.floor(Math.random() * 50000) + 1);
  });

  /* ── Prev / Next ── */
  document.getElementById('prevBtn')?.addEventListener('click', () => {
    loadArtwork(seed > 1 ? seed - 1 : 50000);
  });
  document.getElementById('nextBtn')?.addEventListener('click', () => {
    loadArtwork(seed < 50000 ? seed + 1 : 1);
  });

  /* ── Keyboard shortcuts ── */
  document.addEventListener('keydown', e => {
    switch(e.key) {
      case 'ArrowLeft':  loadArtwork(seed > 1 ? seed - 1 : 50000); break;
      case 'ArrowRight': loadArtwork(seed < 50000 ? seed + 1 : 1); break;
      case 'r': case 'R': loadArtwork(Math.floor(Math.random() * 50000) + 1); break;
      case ' ': e.preventDefault(); document.getElementById('audioPlayBtn')?.click(); break;
      case 'f': case 'F': toggleFullscreen(); break;
      case 's': case 'S': if(detailRenderer) detailRenderer.downloadPNG(`chalma-art-${seed}.png`); break;
    }
  });

  /* ── Toast ── */
  function showToast(msg) {
    let toast = document.querySelector('.copy-flash');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'copy-flash';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  /* ── Resize ── */
  window.addEventListener('resize', () => {
    resizeCanvas();
    if (detailRenderer) {
      detailRenderer.stop();
      detailRenderer = Renderer.createDetailRenderer(canvas, artwork);
      detailRenderer.start();
    }
  });

  /* ── Init ── */
  loadArtwork(seed);
  startViz();

})();
