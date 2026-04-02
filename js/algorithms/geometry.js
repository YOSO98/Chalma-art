/* ══════════════════════════════════════════════════════════════
   CHALMA ART — Sacred & Procedural Geometry
   Family 5, seeds 25001–30000
   ══════════════════════════════════════════════════════════════ */
'use strict';

const GeometryAlgo = {

  render(ctx, W, H, artwork, t) {
    const { algorithm, params, palette } = artwork;
    switch (algorithm) {
      case 'lsystem':          this.lSystem(ctx, W, H, params, palette, t); break;
      case 'spirograph':       this.spirograph(ctx, W, H, params, palette, t); break;
      case 'lissajous_3d':     this.lissajous(ctx, W, H, params, palette, t); break;
      case 'sacred_geometry':  this.sacredGeometry(ctx, W, H, params, palette, t); break;
      case 'rose_curve':       this.roseCurve(ctx, W, H, params, palette, t); break;
      case 'fermat_spiral':    this.fermatSpiral(ctx, W, H, params, palette, t); break;
      case 'minimal_surface':  this.minimalSurface(ctx, W, H, params, palette, t); break;
      case 'torus_knot':       this.torusKnot(ctx, W, H, params, palette, t); break;
      case 'polytope_4d':      this.polytope4D(ctx, W, H, params, palette, t); break;
      case 'hypocycloid':      this.hypocycloid(ctx, W, H, params, palette, t); break;
      default:                 this.spirograph(ctx, W, H, params, palette, t);
    }
  },

  /* ── L-System ── */
  lSystem(ctx, W, H, params, palette, t) {
    ctx.fillStyle = '#03030a';
    ctx.fillRect(0, 0, W, H);

    const { iterations = 5, angle = 25, scale = 0.7 } = params;
    const hue = palette.h1;

    // Plant grammar
    const axioms = ['F', 'X', 'F+F+F+F'];
    const grammars = [
      { F: 'F[+F]F[-F]F', X: 'F[+X][-X]FX' },
      { X: 'F+[[X]-X]-F[-FX]+X', F: 'FF' },
      { F: 'F+F-F-FF+F+F-F' }
    ];

    const gramIdx = Math.floor(hue / 120) % grammars.length;
    const grammar = grammars[gramIdx];
    let str = axioms[gramIdx];

    const maxIter = Math.min(iterations, 6);
    for (let i = 0; i < maxIter; i++) {
      str = str.split('').map(c => grammar[c] || c).join('');
      if (str.length > 200000) break;
    }

    const len = Math.min(W, H) / Math.pow(3, maxIter) * 1.5;
    const angleRad = (angle + t * 0.5) * Math.PI / 180;

    ctx.save();
    ctx.translate(W / 2, H * 0.9);
    ctx.strokeStyle = `hsl(${hue}, 80%, 55%)`;
    ctx.lineWidth = 0.8;

    const stack = [];
    let cx = 0, cy = 0, dir = -Math.PI / 2;

    for (const c of str.slice(0, 50000)) {
      switch (c) {
        case 'F': case 'f': {
          const nx = cx + Math.cos(dir) * len;
          const ny = cy + Math.sin(dir) * len;
          if (c === 'F') {
            const depth = stack.length;
            const bright = 30 + depth * 8;
            ctx.strokeStyle = `hsl(${hue + depth * 10}, 85%, ${Math.min(75, bright)}%)`;
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nx, ny); ctx.stroke();
          }
          cx = nx; cy = ny; break;
        }
        case '+': dir += angleRad; break;
        case '-': dir -= angleRad; break;
        case '[': stack.push({ cx, cy, dir }); break;
        case ']': {
          const s = stack.pop();
          if (s) { cx = s.cx; cy = s.cy; dir = s.dir; }
          break;
        }
      }
    }
    ctx.restore();
  },

  /* ── Spirograph (hypotrochoid/epitrochoid) ── */
  spirograph(ctx, W, H, params, palette, t) {
    ctx.fillStyle = 'rgba(3,3,10,0.15)';
    ctx.fillRect(0, 0, W, H);

    const { R = 100, r = 40, d = 60 } = params;
    const hue = palette.h1;
    const cx = W / 2, cy = H / 2;
    const scale = Math.min(W, H) / ((R + d) * 2.4);
    const steps = 2000;
    const totalAngle = Math.PI * 2 * (r / this._gcd(Math.abs(R), Math.abs(r)));

    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * totalAngle + t * 0.1;
      const x = (R - r) * Math.cos(theta) + d * Math.cos((R - r) / r * theta);
      const y = (R - r) * Math.sin(theta) - d * Math.sin((R - r) / r * theta);
      const progress = i / steps;
      const h = (hue + progress * 60) % 360;

      if (i === 0) {
        ctx.moveTo(cx + x * scale, cy + y * scale);
      } else {
        ctx.lineTo(cx + x * scale, cy + y * scale);
      }
    }
    ctx.strokeStyle = `hsl(${hue}, 90%, 60%)`;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
    ctx.shadowBlur = 4;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Animated arm
    const theta = t * 0.8;
    const ax1 = cx + (R * scale) * Math.cos(theta);
    const ay1 = cy + (R * scale) * Math.sin(theta);
    const ax2 = cx + ((R - r) * Math.cos(theta) + d * Math.cos((R - r) / r * theta)) * scale;
    const ay2 = cy + ((R - r) * Math.sin(theta) - d * Math.sin((R - r) / r * theta)) * scale;

    ctx.beginPath();
    ctx.arc(cx, cy, R * scale, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${hue}, 40%, 40%, 0.2)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(ax2, ay2);
    ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.4)`;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(ax2, ay2, 4, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${hue}, 100%, 80%)`;
    ctx.fill();
  },

  _gcd(a, b) { return b === 0 ? a : this._gcd(b, a % b); },

  /* ── Lissajous 3D projected ── */
  lissajous(ctx, W, H, params, palette, t) {
    ctx.fillStyle = 'rgba(3,3,10,0.12)';
    ctx.fillRect(0, 0, W, H);

    const { frequency = 3, phase = 1.2 } = params;
    const hue = palette.h1;
    const cx = W / 2, cy = H / 2;
    const rx = W * 0.38, ry = H * 0.38;
    const steps = 1000;

    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * Math.PI * 2 * frequency;
      const x = Math.sin(theta + t * 0.3);
      const y = Math.sin(2 * theta + phase + t * 0.2);
      const z = Math.cos(3 * theta + t * 0.15);
      // Project 3D → 2D with rotation
      const angle = t * 0.1;
      const px = cx + (x * Math.cos(angle) - z * Math.sin(angle)) * rx;
      const py = cy + y * ry;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, `hsl(${hue}, 90%, 60%)`);
    grad.addColorStop(1, `hsl(${(hue+60)%360}, 90%, 60%)`);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;
  },

  /* ── Sacred Geometry ── */
  sacredGeometry(ctx, W, H, params, palette, t) {
    ctx.fillStyle = '#03030a';
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) * 0.35;
    const hue = palette.h1;

    // Flower of Life
    const centers = [[0, 0]];
    for (let i = 0; i < 6; i++) {
      const angle = i * Math.PI / 3 + t * 0.05;
      centers.push([Math.cos(angle) * R * 0.6, Math.sin(angle) * R * 0.6]);
    }
    for (let i = 0; i < 6; i++) {
      const a1 = i * Math.PI / 3 + t * 0.05;
      const a2 = a1 + Math.PI / 3;
      centers.push([
        Math.cos(a1) * R * 0.6 + Math.cos(a2) * R * 0.6,
        Math.sin(a1) * R * 0.6 + Math.sin(a2) * R * 0.6
      ]);
    }

    for (let i = 0; i < centers.length; i++) {
      const [ox, oy] = centers[i];
      ctx.beginPath();
      ctx.arc(cx + ox, cy + oy, R * 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${hue + i * 5}, 80%, 55%, 0.3)`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Outer circle
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${hue}, 90%, 65%, 0.6)`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Star of David
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      for (let j = 0; j < 3; j++) {
        const a = j * Math.PI * 2 / 3 + i * Math.PI / 3 + t * 0.1;
        const x = cx + Math.cos(a) * R * 0.9;
        const y = cy + Math.sin(a) * R * 0.9;
        j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `hsla(${(hue + i * 30)%360}, 100%, 70%, 0.5)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  },

  /* ── Rose curve r = cos(nθ) ── */
  roseCurve(ctx, W, H, params, palette, t) {
    ctx.fillStyle = 'rgba(3,3,10,0.15)';
    ctx.fillRect(0, 0, W, H);

    const n = Math.max(2, Math.min(9, params.n || 5));
    const hue = palette.h1;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) * 0.42;
    const steps = 1000;

    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * Math.PI * (n % 2 === 0 ? 2 : 1) + t * 0.2;
      const r = R * Math.cos(n * theta);
      const x = cx + r * Math.cos(theta);
      const y = cy + r * Math.sin(theta);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `hsl(${hue}, 90%, 65%)`;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;
  },

  /* ── Fermat's spiral ── */
  fermatSpiral(ctx, W, H, params, palette, t) {
    ctx.fillStyle = 'rgba(3,3,10,0.1)';
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2;
    const phi = (1 + Math.sqrt(5)) / 2;
    const n = 800;
    const hue = palette.h1;

    for (let i = 0; i < n; i++) {
      const angle = i * phi * Math.PI * 2 + t * 0.1;
      const r = Math.sqrt(i) * Math.min(W, H) * 0.025;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      const size = Math.max(0.5, 4 - r / (Math.min(W, H) * 0.3));
      const hshift = (i * 0.5 + t * 20) % 360;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${hue + hshift * 0.1}, 90%, 65%)`;
      ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
      ctx.shadowBlur = size * 2;
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  },

  /* ── Minimal surface (Enneper projected) ── */
  minimalSurface(ctx, W, H, params, palette, t) {
    ctx.fillStyle = 'rgba(3,3,10,0.18)';
    ctx.fillRect(0, 0, W, H);

    const hue = palette.h1;
    const cx = W / 2, cy = H / 2;
    const steps = 40;
    const scale = Math.min(W, H) * 0.06;

    const cos_t = Math.cos(t * 0.2), sin_t = Math.sin(t * 0.2);

    for (let iu = 0; iu <= steps; iu++) {
      for (let iv = 0; iv <= steps - 1; iv++) {
        const u = (iu / steps - 0.5) * 4;
        const v = (iv / steps - 0.5) * 4;
        const v2 = ((iv + 1) / steps - 0.5) * 4;

        // Enneper surface
        const x1 = u - u*u*u/3 + u*v*v;
        const y1 = v - v*v*v/3 + v*u*u;
        const z1 = u*u - v*v;

        const x2 = u - u*u*u/3 + u*v2*v2;
        const y2 = v2 - v2*v2*v2/3 + v2*u*u;
        const z2 = u*u - v2*v2;

        // Rotate
        const rx1 = x1 * cos_t - z1 * sin_t;
        const rz1 = x1 * sin_t + z1 * cos_t;
        const rx2 = x2 * cos_t - z2 * sin_t;
        const rz2 = x2 * sin_t + z2 * cos_t;

        const px1 = cx + rx1 * scale;
        const py1 = cy + y1 * scale - rz1 * scale * 0.4;
        const px2 = cx + rx2 * scale;
        const py2 = cy + y2 * scale - rz2 * scale * 0.4;

        const bright = 30 + (z1 + 8) / 16 * 40;
        ctx.beginPath();
        ctx.moveTo(px1, py1); ctx.lineTo(px2, py2);
        ctx.strokeStyle = `hsla(${hue + iu * 2}, 80%, ${bright}%, 0.5)`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  },

  /* ── Torus knot ── */
  torusKnot(ctx, W, H, params, palette, t) {
    ctx.fillStyle = 'rgba(3,3,10,0.15)';
    ctx.fillRect(0, 0, W, H);

    const p = params.n || 3, q = params.k || 2;
    const hue = palette.h1;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) * 0.22;
    const r = Math.min(W, H) * 0.1;
    const steps = 800;
    const rot = t * 0.2;

    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const phi = (i / steps) * Math.PI * 2;
      const x3d = (R + r * Math.cos(q * phi)) * Math.cos(p * phi);
      const y3d = (R + r * Math.cos(q * phi)) * Math.sin(p * phi);
      const z3d = r * Math.sin(q * phi);
      // Project with rotation
      const cosr = Math.cos(rot), sinr = Math.sin(rot);
      const x2d = x3d * cosr - z3d * sinr;
      const y2d = y3d;
      const depth = x3d * sinr + z3d * cosr;
      pts.push({ x: cx + x2d, y: cy + y2d, depth, progress: i / steps });
    }

    pts.sort((a, b) => a.depth - b.depth);
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i], p2 = pts[i + 1];
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
      const bright = 30 + (p1.depth + R) / (2 * R) * 40;
      ctx.strokeStyle = `hsl(${hue + p1.progress * 60}, 90%, ${bright}%)`;
      ctx.lineWidth = 2;
      ctx.shadowColor = `hsl(${hue}, 100%, 65%)`;
      ctx.shadowBlur = 3;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  },

  /* ── 4D Polytope (Tesseract) projected ── */
  polytope4D(ctx, W, H, params, palette, t) {
    ctx.fillStyle = 'rgba(3,3,10,0.2)';
    ctx.fillRect(0, 0, W, H);

    const hue = palette.h1;
    const s = Math.min(W, H) * 0.25;
    const cx = W / 2, cy = H / 2;

    // Tesseract vertices
    const verts4D = [];
    for (let i = 0; i < 16; i++) {
      verts4D.push([
        (i & 1) ? 1 : -1,
        (i & 2) ? 1 : -1,
        (i & 4) ? 1 : -1,
        (i & 8) ? 1 : -1
      ]);
    }

    // Rotate in 4D
    const a = t * 0.3, b = t * 0.2, c = t * 0.15;
    const rot = ([x, y, z, w]) => {
      // XY rotation
      const x1 = x * Math.cos(a) - y * Math.sin(a);
      const y1 = x * Math.sin(a) + y * Math.cos(a);
      // ZW rotation
      const z1 = z * Math.cos(b) - w * Math.sin(b);
      const w1 = z * Math.sin(b) + w * Math.cos(b);
      // XZ rotation
      const x2 = x1 * Math.cos(c) - z1 * Math.sin(c);
      const z2 = x1 * Math.sin(c) + z1 * Math.cos(c);
      return [x2, y1, z2, w1];
    };

    const project = ([x, y, z, w]) => {
      const d = 2.5, d2 = 3;
      const f1 = d / (d - w);
      const x3 = x * f1, y3 = y * f1, z3 = z * f1;
      const f2 = d2 / (d2 - z3);
      return [cx + x3 * f2 * s, cy + y3 * f2 * s, f2];
    };

    const projected = verts4D.map(v => project(rot(v)));

    // Edges: vertices differing in exactly one bit
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        if (this._bitCount(i ^ j) === 1) {
          const [px1, py1, d1] = projected[i];
          const [px2, py2, d2] = projected[j];
          const depth = (d1 + d2) / 2;
          ctx.beginPath();
          ctx.moveTo(px1, py1); ctx.lineTo(px2, py2);
          ctx.strokeStyle = `hsla(${hue + depth * 20}, 80%, ${30 + depth * 20}%, 0.7)`;
          ctx.lineWidth = depth * 0.5;
          ctx.stroke();
        }
      }
    }

    for (const [px, py, d] of projected) {
      ctx.beginPath();
      ctx.arc(px, py, 3 * d, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${hue}, 90%, 70%)`;
      ctx.fill();
    }
  },

  _bitCount(n) {
    let c = 0;
    while (n) { c += n & 1; n >>= 1; }
    return c;
  },

  /* ── Hypocycloid ── */
  hypocycloid(ctx, W, H, params, palette, t) {
    ctx.fillStyle = 'rgba(3,3,10,0.12)';
    ctx.fillRect(0, 0, W, H);

    const { R = 150, r = 50, d = 80 } = params;
    const hue = palette.h1;
    const cx = W / 2, cy = H / 2;
    const scale = Math.min(W, H) / ((R + d) * 2.4);
    const steps = 3000;
    const maxAngle = Math.PI * 2 * r / this._gcd(Math.abs(R), Math.abs(r));

    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * maxAngle + t * 0.05;
      const x = (R - r) * Math.cos(theta) + d * Math.cos((R - r) / r * theta);
      const y = (R - r) * Math.sin(theta) - d * Math.sin((R - r) / r * theta);
      const progress = i / steps;
      if (i % 100 === 0 && i > 0) {
        ctx.strokeStyle = `hsl(${hue + progress * 60}, 90%, 60%)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + x * scale, cy + y * scale);
      } else {
        i === 0 ? ctx.moveTo(cx + x * scale, cy + y * scale)
                : ctx.lineTo(cx + x * scale, cy + y * scale);
      }
    }
    ctx.strokeStyle = `hsl(${hue}, 90%, 60%)`;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
};

if(typeof module!=='undefined'&&module.exports){module.exports=GeometryAlgo;}
else{window.GeometryAlgo=GeometryAlgo;}
