/* ══════════════════════════════════════════════════════════════
   CHALMA ART — App Orchestrator
   Virtual scroll, cursor, particles, UI interactions
   ══════════════════════════════════════════════════════════════ */
'use strict';

/* ══════════════════════════════════════════════════════════════
   CUSTOM CURSOR
   ══════════════════════════════════════════════════════════════ */
(function initCursor() {
  const ring = document.getElementById('cursor-ring');
  const dot  = document.getElementById('cursor-dot');
  if (!ring || !dot) return;

  let mx = -200, my = -200, rx = -200, ry = -200;
  let raf;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function updateCursor() {
    rx = lerp(rx, mx, 0.12);
    ry = lerp(ry, my, 0.12);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
    raf = requestAnimationFrame(updateCursor);
  }
  updateCursor();

  document.querySelectorAll('a, button, .art-card, .cat-btn, .algo-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();

/* ══════════════════════════════════════════════════════════════
   BACKGROUND PARTICLES
   ══════════════════════════════════════════════════════════════ */
(function initParticles() {
  const canvas = document.getElementById('bg-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const N = 150;
  const particles = [];
  const mouse = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function Particle() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.size  = Math.random() * 1.5 + 0.3;
    this.alpha = Math.random() * 0.4 + 0.05;
    this.hue   = 40 + Math.random() * 25; // gold range
  }

  Particle.prototype.update = function() {
    const dx = this.x - mouse.x, dy = this.y - mouse.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 120) {
      const force = (120 - dist) / 120 * 0.6;
      this.vx += (dx / dist) * force;
      this.vy += (dy / dist) * force;
    }
    this.vx *= 0.97; this.vy *= 0.97;
    this.x += this.vx;  this.y += this.vy;
    if (this.x < 0) this.x = W;
    if (this.x > W) this.x = 0;
    if (this.y < 0) this.y = H;
    if (this.y > H) this.y = 0;
  };

  for (let i = 0; i < N; i++) particles.push(new Particle());
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < N; i++) {
      particles[i].update();
      const p = particles[i];
      // Connections
      for (let j = i + 1; j < N; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 100) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(201,168,76,${(1 - d/100) * 0.06})`;
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${p.alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════════════════════════════════════════════════════════
   HERO CANVAS — Lorenz attractor
   ══════════════════════════════════════════════════════════════ */
(function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  let x = 0.1, y = 0, z = 0;
  const pts = [];
  const maxPts = 3000;

  function draw() {
    ctx.fillStyle = 'rgba(3,3,10,0.04)';
    ctx.fillRect(0, 0, W, H);

    // Lorenz step
    for (let i = 0; i < 5; i++) {
      const dt = 0.005;
      const dx = 10 * (y - x);
      const dy = x * (28 - z) - y;
      const dz = x * y - (8/3) * z;
      x += dx * dt; y += dy * dt; z += dz * dt;
      pts.push([x, z]);
    }
    if (pts.length > maxPts) pts.splice(0, pts.length - maxPts);

    // Find bounds
    const xs = pts.map(p => p[0]), zs = pts.map(p => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minZ = Math.min(...zs), maxZ = Math.max(...zs);
    const scaleX = W * 0.85 / (maxX - minX || 1);
    const scaleZ = H * 0.7 / (maxZ - minZ || 1);
    const scale = Math.min(scaleX, scaleZ);
    const offX = W/2 - (minX + (maxX-minX)/2) * scale;
    const offZ = H/2 - (minZ + (maxZ-minZ)/2) * scale;

    for (let i = 1; i < pts.length; i++) {
      const progress = i / pts.length;
      const px1 = pts[i-1][0] * scale + offX;
      const py1 = pts[i-1][1] * scale + offZ;
      const px2 = pts[i][0]   * scale + offX;
      const py2 = pts[i][1]   * scale + offZ;
      const hue = 40 + progress * 20;
      ctx.strokeStyle = `hsla(${hue}, 80%, 55%, ${progress * 0.5})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(px1, py1); ctx.lineTo(px2, py2);
      ctx.stroke();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════════════════════════════════════════════════════════
   HERO TITLE — letter-by-letter animation
   ══════════════════════════════════════════════════════════════ */
(function initHeroTitle() {
  const el = document.getElementById('heroTitle');
  if (!el) return;

  const lines = ['CHALMA', 'ART'];
  el.innerHTML = lines.map((line, li) =>
    `<span class="title-line">${
      line.split('').map((ch, ci) =>
        `<span class="char" style="animation-delay:${(li * line.length + ci) * 60}ms">${ch === ' ' ? '&nbsp;' : ch}</span>`
      ).join('')
    }</span>`
  ).join('<br>');
})();

/* ══════════════════════════════════════════════════════════════
   NAV — scroll behavior + glitch + mobile
   ══════════════════════════════════════════════════════════════ */
(function initNav() {
  const nav = document.getElementById('main-nav');
  const logo = document.getElementById('nav-logo');
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobile-menu');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

  // Logo glitch every 15s
  if (logo) {
    logo.setAttribute('data-text', logo.textContent);
    setInterval(() => {
      logo.classList.add('glitch');
      setTimeout(() => logo.classList.remove('glitch'), 400);
    }, 15000);
  }

  // Mobile menu
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
    document.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }
})();

/* ══════════════════════════════════════════════════════════════
   ABOUT CANVAS — preview of seed 42
   ══════════════════════════════════════════════════════════════ */
(function initAboutCanvas() {
  const canvas = document.getElementById('about-canvas');
  const seedEl = document.getElementById('aboutSeedNum');
  if (!canvas) return;

  let currentSeed = 42;
  let renderer = null;
  let artwork = null;

  function loadSeed(seed) {
    if (renderer) renderer.stop();
    currentSeed = seed;
    if (seedEl) seedEl.textContent = seed;
    canvas.width  = canvas.offsetWidth  || 400;
    canvas.height = canvas.offsetHeight || 400;
    artwork = generateArtwork(seed);
    renderer = Renderer.createDetailRenderer(canvas, artwork);
    renderer.start();
  }

  loadSeed(42);

  // Cycle through seeds
  setInterval(() => {
    const seed = Math.floor(Math.random() * 50000) + 1;
    loadSeed(seed);
  }, 8000);
})();

/* ══════════════════════════════════════════════════════════════
   ALGORITHMS GRID
   ══════════════════════════════════════════════════════════════ */
(function initAlgoGrid() {
  const grid = document.getElementById('algoGrid');
  if (!grid || typeof FAMILIES === 'undefined') return;

  grid.innerHTML = FAMILIES.map(f => `
    <div class="algo-card" data-cat="${f.id}">
      <div class="algo-icon">${f.icon}</div>
      <div class="algo-name">${f.name}</div>
      <div class="algo-range">Seeds ${f.seeds[0].toLocaleString()}–${f.seeds[1].toLocaleString()}</div>
      <div class="algo-desc">${f.desc}</div>
      <div class="algo-count">5 000 œuvres · ${f.algorithms.length} algorithmes</div>
    </div>
  `).join('');

  // Make cards clickable → filter gallery
  grid.querySelectorAll('.algo-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.dataset.cat;
      document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => Gallery.setFilter(parseInt(cat)), 600);
    });
  });
})();

