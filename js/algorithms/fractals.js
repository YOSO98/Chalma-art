/* ══════════════════════════════════════════════════════════════
   CHALMA ART — Fractals Algorithm
   Family 0, seeds 1–5000
   ══════════════════════════════════════════════════════════════ */

'use strict';

const FractalsAlgo = {

  render(ctx, W, H, artwork, t) {
    const { algorithm, params, palette } = artwork;
    switch (algorithm) {
      case 'mandelbrot':   this.mandelbrot(ctx, W, H, params, palette, t); break;
      case 'julia':        this.julia(ctx, W, H, params, palette, t); break;
      case 'burning_ship': this.burningShip(ctx, W, H, params, palette, t); break;
      case 'newton':       this.newton(ctx, W, H, params, palette, t); break;
      case 'phoenix':      this.phoenix(ctx, W, H, params, palette, t); break;
      case 'tricorn':      this.tricorn(ctx, W, H, params, palette, t); break;
      case 'buddhabrot':   this.buddhabrot(ctx, W, H, params, palette, t); break;
      case 'lyapunov':     this.lyapunov(ctx, W, H, params, palette, t); break;
      case 'ifs_fern':     this.ifsFern(ctx, W, H, params, palette, t); break;
      case 'ifs_dragon':   this.ifsDragon(ctx, W, H, params, palette, t); break;
      case 'mandelbox':    this.mandelbox(ctx, W, H, params, palette, t); break;
      case 'multibrot':    this.multibrot(ctx, W, H, params, palette, t); break;
      default:             this.mandelbrot(ctx, W, H, params, palette, t);
    }
  },

  /* ── Mandelbrot ── */
  mandelbrot(ctx, W, H, params, palette, t) {
    const { zoom = 1, maxIter = 100, colorMode = 0 } = params;
    const cx = params.cx || -0.5, cy = params.cy || 0;
    const scale = 3.5 / (W * zoom);
    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;

    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const x0 = (px - W / 2) * scale + cx;
        const y0 = (py - H / 2) * scale + cy;
        let x = 0, y = 0, iter = 0;
        while (x * x + y * y <= 4 && iter < maxIter) {
          const xt = x * x - y * y + x0;
          y = 2 * x * y + y0;
          x = xt;
          iter++;
        }
        const idx = (py * W + px) * 4;
        if (iter === maxIter) {
          data[idx] = 0; data[idx+1] = 0; data[idx+2] = 0; data[idx+3] = 255;
        } else {
          const smooth = iter + 1 - Math.log(Math.log(Math.sqrt(x*x+y*y))) / Math.log(2);
          const [r, g, b] = this.colorize(smooth / maxIter, colorMode, palette, t);
          data[idx] = r; data[idx+1] = g; data[idx+2] = b; data[idx+3] = 255;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  },

  /* ── Julia set ── */
  julia(ctx, W, H, params, palette, t) {
    const { maxIter = 100, colorMode = 0 } = params;
    const cx = params.cx || -0.7, cy = params.cy || 0.27;
    const scale = 3.5 / W;
    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;
    // Animate c slowly
    const ac = cx + Math.sin(t * 0.1) * 0.02;
    const bc = cy + Math.cos(t * 0.07) * 0.02;

    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        let x = (px - W / 2) * scale;
        let y = (py - H / 2) * scale;
        let iter = 0;
        while (x * x + y * y <= 4 && iter < maxIter) {
          const xt = x * x - y * y + ac;
          y = 2 * x * y + bc;
          x = xt;
          iter++;
        }
        const idx = (py * W + px) * 4;
        if (iter === maxIter) {
          data[idx] = data[idx+1] = data[idx+2] = 0; data[idx+3] = 255;
        } else {
          const n = iter / maxIter;
          const [r, g, b] = this.colorize(n, colorMode, palette, t);
          data[idx] = r; data[idx+1] = g; data[idx+2] = b; data[idx+3] = 255;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  },

  /* ── Burning Ship ── */
  burningShip(ctx, W, H, params, palette, t) {
    const { zoom = 1, maxIter = 100, colorMode = 1 } = params;
    const scale = 3.5 / (W * zoom);
    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;
    const ocx = -1.75 + (params.cx || 0) * 0.1;
    const ocy = -0.04 + (params.cy || 0) * 0.1;

    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const x0 = (px - W / 2) * scale + ocx;
        const y0 = (py - H / 2) * scale + ocy;
        let x = 0, y = 0, iter = 0;
        while (x * x + y * y <= 4 && iter < maxIter) {
          const xt = x * x - y * y + x0;
          y = Math.abs(2 * x * y) + y0;
          x = Math.abs(xt);
          iter++;
        }
        const idx = (py * W + px) * 4;
        const n = iter === maxIter ? 0 : iter / maxIter;
        const [r, g, b] = iter === maxIter ? [0,0,0] : this.colorize(n, colorMode, palette, t);
        data[idx] = r; data[idx+1] = g; data[idx+2] = b; data[idx+3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  },

  /* ── Newton fractal ── */
  newton(ctx, W, H, params, palette, t) {
    const { power = 3, maxIter = 60 } = params;
    const scale = 3 / W;
    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;
    const roots = [];
    for (let i = 0; i < power; i++) {
      roots.push({
        x: Math.cos(2 * Math.PI * i / power),
        y: Math.sin(2 * Math.PI * i / power)
      });
    }
    const tol = 0.001;

    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        let zx = (px - W / 2) * scale;
        let zy = (py - H / 2) * scale;
        let iter = 0, rootIdx = -1;

        for (let i = 0; i < maxIter; i++) {
          // f(z) = z^power - 1, f'(z) = power * z^(power-1)
          // Newton: z = z - f(z)/f'(z) = z * (power-1)/power + 1/(power * z^(power-1))
          let zxp = zx, zyp = zy;
          for (let j = 1; j < power - 1; j++) {
            const nx = zxp * zx - zyp * zy;
            const ny = zxp * zy + zyp * zx;
            zxp = nx; zyp = ny;
          }
          const denom = power * (zxp * zxp + zyp * zyp);
          if (denom === 0) break;
          const newZx = ((power - 1) * zx) / power + (zxp) / denom;
          const newZy = ((power - 1) * zy) / power - (zyp) / denom;
          zx = newZx; zy = newZy;

          for (let r = 0; r < roots.length; r++) {
            const dx = zx - roots[r].x, dy = zy - roots[r].y;
            if (dx * dx + dy * dy < tol) { rootIdx = r; break; }
          }
          if (rootIdx >= 0) { iter = i; break; }
        }

        const idx = (py * W + px) * 4;
        if (rootIdx < 0) {
          data[idx] = data[idx+1] = data[idx+2] = 0; data[idx+3] = 255;
        } else {
          const hue = (rootIdx / power + iter * 0.02 + t * 0.05) % 1;
          const [r, g, b] = this.hslToRgb((hue + palette.h1 / 360) % 1, 0.9, 0.4 + iter * 0.01);
          data[idx] = r; data[idx+1] = g; data[idx+2] = b; data[idx+3] = 255;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  },

  /* ── Phoenix fractal ── */
  phoenix(ctx, W, H, params, palette, t) {
    const { maxIter = 80, cx = -0.5, cy = 0 } = params;
    const scale = 3 / W;
    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;
    const p = -0.5 + Math.sin(t * 0.05) * 0.1;

    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        let zx = (px - W / 2) * scale;
        let zy = (py - H / 2) * scale;
        let zxp = 0, zyp = 0, iter = 0;

        while (zx * zx + zy * zy <= 4 && iter < maxIter) {
          const nzx = zx * zx - zy * zy + cx + p * zxp;
          const nzy = 2 * zx * zy + cy + p * zyp;
          zxp = zx; zyp = zy;
          zx = nzx; zy = nzy;
          iter++;
        }

        const idx = (py * W + px) * 4;
        const n = iter === maxIter ? 0 : iter / maxIter;
        const [r, g, b] = iter === maxIter ? [0,0,0] : this.colorize(n, 2, palette, t);
        data[idx] = r; data[idx+1] = g; data[idx+2] = b; data[idx+3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  },

  /* ── Tricorn ── */
  tricorn(ctx, W, H, params, palette, t) {
    const { zoom = 1, maxIter = 100 } = params;
    const scale = 3.5 / (W * zoom);
    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;

    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const x0 = (px - W / 2) * scale;
        const y0 = (py - H / 2) * scale;
        let x = 0, y = 0, iter = 0;
        while (x * x + y * y <= 4 && iter < maxIter) {
          const xt = x * x - y * y + x0;
          y = -2 * x * y + y0; // conjugate
          x = xt;
          iter++;
        }
        const idx = (py * W + px) * 4;
        const n = iter === maxIter ? 0 : iter / maxIter;
        const [r, g, b] = iter === maxIter ? [0,0,0] : this.colorize(n, 3, palette, t);
        data[idx] = r; data[idx+1] = g; data[idx+2] = b; data[idx+3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  },

  /* ── Buddhabrot (simplified, using accumulated density) ── */
  buddhabrot(ctx, W, H, params, palette, t) {
    const { maxIter = 80 } = params;
    const density = new Float32Array(W * H);
    const scale = 3.5 / Math.min(W, H);
    const samples = 30000;

    for (let s = 0; s < samples; s++) {
      // Random point in [-2.5, 1] x [-1.25, 1.25]
      const cx = (Math.random() - 0.5) * 3.5;
      const cy = (Math.random() - 0.5) * 2.5;
      let x = 0, y = 0;
      const path = [];
      let escaped = false;

      for (let i = 0; i < maxIter; i++) {
        const xt = x * x - y * y + cx;
        y = 2 * x * y + cy;
        x = xt;
        path.push([x, y]);
        if (x * x + y * y > 4) { escaped = true; break; }
      }

      if (escaped) {
        for (const [px, py] of path) {
          const ix = Math.floor((px + 2.5) / 3.5 * W);
          const iy = Math.floor((py + 1.25) / 2.5 * H);
          if (ix >= 0 && ix < W && iy >= 0 && iy < H) density[iy * W + ix]++;
        }
      }
    }

    const max = Math.max(...density) || 1;
    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;
    const h = palette.h1 / 360;

    for (let i = 0; i < W * H; i++) {
      const v = Math.pow(density[i] / max, 0.4);
      const [r, g, b] = this.hslToRgb((h + v * 0.3) % 1, 0.9, v * 0.7);
      data[i*4] = r; data[i*4+1] = g; data[i*4+2] = b; data[i*4+3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
  },

  /* ── Lyapunov exponent map ── */
  lyapunov(ctx, W, H, params, palette, t) {
    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;
    const sequence = 'AABAB'; // can vary with params
    const N = 30;

    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const a = 2.5 + px / W * 1.5;
        const b = 2.5 + py / H * 1.5;
        let x = 0.5, lyap = 0;

        for (let i = 0; i < N * 2; i++) {
          const r = sequence[i % sequence.length] === 'A' ? a : b;
          x = r * x * (1 - x);
          if (i >= N) {
            const d = Math.abs(r * (1 - 2 * x));
            lyap += d > 0 ? Math.log(d) : -10;
          }
        }
        lyap /= N;

        const idx = (py * W + px) * 4;
        if (lyap < 0) {
          const v = Math.min(1, -lyap / 3);
          const [r, g, b] = this.hslToRgb(palette.h1 / 360, 0.9, v * 0.6);
          data[idx] = r; data[idx+1] = g; data[idx+2] = b;
        } else {
          const v = Math.min(1, lyap / 3);
          const [r, g, b] = this.hslToRgb(palette.h2 / 360, 0.9, v * 0.6);
          data[idx] = r; data[idx+1] = g; data[idx+2] = b;
        }
        data[idx+3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  },

  /* ── IFS Fern (Barnsley) ── */
  ifsFern(ctx, W, H, params, palette, t) {
    ctx.fillStyle = '#03030a';
    ctx.fillRect(0, 0, W, H);

    let x = 0, y = 0;
    const n = 80000;
    const hue = palette.h1;

    for (let i = 0; i < n; i++) {
      const r = Math.random();
      let nx, ny;
      if (r < 0.01)      { nx = 0;                ny = 0.16 * y; }
      else if (r < 0.86) { nx = 0.85*x + 0.04*y; ny = -0.04*x + 0.85*y + 1.6; }
      else if (r < 0.93) { nx = 0.2*x - 0.26*y;  ny = 0.23*x + 0.22*y + 1.6; }
      else               { nx = -0.15*x + 0.28*y; ny = 0.26*x + 0.24*y + 0.44; }
      x = nx; y = ny;

      const px = Math.floor(W / 2 + x * W / 11);
      const py = Math.floor(H - y * H / 11);
      if (px >= 0 && px < W && py >= 0 && py < H) {
        const alpha = 0.6 + Math.sin(i * 0.001 + t) * 0.2;
        ctx.fillStyle = `hsla(${hue + Math.random() * 30}, 80%, 55%, ${alpha})`;
        ctx.fillRect(px, py, 1, 1);
      }
    }
  },

  /* ── IFS Dragon curve ── */
  ifsDragon(ctx, W, H, params, palette, t) {
    ctx.fillStyle = '#03030a';
    ctx.fillRect(0, 0, W, H);

    let x = 0, y = 0;
    const n = 80000;
    const hue = palette.h1;

    for (let i = 0; i < n; i++) {
      const r = Math.random();
      let nx, ny;
      if (r < 0.5) { nx = 0.5*x - 0.5*y; ny = 0.5*x + 0.5*y; }
      else         { nx = -0.5*x + 0.5*y + 1; ny = -0.5*x - 0.5*y; }
      x = nx; y = ny;

      const px = Math.floor(x * W * 0.8 + W * 0.2);
      const py = Math.floor(y * H * 0.8 + H * 0.5);
      if (px >= 0 && px < W && py >= 0 && py < H) {
        const v = (i / n);
        ctx.fillStyle = `hsla(${hue + v * 120}, 90%, ${40 + v * 30}%, 0.5)`;
        ctx.fillRect(px, py, 1, 1);
      }
    }
  },

  /* ── Mandelbox (2D slice) ── */
  mandelbox(ctx, W, H, params, palette, t) {
    const { maxIter = 40, zoom = 1 } = params;
    const scale2 = params.scale || 2;
    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;
    const s = 6 / (W * zoom);

    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        let x = (px - W/2) * s, y = (py - H/2) * s;
        const cx = x, cy = y;
        let iter = 0;

        while (iter < maxIter) {
          // Box fold
          if (x > 1) x = 2 - x;
          else if (x < -1) x = -2 - x;
          if (y > 1) y = 2 - y;
          else if (y < -1) y = -2 - y;
          // Sphere fold
          const r2 = x*x + y*y;
          if (r2 < 0.25) { x *= 4; y *= 4; }
          else if (r2 < 1) { x /= r2; y /= r2; }
          x = scale2 * x + cx;
          y = scale2 * y + cy;
          if (x*x + y*y > 100) break;
          iter++;
        }

        const idx = (py * W + px) * 4;
        const n = iter / maxIter;
        const [r, g, b] = iter === maxIter ? [0,0,0] : this.colorize(n, 1, palette, t);
        data[idx] = r; data[idx+1] = g; data[idx+2] = b; data[idx+3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  },

  /* ── Multibrot (z^n + c) ── */
  multibrot(ctx, W, H, params, palette, t) {
    const { zoom = 1, maxIter = 80 } = params;
    const power = Math.max(2, Math.min(8, params.power || 3));
    const scale = 3.5 / (W * zoom);
    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;

    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const cx = (px - W/2) * scale;
        const cy = (py - H/2) * scale;
        let zx = 0, zy = 0, iter = 0;

        while (zx*zx + zy*zy <= 4 && iter < maxIter) {
          // Compute z^power
          let rx = 1, ry = 0;
          for (let p = 0; p < power; p++) {
            const nx = rx*zx - ry*zy;
            const ny = rx*zy + ry*zx;
            rx = nx; ry = ny;
          }
          zx = rx + cx; zy = ry + cy;
          iter++;
        }

        const idx = (py * W + px) * 4;
        const n = iter / maxIter;
        const [r, g, b] = iter === maxIter ? [0,0,0] : this.colorize(n, params.colorMode || 0, palette, t);
        data[idx] = r; data[idx+1] = g; data[idx+2] = b; data[idx+3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  },

  /* ── Colorization ── */
  colorize(n, mode, palette, t = 0) {
    const h1 = (palette.h1 || 200) / 360;
    const h2 = (palette.h2 || 280) / 360;
    switch (mode % 5) {
      case 0: return this.hslToRgb((h1 + n * 0.5 + t * 0.02) % 1, 0.9, 0.2 + n * 0.7);
      case 1: return this.hslToRgb((h2 + Math.sin(n * Math.PI) * 0.4) % 1, 1, 0.3 + n * 0.5);
      case 2: {
        const r = Math.floor(255 * Math.pow(n, 0.5));
        const g = Math.floor(255 * Math.pow(n, 1.5));
        const b = Math.floor(255 * n);
        return [r, g, b];
      }
      case 3: return this.hslToRgb((h1 + n * 0.3) % 1, 0.8, n > 0.5 ? 0.8 - n * 0.4 : n);
      case 4: {
        const smooth = 0.5 + 0.5 * Math.sin(n * Math.PI * 8 + t);
        return this.hslToRgb((h1 + smooth * 0.2) % 1, 1, smooth * 0.7);
      }
      default: return this.hslToRgb(h1, 0.9, n);
    }
  },

  /* ── HSL → RGB ── */
  hslToRgb(h, s, l) {
    h = ((h % 1) + 1) % 1;
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FractalsAlgo;
} else {
  window.FractalsAlgo = FractalsAlgo;
}
