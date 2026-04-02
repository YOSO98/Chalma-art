/* ══════════════════════════════════════════════════════════════
   CHALMA ART — Attractors Algorithm
   Family 1, seeds 5001–10000
   ══════════════════════════════════════════════════════════════ */

'use strict';

const AttractorsAlgo = {

  render(ctx, W, H, artwork, t) {
    const { algorithm, params, palette } = artwork;
    switch (algorithm) {
      case 'lorenz':        this.lorenz(ctx, W, H, params, palette, t); break;
      case 'rossler':       this.rossler(ctx, W, H, params, palette, t); break;
      case 'chen':          this.chen(ctx, W, H, params, palette, t); break;
      case 'aizawa':        this.aizawa(ctx, W, H, params, palette, t); break;
      case 'halvorsen':     this.halvorsen(ctx, W, H, params, palette, t); break;
      case 'dadras':        this.dadras(ctx, W, H, params, palette, t); break;
      case 'sprott':        this.sprott(ctx, W, H, params, palette, t); break;
      case 'thomas':        this.thomas(ctx, W, H, params, palette, t); break;
      case 'dequan_li':     this.dequanLi(ctx, W, H, params, palette, t); break;
      case 'arneodo':       this.arneodo(ctx, W, H, params, palette, t); break;
      case 'burke_shaw':    this.burkeShaw(ctx, W, H, params, palette, t); break;
      case 'nose_hoover':   this.noseHoover(ctx, W, H, params, palette, t); break;
      case 'langford':      this.langford(ctx, W, H, params, palette, t); break;
      default:              this.lorenz(ctx, W, H, params, palette, t);
    }
  },

  /* ── Shared: draw accumulated points with glow ── */
  drawPoints(ctx, W, H, points, palette, t) {
    ctx.fillStyle = 'rgba(3,3,10,0.08)';
    ctx.fillRect(0, 0, W, H);

    // Find bounds
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const [x, y] of points) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    const rx = maxX - minX || 1, ry = maxY - minY || 1;
    const padding = 0.1;
    const scaleX = W * (1 - padding * 2) / rx;
    const scaleY = H * (1 - padding * 2) / ry;
    const scale = Math.min(scaleX, scaleY);
    const offsetX = W / 2 - (minX + rx / 2) * scale;
    const offsetY = H / 2 - (minY + ry / 2) * scale;

    const n = points.length;
    for (let i = 0; i < n; i++) {
      const [x, y] = points[i];
      const px = x * scale + offsetX;
      const py = y * scale + offsetY;
      const progress = i / n;
      const hue = (palette.h1 + progress * (palette.h2 - palette.h1)) % 360;
      const alpha = 0.15 + progress * 0.5;
      ctx.fillStyle = `hsla(${hue}, 90%, 65%, ${alpha})`;
      ctx.fillRect(px, py, 1.2, 1.2);
    }
  },

  /* ── Lorenz attractor ── */
  lorenz(ctx, W, H, params, palette, t) {
    const { sigma = 10, rho = 28, beta = 2.667, dt = 0.005, projection = 0 } = params;
    const steps = Math.min(params.steps || 80000, 120000);

    if (!this._cache_lorenz || this._cache_lorenz.key !== `${sigma}_${rho}_${beta}`) {
      let x = 0.1, y = 0, z = 0;
      const pts = [];
      for (let i = 0; i < steps; i++) {
        const dx = sigma * (y - x);
        const dy = x * (rho - z) - y;
        const dz = x * y - beta * z;
        x += dx * dt; y += dy * dt; z += dz * dt;
        if (i % 3 === 0) pts.push(projection === 0 ? [x, z] : projection === 1 ? [x, y] : [y, z]);
      }
      this._cache_lorenz = { key: `${sigma}_${rho}_${beta}`, pts };
    }

    this.drawPoints(ctx, W, H, this._cache_lorenz.pts, palette, t);
  },

  /* ── Rössler attractor ── */
  rossler(ctx, W, H, params, palette, t) {
    const a = params.a || 0.2, b = params.b || 0.2, c = params.c || 5.7;
    const dt = params.dt || 0.01;
    const steps = 60000;

    if (!this._cache_rossler || this._cache_rossler.key !== `${a}_${b}_${c}`) {
      let x = 1, y = 0, z = 0;
      const pts = [];
      for (let i = 0; i < steps; i++) {
        const dx = -y - z;
        const dy = x + a * y;
        const dz = b + z * (x - c);
        x += dx * dt; y += dy * dt; z += dz * dt;
        if (i % 2 === 0) pts.push([x, y]);
      }
      this._cache_rossler = { key: `${a}_${b}_${c}`, pts };
    }
    this.drawPoints(ctx, W, H, this._cache_rossler.pts, palette, t);
  },

  /* ── Chen attractor ── */
  chen(ctx, W, H, params, palette, t) {
    const a = params.a || 35, b = params.b || 3, c = params.c || 28;
    const dt = 0.002;
    const steps = 70000;

    const key = `chen_${a}_${b}_${c}`;
    if (!this._cache_chen || this._cache_chen.key !== key) {
      let x = -0.1, y = 0.5, z = -0.6;
      const pts = [];
      for (let i = 0; i < steps; i++) {
        const dx = a * (y - x);
        const dy = (c - a) * x - x * z + c * y;
        const dz = x * y - b * z;
        x += dx * dt; y += dy * dt; z += dz * dt;
        if (i % 2 === 0) pts.push([x, z]);
      }
      this._cache_chen = { key, pts };
    }
    this.drawPoints(ctx, W, H, this._cache_chen.pts, palette, t);
  },

  /* ── Aizawa attractor ── */
  aizawa(ctx, W, H, params, palette, t) {
    const a=0.95, b=0.7, c=0.6, d=3.5, e=0.25, f=0.1;
    const dt = 0.01;
    const steps = 60000;
    const key = 'aizawa';

    if (!this._cache_aizawa) {
      let x = 0.1, y = 0, z = 0;
      const pts = [];
      for (let i = 0; i < steps; i++) {
        const dx = (z-b)*x - d*y;
        const dy = d*x + (z-b)*y;
        const dz = c + a*z - z*z*z/3 - (x*x+y*y)*(1+e*z) + f*z*x*x*x;
        x += dx * dt; y += dy * dt; z += dz * dt;
        if (i % 2 === 0) pts.push([x, y]);
      }
      this._cache_aizawa = { pts };
    }
    this.drawPoints(ctx, W, H, this._cache_aizawa.pts, palette, t);
  },

  /* ── Halvorsen attractor ── */
  halvorsen(ctx, W, H, params, palette, t) {
    const a = params.a || 1.89;
    const dt = 0.005;
    const steps = 70000;
    const key = `halvorsen_${a}`;

    if (!this._cache_halvorsen || this._cache_halvorsen.key !== key) {
      let x = -1.48, y = -1.51, z = 2.04;
      const pts = [];
      for (let i = 0; i < steps; i++) {
        const dx = -a*x - 4*y - 4*z - y*y;
        const dy = -a*y - 4*z - 4*x - z*z;
        const dz = -a*z - 4*x - 4*y - x*x;
        x += dx * dt; y += dy * dt; z += dz * dt;
        if (i % 2 === 0) pts.push([x, y]);
      }
      this._cache_halvorsen = { key, pts };
    }
    this.drawPoints(ctx, W, H, this._cache_halvorsen.pts, palette, t);
  },

  /* ── Dadras attractor ── */
  dadras(ctx, W, H, params, palette, t) {
    const a=3, b=2.7, c=1.7, d=2, e=9;
    const dt = 0.004;
    const steps = 60000;
    if (!this._cache_dadras) {
      let x=1, y=1, z=1;
      const pts = [];
      for (let i=0; i<steps; i++) {
        const dx = y - a*x + b*y*z;
        const dy = c*y - x*z + z;
        const dz = d*x*y - e*z;
        x+=dx*dt; y+=dy*dt; z+=dz*dt;
        if (i%2===0) pts.push([x,y]);
      }
      this._cache_dadras = { pts };
    }
    this.drawPoints(ctx, W, H, this._cache_dadras.pts, palette, t);
  },

  /* ── Sprott (class B) ── */
  sprott(ctx, W, H, params, palette, t) {
    const dt = 0.01;
    const steps = 80000;
    if (!this._cache_sprott) {
      // Sprott B: dx=yz, dy=x-y, dz=1-xy
      let x=0.1, y=0, z=0;
      const pts = [];
      for (let i=0; i<steps; i++) {
        const dx = y*z;
        const dy = x - y;
        const dz = 1 - x*y;
        x+=dx*dt; y+=dy*dt; z+=dz*dt;
        if (i%2===0) pts.push([x,z]);
      }
      this._cache_sprott = { pts };
    }
    this.drawPoints(ctx, W, H, this._cache_sprott.pts, palette, t);
  },

  /* ── Thomas cyclically symmetric ── */
  thomas(ctx, W, H, params, palette, t) {
    const b = params.b || 0.208186;
    const dt = 0.05;
    const steps = 40000;
    const key = `thomas_${b}`;
    if (!this._cache_thomas || this._cache_thomas.key !== key) {
      let x=0.1, y=0, z=0;
      const pts = [];
      for (let i=0; i<steps; i++) {
        const dx = Math.sin(y) - b*x;
        const dy = Math.sin(z) - b*y;
        const dz = Math.sin(x) - b*z;
        x+=dx*dt; y+=dy*dt; z+=dz*dt;
        pts.push([x,y]);
      }
      this._cache_thomas = { key, pts };
    }
    this.drawPoints(ctx, W, H, this._cache_thomas.pts, palette, t);
  },

  /* ── Dequan-Li attractor ── */
  dequanLi(ctx, W, H, params, palette, t) {
    const a=40, b=1.833, c=0.16, d=0.65, e=55, f=20;
    const dt = 0.001;
    const steps = 100000;
    if (!this._cache_dequan) {
      let x=0.349,y=0,z=-0.16;
      const pts=[];
      for (let i=0; i<steps; i++) {
        const dx=a*(y-x)+c*x*z;
        const dy=e*x+f*y-x*z;
        const dz=b*z+x*y-d*x*x;
        x+=dx*dt; y+=dy*dt; z+=dz*dt;
        if (i%3===0) pts.push([x,y]);
      }
      this._cache_dequan={pts};
    }
    this.drawPoints(ctx, W, H, this._cache_dequan.pts, palette, t);
  },

  /* ── Arneodo attractor ── */
  arneodo(ctx, W, H, params, palette, t) {
    const a=-5.5, b=3.5, c=-1;
    const dt = 0.01;
    const steps = 60000;
    if (!this._cache_arneodo) {
      let x=0.1, y=0, z=0;
      const pts=[];
      for (let i=0; i<steps; i++) {
        const dx = y;
        const dy = z;
        const dz = -a*x - b*y - z + c*x*x*x;
        x+=dx*dt; y+=dy*dt; z+=dz*dt;
        pts.push([x,y]);
      }
      this._cache_arneodo={pts};
    }
    this.drawPoints(ctx, W, H, this._cache_arneodo.pts, palette, t);
  },

  /* ── Burke-Shaw attractor ── */
  burkeShaw(ctx, W, H, params, palette, t) {
    const s=10, v=4.272;
    const dt = 0.004;
    const steps = 70000;
    if (!this._cache_burke) {
      let x=1, y=0, z=0;
      const pts=[];
      for (let i=0; i<steps; i++) {
        const dx=-s*(x+y);
        const dy=-y-s*x*z;
        const dz=s*x*y+v;
        x+=dx*dt; y+=dy*dt; z+=dz*dt;
        if (i%2===0) pts.push([x,z]);
      }
      this._cache_burke={pts};
    }
    this.drawPoints(ctx, W, H, this._cache_burke.pts, palette, t);
  },

  /* ── Nose-Hoover attractor ── */
  noseHoover(ctx, W, H, params, palette, t) {
    const a = params.a || 1.5;
    const dt = 0.01;
    const steps = 80000;
    const key = `nosehoover_${a}`;
    if (!this._cache_nosehoover || this._cache_nosehoover.key !== key) {
      let x=0, y=5, z=0;
      const pts=[];
      for (let i=0; i<steps; i++) {
        const dx=y;
        const dy=-x+y*z;
        const dz=a-y*y;
        x+=dx*dt; y+=dy*dt; z+=dz*dt;
        if (i%2===0) pts.push([x,y]);
      }
      this._cache_nosehoover={key,pts};
    }
    this.drawPoints(ctx, W, H, this._cache_nosehoover.pts, palette, t);
  },

  /* ── Langford attractor ── */
  langford(ctx, W, H, params, palette, t) {
    const a=0.95,b=0.7,c=0.6,d=3.5,e=0.25,f=0.1;
    const dt = 0.01;
    const steps = 60000;
    if (!this._cache_langford) {
      let x=1,y=0,z=0.5;
      const pts=[];
      for (let i=0; i<steps; i++) {
        const dx=(z-b)*x-d*y;
        const dy=d*x+(z-b)*y;
        const dz=c+a*z-Math.pow(z,3)/3-(x*x+y*y)*(1+e*z)+f*z*Math.pow(x,3);
        x+=dx*dt; y+=dy*dt; z+=dz*dt;
        if (i%2===0) pts.push([x,y]);
      }
      this._cache_langford={pts};
    }
    this.drawPoints(ctx, W, H, this._cache_langford.pts, palette, t);
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AttractorsAlgo;
} else {
  window.AttractorsAlgo = AttractorsAlgo;
}
