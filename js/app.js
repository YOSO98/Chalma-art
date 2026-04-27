/* ══════════════════════════════════════════════════════════════
   CHALMA ART — App (performance-optimized)
   Cards statiques, animation hover only, particules allégées
   ══════════════════════════════════════════════════════════════ */
'use strict';

/* ══════════════════════════════════════════════════════════════
   CUSTOM CURSOR
   ══════════════════════════════════════════════════════════════ */
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
  const addHover = el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  };
  document.querySelectorAll('a, button, .cat-btn').forEach(addHover);
  document.body.addEventListener('mouseover', e => {
    if (e.target.closest('.art-card, .algo-card')) document.body.classList.add('cursor-hover');
  });
  document.body.addEventListener('mouseout', e => {
    if (e.target.closest('.art-card, .algo-card')) document.body.classList.remove('cursor-hover');
  });
})();

/* ══════════════════════════════════════════════════════════════
   BACKGROUND PARTICLES — léger (80 pts, pas de connexions)
   ══════════════════════════════════════════════════════════════ */
(function() {
  const canvas = document.getElementById('bg-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const N = 80;
  const pts = [];
  let mx=-9999, my=-9999;

  function resize(){ W=canvas.width=innerWidth; H=canvas.height=innerHeight; }
  resize();
  addEventListener('resize', resize);
  addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });

  for (let i=0;i<N;i++) pts.push({
    x:Math.random()*innerWidth, y:Math.random()*innerHeight,
    vx:(Math.random()-.5)*.25, vy:(Math.random()-.5)*.25,
    s:Math.random()*1.2+.3, a:Math.random()*.3+.05
  });

  function draw(){
    ctx.clearRect(0,0,W,H);
    for (const p of pts){
      const dx=p.x-mx, dy=p.y-my, d=dx*dx+dy*dy;
      if (d<8100 && d>1){
        p.vx+=(dx/Math.sqrt(d))*.25;
        p.vy+=(dy/Math.sqrt(d))*.25;
      }
      p.vx*=.97; p.vy*=.97;
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0)p.x=W; if(p.x>W)p.x=0;
      if(p.y<0)p.y=H; if(p.y>H)p.y=0;
      ctx.fillStyle=`rgba(201,168,76,${p.a})`;
      ctx.fillRect(p.x,p.y,p.s,p.s);
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════════════════════════════════════════════════════════
   HERO CANVAS — Lorenz (optimisé : pas de recalcul des bounds)
   ══════════════════════════════════════════════════════════════ */
(function() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize(){ W=canvas.width=canvas.offsetWidth; H=canvas.height=canvas.offsetHeight; }
  resize();
  addEventListener('resize', resize);

  let lx=.1, ly=0, lz=0;
  const pts=[], MAX=2000;
  // Pre-warm
  for(let i=0;i<500;i++){
    const dt=.005;
    lx+=10*(ly-lx)*dt; ly+=(lx*(28-lz)-ly)*dt; lz+=(lx*ly-(8/3)*lz)*dt;
    pts.push([lx,lz]);
  }

  function draw(){
    ctx.fillStyle='rgba(3,3,10,0.06)';
    ctx.fillRect(0,0,W,H);
    for(let i=0;i<3;i++){
      const dt=.005;
      lx+=10*(ly-lx)*dt; ly+=(lx*(28-lz)-ly)*dt; lz+=(lx*ly-(8/3)*lz)*dt;
      pts.push([lx,lz]);
    }
    if(pts.length>MAX) pts.splice(0,pts.length-MAX);

    // Fixed scale (Lorenz stays within ~[-20,20] x [-5,50])
    const scale=Math.min(W,H)*0.018;
    const ox=W/2, oy=H/2-5*scale;

    for(let i=1;i<pts.length;i++){
      const p=i/pts.length;
      ctx.strokeStyle=`hsla(44,70%,55%,${p*0.45})`;
      ctx.lineWidth=.7;
      ctx.beginPath();
      ctx.moveTo(ox+pts[i-1][0]*scale, oy+pts[i-1][1]*scale);
      ctx.lineTo(ox+pts[i][0]*scale,   oy+pts[i][1]*scale);
      ctx.stroke();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════════════════════════════════════════════════════════
   HERO TITLE — lettre par lettre
   ══════════════════════════════════════════════════════════════ */
(function() {
  const el = document.getElementById('heroTitle');
  if (!el) return;
  const text = 'CHALMA ART';
  el.innerHTML = text.split('').map((ch, i) =>
    `<span class="char" style="animation-delay:${i*55}ms">${ch==' '?'&nbsp;':ch}</span>`
  ).join('');
})();

/* ══════════════════════════════════════════════════════════════
   NAV — scroll + glitch + mobile
   ══════════════════════════════════════════════════════════════ */
(function() {
  const nav = document.getElementById('main-nav');
  const logo = document.getElementById('nav-logo');
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobile-menu');

  addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY>60), {passive:true});

  if (logo) {
    logo.setAttribute('data-text', logo.textContent);
    setInterval(() => { logo.classList.add('glitch'); setTimeout(()=>logo.classList.remove('glitch'),400); }, 15000);
  }
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('open'));
    document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => mobileMenu.classList.remove('open')));
  }
})();

