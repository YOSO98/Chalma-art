/* ══════════════════════════════════════════════════════════════
   CHALMA ART — Particles Algorithm
   Family 2, seeds 10001–15000
   ══════════════════════════════════════════════════════════════ */

'use strict';

const ParticlesAlgo = {

  render(ctx, W, H, artwork, t) {
    const { algorithm, params, palette } = artwork;
    switch (algorithm) {
      case 'magnetic_dipole': this.magneticDipole(ctx, W, H, params, palette, t); break;
      case 'n_body':          this.nBody(ctx, W, H, params, palette, t); break;
      case 'boids':           this.boids(ctx, W, H, params, palette, t); break;
      case 'electrostatic':   this.electrostatic(ctx, W, H, params, palette, t); break;
      case 'quantum_superpos':this.quantum(ctx, W, H, params, palette, t); break;
      case 'brownian':        this.brownian(ctx, W, H, params, palette, t); break;
      case 'vortex':          this.vortex(ctx, W, H, params, palette, t); break;
      default:                this.magneticDipole(ctx, W, H, params, palette, t);
    }
  },

  /* ── Magnetic dipole field lines ── */
  magneticDipole(ctx, W, H, params, palette, t) {
    ctx.fillStyle = `rgba(3,3,10,0.12)`;
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2;
    const charge = params.charge || 1;
    const n = params.count || 800;
    const hue = palette.h1;

    if (!this._magParticles) {
      this._magParticles = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: 0, vy: 0
      }));
    }

    for (const p of this._magParticles) {
      const dx = p.x - cx, dy = p.y - cy;
      const r2 = dx * dx + dy * dy;
      const r = Math.sqrt(r2) || 1;
      // Magnetic dipole: B ∝ (3(m·r̂)r̂ - m) / r³
      const cosT = dy / r;
      const Bx = (3 * cosT * dx / r - 0) / (r2 * r / 10000);
      const By = (3 * cosT * dy / r - 1) / (r2 * r / 10000);
      p.vx += Bx * charge * 0.001;
      p.vy += By * charge * 0.001;
      p.vx *= 0.97; p.vy *= 0.97;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) {
        p.x = Math.random() * W; p.y = Math.random() * H;
        p.vx = 0; p.vy = 0;
      }
      const speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
      const alpha = Math.min(0.8, speed * 5);
      ctx.fillStyle = `hsla(${hue + speed * 20}, 90%, 65%, ${alpha})`;
      ctx.fillRect(p.x, p.y, 1.5, 1.5);
    }

    // Draw dipole
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue}, 100%, 80%, 0.9)`;
    ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;
  },

  /* ── N-body gravitational ── */
  nBody(ctx, W, H, params, palette, t) {
    ctx.fillStyle = 'rgba(3,3,10,0.15)';
    ctx.fillRect(0, 0, W, H);

    const n = Math.min(params.count || 6, 12);
    const hue = palette.h1;

    if (!this._nbodies) {
      this._nbodies = Array.from({ length: n }, (_, i) => {
        const angle = (i / n) * Math.PI * 2;
        const r = W * 0.25;
        return {
          x: W / 2 + Math.cos(angle) * r,
          y: H / 2 + Math.sin(angle) * r,
          vx: Math.sin(angle) * 1.5,
          vy: -Math.cos(angle) * 1.5,
          mass: 0.5 + Math.random() * 2,
          trail: []
        };
      });
    }

    const G = 500;
    for (let i = 0; i < this._nbodies.length; i++) {
      const a = this._nbodies[i];
      let fx = 0, fy = 0;
      for (let j = 0; j < this._nbodies.length; j++) {
        if (i === j) continue;
        const b = this._nbodies[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.max(20, Math.sqrt(dx*dx+dy*dy));
        const f = G * a.mass * b.mass / (dist * dist);
        fx += f * dx / dist; fy += f * dy / dist;
      }
      a.vx += fx / a.mass * 0.016;
      a.vy += fy / a.mass * 0.016;
      a.vx *= 0.999; a.vy *= 0.999;
      a.x += a.vx; a.y += a.vy;
      a.trail.push([a.x, a.y]);
      if (a.trail.length > 80) a.trail.shift();
      if (a.x < 0 || a.x > W) a.vx *= -0.5;
      if (a.y < 0 || a.y > H) a.vy *= -0.5;
    }

    for (let i = 0; i < this._nbodies.length; i++) {
      const b = this._nbodies[i];
      const trailHue = (hue + i * 30) % 360;
      ctx.beginPath();
      for (let k = 0; k < b.trail.length; k++) {
        const alpha = k / b.trail.length * 0.6;
        if (k === 0) ctx.moveTo(b.trail[k][0], b.trail[k][1]);
        else ctx.lineTo(b.trail[k][0], b.trail[k][1]);
      }
      ctx.strokeStyle = `hsla(${trailHue}, 90%, 65%, 0.5)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.mass * 4, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${trailHue}, 100%, 75%)`;
      ctx.shadowColor = `hsl(${trailHue}, 100%, 65%)`;
      ctx.shadowBlur = 15;
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  },

  /* ── Boids (flocking) ── */
  boids(ctx, W, H, params, palette, t) {
    ctx.fillStyle = 'rgba(3,3,10,0.15)';
    ctx.fillRect(0, 0, W, H);

    const n = Math.min(params.count || 120, 200);
    const hue = palette.h1;

    if (!this._boids) {
      this._boids = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3
      }));
    }

    const sep = 25, ali = 50, coh = 80;
    const maxSpeed = 3, maxForce = 0.08;

    for (const b of this._boids) {
      let sx=0,sy=0,sc=0, ax=0,ay=0,ac=0, cx2=0,cy2=0,cc=0;

      for (const n2 of this._boids) {
        if (n2 === b) continue;
        const dx=n2.x-b.x, dy=n2.y-b.y;
        const d=Math.sqrt(dx*dx+dy*dy);
        if (d < sep) { sx-=dx/d; sy-=dy/d; sc++; }
        if (d < ali) { ax+=n2.vx; ay+=n2.vy; ac++; }
        if (d < coh) { cx2+=n2.x; cy2+=n2.y; cc++; }
      }

      let fx=0,fy=0;
      if (sc>0) { fx+=sx/sc*maxForce*1.5; fy+=sy/sc*maxForce*1.5; }
      if (ac>0) { const mag=Math.sqrt(ax*ax+ay*ay)||1; fx+=(ax/ac/mag-b.vx)*maxForce; fy+=(ay/ac/mag-b.vy)*maxForce; }
      if (cc>0) { fx+=(cx2/cc-b.x)*0.0002; fy+=(cy2/cc-b.y)*0.0002; }

      b.vx+=fx; b.vy+=fy;
      const spd=Math.sqrt(b.vx*b.vx+b.vy*b.vy);
      if (spd>maxSpeed) { b.vx=b.vx/spd*maxSpeed; b.vy=b.vy/spd*maxSpeed; }
      b.x=(b.x+b.vx+W)%W; b.y=(b.y+b.vy+H)%H;

      const angle=Math.atan2(b.vy,b.vx);
      ctx.save();
      ctx.translate(b.x,b.y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(6,0); ctx.lineTo(-4,-3); ctx.lineTo(-4,3); ctx.closePath();
      ctx.fillStyle=`hsla(${hue+spd*20},90%,65%,0.8)`;
      ctx.fill();
      ctx.restore();
    }
  },

  /* ── Electrostatic field ── */
  electrostatic(ctx, W, H, params, palette, t) {
    ctx.fillStyle = 'rgba(3,3,10,0.1)';
    ctx.fillRect(0, 0, W, H);

    const charges = [
      { x: W*0.35, y: H*0.5, q: 1 },
      { x: W*0.65, y: H*0.5, q: -1 }
    ];
    const hue = palette.h1;
    const n = params.count || 600;

    if (!this._eParticles) {
      this._eParticles = Array.from({ length: n }, () => ({
        x: Math.random()*W, y: Math.random()*H, vx:0, vy:0
      }));
    }

    for (const p of this._eParticles) {
      let fx=0,fy=0;
      for (const c of charges) {
        const dx=p.x-c.x, dy=p.y-c.y;
        const r2=Math.max(100,dx*dx+dy*dy);
        const r=Math.sqrt(r2);
        fx+=c.q*dx/r2/r*5000;
        fy+=c.q*dy/r2/r*5000;
      }
      p.vx+=fx*0.01; p.vy+=fy*0.01;
      p.vx*=0.9; p.vy*=0.9;
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>W||p.y<0||p.y>H){
        p.x=Math.random()*W; p.y=Math.random()*H; p.vx=0; p.vy=0;
      }
      const spd=Math.sqrt(p.vx*p.vx+p.vy*p.vy);
      ctx.fillStyle=`hsla(${hue+spd*5},90%,65%,${Math.min(0.9,spd*0.2)})`;
      ctx.fillRect(p.x,p.y,1.5,1.5);
    }

    for(const c of charges){
      ctx.beginPath();
      ctx.arc(c.x,c.y,10,0,Math.PI*2);
      const color=c.q>0?`hsl(${hue},100%,70%)`:`hsl(${(hue+180)%360},100%,70%)`;
      ctx.fillStyle=color;
      ctx.shadowColor=color; ctx.shadowBlur=20; ctx.fill();
    }
    ctx.shadowBlur=0;
  },

  /* ── Quantum superposition visualization ── */
  quantum(ctx, W, H, params, palette, t) {
    ctx.fillStyle='rgba(3,3,10,0.2)';
    ctx.fillRect(0,0,W,H);
    const hue=palette.h1;
    const n=params.count||300;

    if(!this._qParticles){
      this._qParticles=Array.from({length:n},()=>({
        x:Math.random()*W, y:Math.random()*H,
        phase:Math.random()*Math.PI*2,
        freq:0.5+Math.random()*2,
        amp:10+Math.random()*40,
        size:1+Math.random()*3
      }));
    }

    for(const p of this._qParticles){
      const wave=Math.sin(p.phase+t*p.freq);
      const px=p.x+Math.cos(p.phase)*wave*p.amp*0.3;
      const py=p.y+Math.sin(p.phase)*wave*p.amp*0.3;
      const alpha=0.3+wave*0.4;
      const sz=p.size*(1+Math.abs(wave)*0.5);
      ctx.beginPath();
      ctx.arc(px,py,sz,0,Math.PI*2);
      ctx.fillStyle=`hsla(${hue+wave*40},90%,65%,${Math.abs(alpha)})`;
      ctx.shadowColor=`hsl(${hue},100%,70%)`;
      ctx.shadowBlur=sz*3;
      ctx.fill();
    }
    ctx.shadowBlur=0;

    // Probability wave
    ctx.beginPath();
    for(let x=0;x<W;x+=2){
      const y=H/2+Math.sin(x*0.02+t)*Math.cos(x*0.005+t*0.3)*60;
      x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.strokeStyle=`hsla(${hue},80%,60%,0.3)`;
    ctx.lineWidth=2; ctx.stroke();
  },

  /* ── Brownian motion ── */
  brownian(ctx, W, H, params, palette, t) {
    ctx.fillStyle='rgba(3,3,10,0.05)';
    ctx.fillRect(0,0,W,H);
    const hue=palette.h1;
    const n=params.count||200;

    if(!this._brownian){
      this._brownian=Array.from({length:n},()=>({
        x:W/2+(Math.random()-0.5)*W*0.3,
        y:H/2+(Math.random()-0.5)*H*0.3,
        hue:hue+Math.random()*60-30,
        size:0.5+Math.random()*2
      }));
    }

    for(const p of this._brownian){
      const step=params.forceScale||2;
      p.x+=(Math.random()-0.5)*step*2;
      p.y+=(Math.random()-0.5)*step*2;
      p.x=Math.max(0,Math.min(W,p.x));
      p.y=Math.max(0,Math.min(H,p.y));
      ctx.fillStyle=`hsla(${p.hue},80%,65%,0.5)`;
      ctx.fillRect(p.x,p.y,p.size,p.size);
    }
  },

  /* ── Vortex ── */
  vortex(ctx, W, H, params, palette, t) {
    ctx.fillStyle='rgba(3,3,10,0.12)';
    ctx.fillRect(0,0,W,H);
    const n=params.count||500;
    const hue=palette.h1;

    if(!this._vortex){
      this._vortex=Array.from({length:n},()=>({
        angle:Math.random()*Math.PI*2,
        r:Math.random()*Math.min(W,H)*0.45,
        speed:0.01+Math.random()*0.04,
        size:0.5+Math.random()*2
      }));
    }

    const cx=W/2,cy=H/2;
    for(const p of this._vortex){
      p.angle+=p.speed*(1-p.r/(Math.min(W,H)*0.45)*0.5);
      p.r-=0.05;
      if(p.r<5){p.r=Math.random()*Math.min(W,H)*0.45;p.angle=Math.random()*Math.PI*2;}
      const px=cx+Math.cos(p.angle)*p.r;
      const py=cy+Math.sin(p.angle)*p.r;
      const pct=1-p.r/(Math.min(W,H)*0.45);
      ctx.fillStyle=`hsla(${hue+pct*120},90%,${40+pct*30}%,${0.3+pct*0.5})`;
      ctx.fillRect(px,py,p.size,p.size);
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ParticlesAlgo;
} else {
  window.ParticlesAlgo = ParticlesAlgo;
}