/* ══════════════════════════════════════════════════════════════
   GALLERY — Virtual Scroll
   ══════════════════════════════════════════════════════════════ */
const Gallery = (function() {
  const CARD_SIZE = 300;
  const GAP = 20;
  const BUFFER = 4; // rows above/below viewport to keep rendered
  const CARDS_PER_PAGE = 50; // cards in DOM at once (virtual scroll pool)

  let allSeeds = [];
  let filteredSeeds = [];
  let cols = 4;
  let cardHeight = CARD_SIZE + GAP;
  let scrollTop = 0;
  let firstVisibleRow = 0;
  let activeRenderers = new Map(); // seed → renderer

  const viewport = document.getElementById('gallery-viewport');
  const grid     = document.getElementById('gallery-grid');
  const spacerTop    = document.getElementById('gallery-spacer-top');
  const spacerBottom = document.getElementById('gallery-spacer-bottom');
  const showingEl    = document.getElementById('galleryShowing');

  function computeCols() {
    const vw = window.innerWidth;
    if (vw >= 1200) return 4;
    if (vw >= 900)  return 3;
    return 2;
  }

  function createCard(seed) {
    const artwork = generateArtwork(seed);
    const card = document.createElement('div');
    card.className = 'art-card';
    card.dataset.seed = seed;

    // Skeleton
    const skeleton = document.createElement('div');
    skeleton.className = 'art-card-skeleton';
    card.appendChild(skeleton);

    // Info overlay
    card.innerHTML += `
      <div class="card-badge">${artwork.familyIcon} ${artwork.family}</div>
      <div class="art-card-info">
        <div class="card-seed">SEED #${String(seed).padStart(5, '0')}</div>
        <div class="card-title">${artwork.title}</div>
        <div class="card-family">${artwork.family}</div>
      </div>
    `;

    // Canvas renderer
    const rendererObj = Renderer.createCardRenderer(artwork, CARD_SIZE);
    card.insertBefore(rendererObj.canvas, card.querySelector('.card-badge'));
    skeleton.remove();

    // Start when visible
    const obs = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) {
          rendererObj.start();
          card.classList.add('visible');
        } else {
          rendererObj.stop();
        }
      }
    }, { threshold: 0.01 });
    obs.observe(card);

    // Click → artwork page
    card.addEventListener('click', () => {
      window.location.href = `artwork.html?seed=${seed}`;
    });

    activeRenderers.set(seed, { renderer: rendererObj, obs });
    return card;
  }

  function updateGrid() {
    if (!grid) return;
    cols = computeCols();
    cardHeight = CARD_SIZE + GAP;
    const totalRows = Math.ceil(filteredSeeds.length / cols);
    const totalH = totalRows * cardHeight;

    const viewportTop = window.scrollY - (viewport?.offsetTop || 0);
    const viewportH   = window.innerHeight;

    const firstRow = Math.max(0, Math.floor(viewportTop / cardHeight) - BUFFER);
    const lastRow  = Math.min(totalRows - 1, Math.ceil((viewportTop + viewportH) / cardHeight) + BUFFER);

    const firstIdx = firstRow * cols;
    const lastIdx  = Math.min(filteredSeeds.length - 1, (lastRow + 1) * cols - 1);

    // Spacers
    if (spacerTop)    spacerTop.style.height    = (firstRow * cardHeight) + 'px';
    if (spacerBottom) spacerBottom.style.height = ((totalRows - lastRow - 1) * cardHeight) + 'px';

    // Remove out-of-range cards
    const toRemove = [];
    for (const child of grid.children) {
      const s = parseInt(child.dataset.seed);
      const idx = filteredSeeds.indexOf(s);
      if (idx < firstIdx || idx > lastIdx) toRemove.push(child);
    }
    for (const el of toRemove) {
      const s = parseInt(el.dataset.seed);
      if (activeRenderers.has(s)) {
        activeRenderers.get(s).renderer.stop();
        activeRenderers.get(s).obs.disconnect();
        activeRenderers.delete(s);
      }
      el.remove();
    }

    // Collect existing seeds in DOM
    const existing = new Set([...grid.children].map(c => parseInt(c.dataset.seed)));

    // Add missing cards
    const fragment = document.createDocumentFragment();
    for (let idx = firstIdx; idx <= lastIdx; idx++) {
      const seed = filteredSeeds[idx];
      if (seed === undefined) continue;
      if (!existing.has(seed)) {
        fragment.appendChild(createCard(seed));
      }
    }
    grid.appendChild(fragment);

    // Stagger entrance animations
    let delay = 0;
    for (const child of grid.children) {
      if (!child.classList.contains('visible')) {
        child.style.transitionDelay = (delay * 80) + 'ms';
        delay++;
      }
    }
  }

  function init() {
    allSeeds = getSeedsForFilter({ sortMode: 'seed' });
    filteredSeeds = [...allSeeds];
    updateGrid();

    window.addEventListener('scroll', () => {
      requestAnimationFrame(updateGrid);
    });
    window.addEventListener('resize', () => {
      requestAnimationFrame(() => {
        cols = computeCols();
        updateGrid();
      });
    });

    if (showingEl) showingEl.textContent = `Affichage de ${filteredSeeds.length.toLocaleString()} œuvres`;
  }

  function setFilter(familyId) {
    // Update active button
    document.querySelectorAll('.cat-btn').forEach(btn => {
      btn.classList.toggle('active',
        familyId === null ? btn.dataset.cat === 'all' : parseInt(btn.dataset.cat) === familyId
      );
    });

    // Stop all renderers
    for (const [, { renderer, obs }] of activeRenderers) {
      renderer.stop(); obs.disconnect();
    }
    activeRenderers.clear();
    grid.innerHTML = '';

    filteredSeeds = familyId === null
      ? [...allSeeds]
      : allSeeds.filter(s => {
          const fid = Math.min(9, Math.floor((s - 1) / 5000));
          return fid === familyId;
        });

    if (showingEl) showingEl.textContent = `Affichage de ${filteredSeeds.length.toLocaleString()} œuvres`;
    updateGrid();
  }

  function search(query) {
    query = query.toLowerCase().trim();
    if (!query) {
      filteredSeeds = [...allSeeds];
    } else {
      const seedNum = parseInt(query);
      if (!isNaN(seedNum) && seedNum >= 1 && seedNum <= 50000) {
        filteredSeeds = [seedNum];
      } else {
        filteredSeeds = allSeeds.filter(s => {
          const artwork = generateArtwork(s);
          return artwork.title.toLowerCase().includes(query) ||
                 artwork.family.toLowerCase().includes(query);
        }).slice(0, 500);
      }
    }
    for (const [, { renderer, obs }] of activeRenderers) {
      renderer.stop(); obs.disconnect();
    }
    activeRenderers.clear();
    grid.innerHTML = '';
    if (showingEl) showingEl.textContent = `${filteredSeeds.length.toLocaleString()} résultats`;
    updateGrid();
  }

  return { init, setFilter, search };
})();

