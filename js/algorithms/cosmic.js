/* ══════════════════════════════════════════════════════════════
   CHALMA ART — Cosmic & Astrophysics
   Family 8, seeds 40001–45000
   ══════════════════════════════════════════════════════════════ */
'use strict';

const CosmicAlgo = {

  render(ctx, W, H, artwork, t) {
    const { algorithm, params, palette } = artwork;
    switch (algorithm) {
      case 'spiral_galaxy':    this.spiralGalaxy(ctx, W, H, params, palette, t); break;
      case 'nebula':           this.nebula(ctx, W, H, params, palette, t); break;
      case 'supernova':        this.supernova(ctx, W, H, params, palette, t); break;
      case 'black_hole':       this.blackHole(ctx, W, H, params, palette, t); break;
      case 'cosmic_web':       this.cosmicWeb(ctx, W, H, params, palette, t); break;
      case 'impact_crater':    this.impactCrater(ctx, W, H, params, palette, t); break;
      case 'aurora':           this.aurora(ctx, W, H, params, palette, t); break;
      case 'comet':            this.comet(ctx, W, H, params, palette, t); break;
      case 'planetary_system': this.planetarySystem(ctx, W, H, params, palette, t); break;
      case 'pulsar':           this.pulsar(ctx, W, H, params, palette, t); break;
      default:                 this.spiralGalaxy(ctx, W, H, params, palette, t);
    }
  },

  /* ── Spiral Galaxy ── */
  spiralGalaxy(ctx, W, H, params, palette, t) {
    const { arms = 3, stars = 5000, armTightness = 0.8 } = params;
    const hue = palette.h1;
    const cx = W/2, cy = H/2;
    const maxR = Math.min(W, H) * 0.44;

    ctx.fillStyle = 'rgba(3,3,10,0.25)';
    ctx.fillRect(0, 0, W, H);

    const rot = t * 0.05;

    // Bulge
    for (let i = 0; i < 300; i++) {
      const r = Math.pow(Math.random(), 2) * maxR * 0.12;
      const angle = Math.random() * Math.PI * 2;
      const x = cx + Math.cos(angle) * r, y = cy + Math.sin(angle) * r;
      const bright = 70 + Math.random() * 20;
      ctx.fillStyle = `hsla(${hue + 30}, 60%, ${bright}%, ${0.4 + Math.random() * 0.4})`;
      ctx.fillRect(x, y, 1, 1);
    }

    // Arms
    for (let arm = 0; arm < arms; arm++) {
      const armOffset = (arm / arms) * Math.PI * 2 + rot;
      const armStars = Math.floor(stars / arms);
      for (let i = 0; i < armStars; i++) {
        const progress = Math.pow(i / armStars, 0.7);
        const r = progress * maxR;
        const theta = armOffset + progress * armTightness * Math.PI * 4;
        const spread = (1 - progress) * maxR * 0.08 + progress * maxR * 0.15;
        const ox = (Math.random() - 0.5) * spread;
        const oy = (Math.random() - 0.5) * spread;
        const x = cx + Math.cos(theta) * r + ox;
        const y = cy + Math.sin(theta) * r + oy;

        if (x < 0 || x > W || y < 0 || y > H) continue;
        const bright = 30 + progress * 35 + Math.random() * 20;
        const alpha = 0.2 + (1 - progress) * 0.6 + Math.random() * 0.2;
        const starHue = hue + arm * 20 + (1 - progress) * 30;
        ctx.fillStyle = `hsla(${starHue}, 85%, ${bright}%, ${alpha})`;
        ctx.fillRect(x, y, Math.random() < 0.05 ? 2 : 1, Math.random() < 0.05 ? 2 : 1);
      }
    }

    // Dust lanes
    if (params.dustLanes) {
      for (let arm = 0; arm < arms; arm++) {
        const armOffset = (arm / arms) * Math.PI * 2 + rot + 0.2;
        ctx.beginPath();
        let started = false;
        for (let i = 0; i < 200; i++) {
          const progress = i / 200;
          const r = progress * maxR * 0.9;
          const theta = armOffset + progress * armTightness * Math.PI * 4;
          const x = cx + Math.cos(theta) * r;
          const y = cy + Math.sin(theta) * r;
          if (!started) { ctx.moveTo(x, y); started = true; }
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(3,3,10,0.15)`;
        ctx.lineWidth = 8;
        ctx.stroke();
      }
    }
  },

  /* ── Nebula ── */
  nebula(ctx, W, H, params, palette, t) {
    ctx.fillStyle = '#03030a';
    ctx.fillRect(0, 0, W, H);

    const hue = palette.h1;
    const cx = W/2, cy = H/2;

    // Cloud layers
    for (let layer = 0; layer < 6; layer++) {
      const layerHue = (hue + layer * 25) % 360;
      const n = 3000;
      for (let i = 0; i < n; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.pow(Math.random(), 0.5) * Math.min(W, H) * (0.2 + layer * 0.06);
        const x = cx + Math.cos(angle + t * 0.02 * (layer % 2 === 0 ? 1 : -1)) * r;
        const y = cy + Math.sin(angle + t * 0.02 * (layer % 2 === 0 ? 1 : -1)) * r;

        if (x < 0 || x > W || y < 0 || y > H) continue;
        const alpha = (0.01 + Math.random() * 0.02) * (1 - layer * 0.12);
        ctx.fillStyle = `hsla(${layerHue}, 80%, 60%, ${alpha})`;
        const s = 2 + Math.random() * 8;
        ctx.beginPath();
        ctx.arc(x, y, s, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Stars
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * W, y = Math.random() * H;
      const s = Math.random() < 0.02 ? 2 : 0.5;
      ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`;
      ctx.fillRect(x, y, s, s);
    }

    // Central bright region
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W,H)*0.15);
    grd.addColorStop(0, `hsla(${hue+60}, 90%, 90%, 0.15)`);
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
  },

  /* ── Supernova ── */
  supernova(ctx, W, H, params, palette, t) {
    ctx.fillStyle = 'rgba(3,3,10,0.25)';
    ctx.fillRect(0, 0, W, H);

    const hue = palette.h1;
    const cx = W/2, cy = H/2;
    const phase = (t * 0.3) % (Math.PI * 2);
    const expansionR = Math.min(W, H) * 0.5 * (0.1 + Math.sin(phase * 0.5) * 0.4);

    // Shock wave rings
    for (let ring = 0; ring < 5; ring++) {
      const r = expansionR * (1 - ring * 0.12) * (1 + Math.sin(t * 0.5 + ring) * 0.05);
      const alpha = 0.5 - ring * 0.08;
      const ringHue = (hue + ring * 20) % 360;

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${ringHue}, 95%, 70%, ${alpha})`;
      ctx.lineWidth = 3 - ring * 0.4;
      ctx.shadowColor = `hsl(${ringHue}, 100%, 70%)`;
      ctx.shadowBlur = 20;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Ejecta filaments
    const filaments = 24;
    for (let i = 0; i < filaments; i++) {
      const angle = (i / filaments) * Math.PI * 2 + t * 0.1;
      const len = expansionR * (0.7 + Math.sin(i * 2.3) * 0.3);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
      ctx.strokeStyle = `hsla(${hue + i*5}, 90%, 65%, 0.15)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Central remnant
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, expansionR * 0.2);
    grd.addColorStop(0, `hsla(${hue+60}, 100%, 100%, 0.9)`);
    grd.addColorStop(0.2, `hsla(${hue}, 95%, 70%, 0.5)`);
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cx, cy, expansionR * 0.2, 0, Math.PI * 2);
    ctx.fill();
  },

  /* ── Black hole with accretion disk ── */
  blackHole(ctx, W, H, params, palette, t) {
    ctx.fillStyle = '#03030a';
    ctx.fillRect(0, 0, W, H);

    const hue = palette.h1;
    const cx = W/2, cy = H/2;
    const Rs = Math.min(W, H) * 0.08; // Schwarzschild radius

    // Accretion disk (ellipse, perspective)
    for (let pass = 0; pass < 3; pass++) {
      const dHue = (hue + pass * 30) % 360;
      for (let i = 0; i < 8000; i++) {
        const r = Rs * (1.5 + Math.pow(Math.random(), 0.5) * 6);
        const angle = Math.random() * Math.PI * 2 + t * (0.5 / r * Rs * 3);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r * 0.35;
        const bright = 20 + (1 - (r - Rs * 1.5) / (Rs * 6)) * 50;
        const alpha = 0.03 + (1 - (r - Rs * 1.5) / (Rs * 6)) * 0.15;
        ctx.fillStyle = `hsla(${dHue + bright*0.2}, 95%, ${bright}%, ${alpha})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Gravitational lensing ring
    ctx.beginPath();
    ctx.arc(cx, cy, Rs * 2.6, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${hue+40}, 90%, 70%, 0.4)`;
    ctx.lineWidth = 2;
    ctx.shadowColor = `hsl(${hue+40}, 100%, 70%)`;
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Event horizon
    const ehGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, Rs * 2);
    ehGrd.addColorStop(0, 'rgba(0,0,0,1)');
    ehGrd.addColorStop(0.7, 'rgba(0,0,0,0.95)');
    ehGrd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ehGrd;
    ctx.beginPath();
    ctx.arc(cx, cy, Rs * 2, 0, Math.PI * 2);
    ctx.fill();

    // Relativistic jet
    for (let sign = -1; sign <= 1; sign += 2) {
      const jLen = Math.min(W, H) * 0.4;
      const grd = ctx.createLinearGradient(cx, cy, cx, cy + sign * jLen);
      grd.addColorStop(0, `hsla(${hue}, 100%, 90%, 0.8)`);
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.moveTo(cx - 2, cy);
      ctx.lineTo(cx + 2, cy);
      ctx.lineTo(cx + sign * 8 * sign, cy + sign * jLen);
      ctx.lineTo(cx - sign * 8 * sign, cy + sign * jLen);
      ctx.fill();
    }
  },

  /* ── Cosmic Web ── */
  cosmicWeb(ctx, W, H, params, palette, t) {
    ctx.fillStyle = '#03030a';
    ctx.fillRect(0, 0, W, H);

    const hue = palette.h1;
    const nodes = [];
    const rng = mulberry32(palette.h1 * 1000 + palette.h2);

    for (let i = 0; i < 80; i++) {
      nodes.push({ x: rng() * W, y: rng() * H, mass: rng() * 3 + 0.5 });
    }

    // Filaments
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < W * 0.25) {
          const alpha = (1 - d / (W * 0.25)) * 0.3;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Nodes (galaxy clusters)
    for (const node of nodes) {
      const r = 2 + node.mass * 3;
      const grd = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 4);
      grd.addColorStop(0, `hsla(${hue+30}, 90%, 85%, 0.8)`);
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(node.x, node.y, r * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Background stars
    for (let i = 0; i < 300; i++) {
      ctx.fillStyle = `rgba(255,255,255,${rng() * 0.4})`;
      ctx.fillRect(rng() * W, rng() * H, 1, 1);
    }
  },

  /* ── Impact crater ── */
  impactCrater(ctx, W, H, params, palette, t) {
    ctx.fillStyle = '#03030a';
    ctx.fillRect(0, 0, W, H);

    const hue = palette.h1;
    const cx = W/2, cy = H/2;
    const maxR = Math.min(W, H) * 0.4;

    // Terrain base
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 1.5);
    grd.addColorStop(0, `hsl(${hue},20%,10%)`);
    grd.addColorStop(1, `hsl(${hue},15%,6%)`);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    // Crater rings
    for (let ring = 0; ring < 6; ring++) {
      const r = maxR * (0.2 + ring * 0.14);
      const alpha = 0.6 - ring * 0.08;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${hue + ring * 10}, 60%, ${25 + ring * 5}%, ${alpha})`;
      ctx.lineWidth = 2 - ring * 0.2;
      ctx.stroke();
    }

    // Ejecta rays
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const len = maxR * (0.8 + Math.random() * 0.5);
      const start = maxR * 0.25;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle)*start, cy + Math.sin(angle)*start);
      ctx.lineTo(cx + Math.cos(angle)*len, cy + Math.sin(angle)*len);
      ctx.strokeStyle = `hsla(${hue+20}, 50%, 35%, 0.2)`;
      ctx.lineWidth = 1 + Math.random() * 3;
      ctx.stroke();
    }

    // Central melt pool
    const meltGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR*0.2);
    meltGrd.addColorStop(0, `hsla(${hue+40}, 90%, 60%, 0.6)`);
    meltGrd.addColorStop(1, 'transparent');
    ctx.fillStyle = meltGrd;
    ctx.fillRect(0, 0, W, H);

    // Impact flash
    const flashAlpha = Math.max(0, Math.sin(t * 0.3) * 0.15);
    ctx.fillStyle = `rgba(255,255,255,${flashAlpha})`;
    ctx.fillRect(0, 0, W, H);
  },

  /* ── Aurora Borealis ── */
  aurora(ctx, W, H, params, palette, t) {
    ctx.fillStyle = '#020208';
    ctx.fillRect(0, 0, W, H);

    const hue = palette.h1;

    // Aurora curtains
    for (let curtain = 0; curtain < 5; curtain++) {
      const baseY = H * 0.3 + curtain * H * 0.04;
      const hshift = curtain * 25;

      for (let x = 0; x < W; x += 2) {
        const wave = Math.sin(x * 0.015 + t * 0.5 + curtain * 1.2) * 30
                   + Math.sin(x * 0.04  + t * 0.8 + curtain * 0.7) * 15;
        const curtainHeight = 80 + Math.sin(x * 0.01 + t * 0.3 + curtain) * 50;

        const grd = ctx.createLinearGradient(x, baseY + wave, x, baseY + wave + curtainHeight);
        grd.addColorStop(0, `hsla(${hue + hshift}, 100%, 60%, 0)`);
        grd.addColorStop(0.3, `hsla(${hue + hshift}, 100%, 55%, ${0.4 - curtain*0.05})`);
        grd.addColorStop(0.7, `hsla(${(hue+40+hshift)%360}, 90%, 50%, ${0.3 - curtain*0.04})`);
        grd.addColorStop(1, `hsla(${(hue+80+hshift)%360}, 80%, 40%, 0)`);
        ctx.fillStyle = grd;
        ctx.fillRect(x, baseY + wave, 2, curtainHeight);
      }
    }

    // Stars
    for (let i = 0; i < 200; i++) {
      const sx = Math.random() * W, sy = Math.random() * H * 0.4;
      ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.6})`;
      ctx.fillRect(sx, sy, 1, 1);
    }

    // Horizon glow
    const grd = ctx.createLinearGradient(0, H*0.7, 0, H);
    grd.addColorStop(0, 'transparent');
    grd.addColorStop(1, `rgba(3,3,10,0.8)`);
    ctx.fillStyle = grd;
    ctx.fillRect(0, H*0.7, W, H*0.3);
  },

  /* ── Comet ── */
  comet(ctx, W, H, params, palette, t) {
    ctx.fillStyle = 'rgba(3,3,10,0.3)';
    ctx.fillRect(0, 0, W, H);

    const hue = palette.h1;
    const speed = params.rotation || 0.5;

    // Background stars
    if (!this._cometStars) {
      this._cometStars = Array.from({ length: 200 }, () => ({
        x: Math.random()*W, y: Math.random()*H,
        alpha: Math.random()*0.5+0.1
      }));
    }
    for (const s of this._cometStars) {
      ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
      ctx.fillRect(s.x, s.y, 1, 1);
    }

    // Comet trajectory
    const phase = t * speed * 0.3;
    const angle = Math.sin(phase * 0.3) * 0.8 + Math.PI * 0.25;
    const cx = W/2 + Math.cos(phase) * W * 0.3;
    const cy = H/2 + Math.sin(phase * 0.7) * H * 0.3;

    // Tail (multiple layers)
    for (let tail = 0; tail < 3; tail++) {
      const tailLen = (150 + tail * 50) * (1 + Math.sin(t) * 0.1);
      const spread = 8 + tail * 4;
      const grd = ctx.createLinearGradient(
        cx, cy,
        cx - Math.cos(angle) * tailLen,
        cy - Math.sin(angle) * tailLen
      );
      grd.addColorStop(0, `hsla(${hue + tail*20}, 90%, 80%, ${0.6 - tail*0.15})`);
      grd.addColorStop(1, 'transparent');

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -spread);
      ctx.quadraticCurveTo(-tailLen * 0.7, 0, -tailLen, 0);
      ctx.quadraticCurveTo(-tailLen * 0.7, 0, 0, spread);
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.restore();
    }

    // Nucleus
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${hue+60}, 100%, 90%)`;
    ctx.shadowColor = `hsl(${hue+60}, 100%, 80%)`;
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;
  },

  /* ── Planetary system ── */
  planetarySystem(ctx, W, H, params, palette, t) {
    ctx.fillStyle = 'rgba(3,3,10,0.3)';
    ctx.fillRect(0, 0, W, H);

    const hue = palette.h1;
    const cx = W/2, cy = H/2;
    const planets = [
      { r: 50, size: 3, speed: 2.0, color: hue, rings: false },
      { r: 90, size: 5, speed: 1.2, color: (hue+30)%360, rings: false },
      { r: 140, size: 8, speed: 0.7, color: (hue+60)%360, rings: true },
      { r: 195, size: 6, speed: 0.4, color: (hue+100)%360, rings: false },
      { r: 250, size: 4, speed: 0.2, color: (hue+140)%360, rings: false }
    ];

    // Background stars
    if (!this._pStars) {
      this._pStars = Array.from({length:150},()=>({x:Math.random()*W,y:Math.random()*H,a:Math.random()*0.4+0.1}));
    }
    for(const s of this._pStars){
      ctx.fillStyle=`rgba(255,255,255,${s.a})`;ctx.fillRect(s.x,s.y,1,1);
    }

    // Sun
    const sunGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20);
    sunGrd.addColorStop(0, 'rgba(255,255,200,1)');
    sunGrd.addColorStop(0.5, `hsl(${hue+40}, 100%, 70%)`);
    sunGrd.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrd;
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = `hsl(${hue+40}, 100%, 70%)`;
    ctx.shadowBlur = 30;
    ctx.fill();
    ctx.shadowBlur = 0;

    for (const p of planets) {
      if (p.r > Math.min(W, H) * 0.5) continue;

      // Orbit
      ctx.beginPath();
      ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,0.05)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      const angle = t * p.speed * 0.3;
      const px = cx + Math.cos(angle) * p.r;
      const py = cy + Math.sin(angle) * p.r * 0.7;

      // Rings
      if (p.rings) {
        ctx.save();
        ctx.translate(px, py);
        ctx.scale(1, 0.3);
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 2.5, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${p.color}, 70%, 70%, 0.4)`;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }

      // Planet
      const pGrd = ctx.createRadialGradient(px-p.size*0.3, py-p.size*0.3, 0, px, py, p.size);
      pGrd.addColorStop(0, `hsl(${p.color}, 80%, 80%)`);
      pGrd.addColorStop(1, `hsl(${p.color}, 70%, 35%)`);
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fillStyle = pGrd;
      ctx.fill();
    }
  },

  /* ── Pulsar ── */
  pulsar(ctx, W, H, params, palette, t) {
    ctx.fillStyle = 'rgba(3,3,10,0.3)';
    ctx.fillRect(0, 0, W, H);

    const hue = palette.h1;
    const cx = W/2, cy = H/2;
    const period = params.pulseRate || 1.5;
    const phase = (t * period) % (Math.PI * 2);
    const beamAlpha = Math.max(0, Math.sin(phase)) * 0.8;

    // Rotation
    const rot = t * 2;

    // Beams
    for (let beam = 0; beam < 2; beam++) {
      const beamAngle = rot + beam * Math.PI;
      const beamLen = Math.min(W, H) * 0.5;

      for (let w = 0; w < 5; w++) {
        const spread = w * 0.03;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(beamAngle + spread);
        const grd = ctx.createLinearGradient(0, 0, beamLen, 0);
        grd.addColorStop(0, `hsla(${hue}, 100%, 90%, ${beamAlpha})`);
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.fillRect(0, -2, beamLen, 4);
        ctx.restore();
      }
    }

    // Magnetosphere
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2;
      const r = 30 + Math.sin(angle * 3 + t) * 10;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle)*r, cy + Math.sin(angle)*r*0.5, 1, 0, Math.PI*2);
      ctx.fillStyle = `hsla(${hue}, 90%, 70%, 0.5)`;
      ctx.fill();
    }

    // Neutron star core
    const nsGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12);
    nsGrd.addColorStop(0, `hsl(${hue+60}, 100%, 100%)`);
    nsGrd.addColorStop(0.5, `hsl(${hue}, 100%, 70%)`);
    nsGrd.addColorStop(1, 'transparent');
    ctx.fillStyle = nsGrd;
    ctx.shadowColor = `hsl(${hue}, 100%, 80%)`;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
};

if(typeof module!=='undefined'&&module.exports){module.exports=CosmicAlgo;}
else{window.CosmicAlgo=CosmicAlgo;}