/* ══════════════════════════════════════════════════════════════
   ABOUT CANVAS — tourne une seule œuvre
   ══════════════════════════════════════════════════════════════ */
(function() {
  const canvas = document.getElementById('about-canvas');
  const seedEl = document.getElementById('aboutSeedNum');
  if (!canvas) return;

  let renderer = null;

  function load(seed) {
    if (renderer) renderer.stop();
    if (seedEl) seedEl.textContent = seed;
    canvas.width  = canvas.offsetWidth  || 400;
    canvas.height = canvas.offsetHeight || 400;
    renderer = Renderer.createDetailRenderer(canvas, generateArtwork(seed));
    renderer.start();
  }

  load(42);
  setInterval(() => load(Math.floor(Math.random()*50000)+1), 8000);
})();

/* ══════════════════════════════════════════════════════════════
   ALGORITHMS GRID
   ══════════════════════════════════════════════════════════════ */
(function() {
  const grid = document.getElementById('algoGrid');
  if (!grid || typeof FAMILIES==='undefined') return;
  grid.innerHTML = FAMILIES.map(f => `
    <div class="algo-card" data-cat="${f.id}">
      <div class="algo-icon">${f.icon}</div>
      <div class="algo-name">${f.name}</div>
      <div class="algo-range">Seeds ${f.seeds[0].toLocaleString()}–${f.seeds[1].toLocaleString()}</div>
      <div class="algo-desc">${f.desc}</div>
      <div class="algo-count">5 000 œuvres · ${f.algorithms.length} algorithmes</div>
    </div>
  `).join('');
  grid.querySelectorAll('.algo-card').forEach(card => {
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Filtrer la galerie par ${card.querySelector('.algo-name')?.textContent || 'famille'}`);
    card.addEventListener('click', () => {
      document.getElementById('gallery')?.scrollIntoView({behavior:'smooth'});
      setTimeout(() => Gallery.setFilter(parseInt(card.dataset.cat)), 600);
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
})();

/* ══════════════════════════════════════════════════════════════
   GALLERY — Virtual scroll, cards statiques, hover-animate
   ══════════════════════════════════════════════════════════════ */
const Gallery = (function() {
  const CARD_H   = 320; // card height + gap estimate
  const BUFFER   = 3;   // rows de buffer hors viewport

  let allSeeds      = [];
  let filteredSeeds = [];
  let cols          = 4;

  // Map seed → { el, rendererObj, obs }
  const pool = new Map();

  const viewport  = document.getElementById('gallery-viewport');
  const grid      = document.getElementById('gallery-grid');
  const spacerTop = document.getElementById('gallery-spacer-top');
  const spacerBot = document.getElementById('gallery-spacer-bottom');
  const showingEl = document.getElementById('galleryShowing');

  function getCols() {
    const w = innerWidth;
    if (w >= 1200) return 4;
    if (w >= 900)  return 3;
    return 2;
  }

  function createCard(seed) {
    const aw   = generateArtwork(seed);
    const el   = document.createElement('div');
    el.className  = 'art-card';
    el.dataset.seed = seed;
    el.tabIndex = 0;
    el.setAttribute('role', 'link');

    const rendererObj = Renderer.createCardRenderer(aw, 300);
    el.appendChild(rendererObj.canvas);

    el.insertAdjacentHTML('beforeend', `
      <div class="card-badge">${aw.familyIcon} ${aw.family}</div>
      <div class="art-card-info">
        <div class="card-seed">SEED #${String(seed).padStart(5,'0')}</div>
        <div class="card-title">${aw.title}</div>
        <div class="card-family">${aw.family}</div>
      </div>
    `);

    // Hover → animate, leave → stop
    el.addEventListener('mouseenter', () => rendererObj.start());
    el.addEventListener('mouseleave', () => rendererObj.stop());

    // IntersectionObserver : slide-in
    const obs = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); }
    }, { threshold: 0.05 });
    obs.observe(el);

    el.addEventListener('click', () => { window.location.href = `artwork.html?seed=${seed}`; });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });

    pool.set(seed, { el, rendererObj, obs });
    return el;
  }

  function update() {
    cols = getCols();
    const totalRows = Math.ceil(filteredSeeds.length / cols);
    const viewTop   = scrollY - (viewport?.offsetTop || 0);
    const viewH     = innerHeight;

    const firstRow = Math.max(0, Math.floor(viewTop / CARD_H) - BUFFER);
    const lastRow  = Math.min(totalRows - 1, Math.ceil((viewTop + viewH) / CARD_H) + BUFFER);

    const firstIdx = firstRow * cols;
    const lastIdx  = Math.min(filteredSeeds.length - 1, (lastRow + 1) * cols - 1);

    if (spacerTop) spacerTop.style.height = (firstRow * CARD_H) + 'px';
    if (spacerBot) spacerBot.style.height = ((totalRows - lastRow - 1) * CARD_H) + 'px';

    // Supprimer les cards hors fenêtre
    for (const [seed, { el, rendererObj, obs }] of pool) {
      const idx = filteredSeeds.indexOf(seed);
      if (idx < firstIdx || idx > lastIdx) {
        rendererObj.stop();
        obs.disconnect();
        el.remove();
        pool.delete(seed);
      }
    }

    // Ajouter les cards manquantes
    const existing = new Set(pool.keys());
    const frag = document.createDocumentFragment();
    for (let i = firstIdx; i <= lastIdx; i++) {
      const seed = filteredSeeds[i];
      if (seed !== undefined && !existing.has(seed)) frag.appendChild(createCard(seed));
    }
    grid.appendChild(frag);
  }

  function init() {
    allSeeds      = getSeedsForFilter({ sortMode: 'seed' });
    filteredSeeds = [...allSeeds];
    if (showingEl) showingEl.textContent = `Affichage de ${filteredSeeds.length.toLocaleString()} œuvres`;
    update();
    addEventListener('scroll',  () => requestAnimationFrame(update), { passive: true });
    addEventListener('resize',  () => requestAnimationFrame(update));
  }

  function reset() {
    for (const [, { rendererObj, obs, el }] of pool) { rendererObj.stop(); obs.disconnect(); el.remove(); }
    pool.clear();
    if (showingEl) showingEl.textContent = `Affichage de ${filteredSeeds.length.toLocaleString()} œuvres`;
    update();
  }

  function setFilter(familyId) {
    document.querySelectorAll('.cat-btn').forEach(b =>
      b.classList.toggle('active', familyId===null ? b.dataset.cat==='all' : parseInt(b.dataset.cat)===familyId)
    );
    filteredSeeds = familyId === null ? [...allSeeds]
      : allSeeds.filter(s => Math.min(9,Math.floor((s-1)/5000)) === familyId);
    grid.innerHTML = '';
    reset();
  }

  function search(q) {
    q = q.toLowerCase().trim();
    const n = parseInt(q);
    const rangeMatch = q.match(/^(\d{1,5})\s*-\s*(\d{1,5})$/);
    if (!q) { filteredSeeds = [...allSeeds]; }
    else if (rangeMatch) {
      const min = Math.max(1, Math.min(parseInt(rangeMatch[1], 10), parseInt(rangeMatch[2], 10)));
      const max = Math.min(50000, Math.max(parseInt(rangeMatch[1], 10), parseInt(rangeMatch[2], 10)));
      filteredSeeds = allSeeds.filter(s => s >= min && s <= max);
    }
    else if (!isNaN(n) && n>=1 && n<=50000) { filteredSeeds = [n]; }
    else {
      filteredSeeds = allSeeds.filter(s => {
        const aw = generateArtwork(s);
        return aw.title.toLowerCase().includes(q) || aw.family.toLowerCase().includes(q);
      }).slice(0, 500);
    }
    grid.innerHTML = '';
    reset();
  }

  return { init, setFilter, search };
})();

/* ══════════════════════════════════════════════════════════════
   FILTERS
   ══════════════════════════════════════════════════════════════ */
document.querySelectorAll('.cat-btn').forEach(btn =>
  btn.addEventListener('click', () => Gallery.setFilter(btn.dataset.cat==='all' ? null : parseInt(btn.dataset.cat)))
);

const searchInput = document.getElementById('searchInput');
if (searchInput) {
  let debounce;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => Gallery.search(searchInput.value), 300);
  });
}

document.getElementById('randomBtn')?.addEventListener('click', () => {
  window.location.href = `artwork.html?seed=${Math.floor(Math.random()*50000)+1}`;
});

addEventListener('keydown', e => {
  const activeTag = document.activeElement?.tagName;
  const isTyping = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || document.activeElement?.isContentEditable;
  if (isTyping) return;

  if (e.key === '/') {
    e.preventDefault();
    searchInput?.focus();
  } else if (e.key.toLowerCase() === 'r') {
    window.location.href = `artwork.html?seed=${Math.floor(Math.random()*50000)+1}`;
  } else if (e.key === 'Escape' && searchInput) {
    searchInput.value = '';
    Gallery.search('');
    searchInput.blur();
  }
});

/* ══════════════════════════════════════════════════════════════
   SCROLL ANIMATIONS (sections)
   ══════════════════════════════════════════════════════════════ */
new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      let i=0;
      for (const c of e.target.children) {
        c.style.transitionDelay=(i*70)+'ms';
        c.classList.add('visible');
        i++;
      }
    }
  });
}, { threshold: 0.08 }).observe(document.getElementById('algoGrid') || document.body);

/* ══════════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => Gallery.init());