/* ══════════════════════════════════════════════════════════════
   FILTER BAR
   ══════════════════════════════════════════════════════════════ */
(function initFilters() {
  // Category buttons
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      Gallery.setFilter(cat === 'all' ? null : parseInt(cat));
    });
  });

  // Search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => Gallery.search(searchInput.value), 300);
    });
  }

  // Sort
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      // Re-generate seeds with new sort
      window.location.reload(); // simplest approach for sort change
    });
  }
})();

/* ══════════════════════════════════════════════════════════════
   RANDOM ARTWORK BUTTON
   ══════════════════════════════════════════════════════════════ */
document.getElementById('randomBtn')?.addEventListener('click', () => {
  const seed = Math.floor(Math.random() * 50000) + 1;
  window.location.href = `artwork.html?seed=${seed}`;
});

/* ══════════════════════════════════════════════════════════════
   INTERSECTION OBSERVER for section animations
   ══════════════════════════════════════════════════════════════ */
(function initScrollAnimations() {
  const obs = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        // Stagger children
        let i = 0;
        for (const child of e.target.children) {
          child.style.transitionDelay = (i * 80) + 'ms';
          child.classList.add('visible');
          i++;
        }
      }
    }
  }, { threshold: 0.1 });

  document.querySelectorAll('.algo-grid, .stats-inner').forEach(el => obs.observe(el));
  document.querySelectorAll('.algo-card, .stats-item').forEach(el => obs.observe(el));
})();

/* ══════════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  Gallery.init();
});
