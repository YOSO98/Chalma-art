/* ══════════════════════════════════════════════════════════════
   CHALMA ART — Waves & Vibrations
   Family 4, seeds 20001–25000
   ══════════════════════════════════════════════════════════════ */
'use strict';

const WavesAlgo = {

  render(ctx, W, H, artwork, t) {
    const { algorithm, params, palette } = artwork;
    switch (algorithm) {
      case 'chladni':        this.chladni(ctx, W, H, params, palette, t); break;
      case 'fourier_series': this.fourierSeries(ctx, W, H, params, palette, t); break;
      case 'standing_wave_2d':this.standingWave2D(ctx, W, H, params, palette, t); break;
      case 'interference':   this.interference(ctx, W, H, params, palette, t); break;
      case 'kdv_soliton':    this.kdvSoliton(ctx, W, H, params, palette, t); break;
      case 'schrodinger':    this.schrodinger(ctx, W, H, params, palette, t); break;
      case 'vibrating_string':this.vibratingString(ctx, W, H, params, palette, t); break;
      case 'membrane_2d':    this.membrane2D(ctx, W, H, params, palette, t); break;
      case 'faraday':        this.faraday(ctx, W, H, params, palette, t); break;
      case 'phonon':         this.phonon(ctx, W, H, params, palette, t); break;
      default:               this.chladni(ctx, W, H, params, palette, t);
    }
  },

  /* ── Chladni figures ── */
  chladni(ctx, W, H, params, palette, t) {
    const { modes = 3 } = params;
    const m = Math.max(1, Math.min(8, modes));
    const n = Math.max(1, Math.min(8, (params.harmonics || 4)));
    const hue = palette.h1;

    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;
    const size = Math.min(W, H);
    const scale = Math.PI / size;
    const animN = n + Math.sin(t * 0.1) * 0.5;

    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const x = (px - (W - size) / 2) * scale;
        const y = (py - (H - size) / 2) * scale;
        if (x < 0 || x > Math.PI || y < 0 || y > Math.PI) continue;

        const z = Math.cos(m * x) * Math.sin(animN * y) -
                  Math.sin(m * x) * Math.cos(animN * y);
        const v = Math.abs(z);
        const idx = (py * W + px) * 4;

        if (v < 0.08) {
          // Node line — bright gold
          const bright = 1 - v / 0.08;
          const [r, g, b] = this.hslToRgb(palette.h1 / 360, 0.9, bright * 0.8);
          data[idx] = r; data[idx+1] = g; data[idx+2] = b; data[idx+3] = 255;
        } else {
          const [r, g, b] = this.hslToRgb(
            (palette.h1 / 360 + v * 0.3) % 1, 0.7,
            v * 0.12
          );
          data[idx] = r; data[idx+1] = g; data[idx+2] = b; data[idx+3] = 255;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  },

  /* ── Fourier series epicycles ── */
  fourierSeries(ctx, W, H, params, palette, t) {
    ctx.fillStyle = 'rgba(3,3,10,0.15)';
    ctx.fillRect(0, 0, W, H);
    const { harmonics = 8 } = params;
    const hue = palette.h1;

    const cx = W * 0.35, cy = H / 2;
    let x = cx, y = cy;
    const circles = [];

    for (let i = 1; i <= harmonics; i++) {
      const r = (W * 0.25) / i;
      const freq = i;
      const phase = (params.phase || 0) + i * 0.3;
      const nx = x + r * Math.cos(freq * t + phase);
      const ny = y + r * Math.sin(freq * t + phase);
      circles.push({ cx: x, cy: y, r, nx, ny, hue: (hue + i * 15) % 360 });
      x = nx; y = ny;
    }

    // Draw circles
    for (const c of circles) {
      ctx.beginPath();
      ctx.arc(c.cx, c.cy, c.r, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${c.hue}, 60%, 50%, 0.2)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(c.cx, c.cy);
      ctx.lineTo(c.nx, c.ny);
      ctx.strokeStyle = `hsla(${c.hue}, 90%, 65%, 0.6)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Final point dot
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${hue}, 100%, 80%)`;
    ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Trail
    if (!this._fourierTrail) this._fourierTrail = [];
    this._fourierTrail.push({ x, y });
    if (this._fourierTrail.length > 400) this._fourierTrail.shift();

    if (this._fourierTrail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this._fourierTrail[0].x, this._fourierTrail[0].y);
      for (let i = 1; i < this._fourierTrail.length; i++) {
        const alpha = i / this._fourierTrail.length;
        ctx.lineTo(this._fourierTrail[i].x, this._fourierTrail[i].y);
      }
      ctx.strokeStyle = `hsla(${hue}, 90%, 65%, 0.6)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  },

  /* ── 2D Standing wave ── */
  standingWave2D(ctx, W, H, params, palette, t) {
    const { modes = 3, frequency = 2, amplitude = 0.8 } = params;
    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;

    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const x = px / W * Math.PI * modes;
        const y = py / H * Math.PI * modes;
        const z = Math.sin(x) * Math.sin(y) *
                  Math.cos(frequency * t) * amplitude;
        const v = (z + 1) / 2;
        const [r, g, b] = this.hslToRgb(
          (palette.h1 / 360 + v * 0.5) % 1, 0.9, 0.1 + v * 0.6
        );
        const idx = (py * W + px) * 4;
        data[idx] = r; data[idx+1] = g; data[idx+2] = b; data[idx+3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  },

  /* ── Wave interference ── */
  interference(ctx, W, H, params, palette, t) {
    const { frequency = 3, amplitude = 1 } = params;
    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;

    const sources = [
      { x: W * 0.3, y: H * 0.5 },
      { x: W * 0.7, y: H * 0.5 },
      { x: W * 0.5, y: H * 0.3 }
    ];

    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        let sum = 0;
        for (const s of sources) {
          const dx = px - s.x, dy = py - s.y;
          const r = Math.sqrt(dx*dx + dy*dy);
          sum += Math.sin(r * 0.05 * frequency - t * 2) / (1 + r * 0.02);
        }
        const v = (sum / sources.length + 1) / 2;
        const [r, g, b] = this.hslToRgb(
          (palette.h1 / 360 + v * 0.4) % 1, 0.9, 0.05 + v * 0.7
        );
        const idx = (py * W + px) * 4;
        data[idx] = r; data[idx+1] = g; data[idx+2] = b; data[idx+3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  },

  /* ── KdV Soliton ── */
  kdvSoliton(ctx, W, H, params, palette, t) {
    ctx.fillStyle = `hsl(${palette.h1}, 20%, 5%)`;
    ctx.fillRect(0, 0, W, H);

    const { speed = 1.5 } = params;
    const hue = palette.h1;
    const solitons = [
      { v: speed, x0: W * 0.3 },
      { v: speed * 0.5, x0: W * 0.6 },
      { v: speed * 0.25, x0: W * 0.8 }
    ];

    for (let i = 0; i < solitons.length; i++) {
      const { v, x0 } = solitons[i];
      const x_pos = (x0 + v * t * 20) % (W * 1.2) - W * 0.1;

      ctx.beginPath();
      for (let px = 0; px < W; px++) {
        const xi = (px - x_pos) / 30;
        const amplitude = v * 3 / Math.cosh(xi * Math.sqrt(v)) ** 2;
        const py = H / 2 - amplitude * (H * 0.4);
        px === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.strokeStyle = `hsla(${(hue + i * 40) % 360}, 90%, 65%, 0.8)`;
      ctx.lineWidth = 2 + i;
      ctx.shadowColor = `hsl(${(hue + i * 40) % 360}, 100%, 70%)`;
      ctx.shadowBlur = 10;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Baseline
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.strokeStyle = `hsla(${hue}, 30%, 30%, 0.3)`;
    ctx.lineWidth = 1;
    ctx.stroke();
  },

  /* ── Schrödinger probability density ── */
  schrodinger(ctx, W, H, params, palette, t) {
    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;
    const { harmonics = 4 } = params;

    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const x = px / W;
        const y = py / H;
        let psi_r = 0, psi_i = 0;

        for (let n = 1; n <= harmonics; n++) {
          const E = n * n * Math.PI * Math.PI / 2;
          const phase = E * t * 0.1;
          const psi_n = Math.sin(n * Math.PI * x) * Math.sin(n * Math.PI * y);
          psi_r += psi_n * Math.cos(phase) / n;
          psi_i += psi_n * Math.sin(phase) / n;
        }

        const prob = (psi_r * psi_r + psi_i * psi_i);
        const v = Math.min(1, prob * 4);
        const [r, g, b] = this.hslToRgb(
          (palette.h1 / 360 + v * 0.5) % 1, 0.9, v * 0.7
        );
        const idx = (py * W + px) * 4;
        data[idx] = r; data[idx+1] = g; data[idx+2] = b; data[idx+3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  },

  /* ── Vibrating string modes ── */
  vibratingString(ctx, W, H, params, palette, t) {
    ctx.fillStyle = 'rgba(3,3,10,0.2)';
    ctx.fillRect(0, 0, W, H);

    const modes = Math.min(params.modes || 5, 8);
    const hue = palette.h1;

    for (let m = 1; m <= modes; m++) {
      ctx.beginPath();
      const y0 = H / 2 + (m - (modes + 1) / 2) * (H / (modes + 1));
      const amp = (H / (modes + 1)) * 0.4 * Math.sin(m * t * 0.5 + m);
      ctx.moveTo(0, y0);
      for (let px = 0; px <= W; px++) {
        const y = y0 + Math.sin(m * Math.PI * px / W) * amp;
        ctx.lineTo(px, y);
      }
      ctx.strokeStyle = `hsla(${(hue + m * 20) % 360}, 90%, 60%, 0.8)`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = `hsl(${(hue + m * 20) % 360}, 100%, 65%)`;
      ctx.shadowBlur = 6;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  },

  /* ── 2D Membrane vibration ── */
  membrane2D(ctx, W, H, params, palette, t) {
    const res = 60;
    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;
    const { modes = 3 } = params;

    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const x = px / W * Math.PI;
        const y = py / H * Math.PI;
        let z = 0;
        for (let m = 1; m <= modes; m++) {
          for (let n = 1; n <= modes; n++) {
            const freq = Math.sqrt(m*m + n*n);
            z += Math.sin(m*x) * Math.sin(n*y) *
                 Math.cos(freq * t * 0.5) / (m * n);
          }
        }
        const v = (z / modes + 1) / 2;
        const [r, g, b] = this.hslToRgb(
          (palette.h1 / 360 + v * 0.4) % 1, 0.9, 0.05 + v * 0.65
        );
        const idx = (py * W + px) * 4;
        data[idx] = r; data[idx+1] = g; data[idx+2] = b; data[idx+3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  },

  /* ── Faraday waves ── */
  faraday(ctx, W, H, params, palette, t) {
    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;
    const { frequency = 4 } = params;

    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const cx = px - W/2, cy = py - H/2;
        const r = Math.sqrt(cx*cx + cy*cy);
        const theta = Math.atan2(cy, cx);
        const z = Math.cos(r * 0.06 * frequency - t * 2) *
                  Math.cos(frequency * theta) *
                  Math.cos(t * 0.7);
        const v = (z + 1) / 2;
        const [rr, g, b] = this.hslToRgb(
          (palette.h1/360 + v*0.3)%1, 0.9, 0.05 + v * 0.65
        );
        const idx = (py*W+px)*4;
        data[idx]=rr; data[idx+1]=g; data[idx+2]=b; data[idx+3]=255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  },

  /* ── Phonon crystal ── */
  phonon(ctx, W, H, params, palette, t) {
    ctx.fillStyle = 'rgba(3,3,10,0.2)';
    ctx.fillRect(0, 0, W, H);

    const nx = 12, ny = 8;
    const hue = palette.h1;
    const dx = W / nx, dy = H / ny;

    for (let iy = 0; iy < ny; iy++) {
      for (let ix = 0; ix < nx; ix++) {
        const kx = ix / nx * Math.PI * 2, ky = iy / ny * Math.PI * 2;
        const omega = Math.sqrt(2 - Math.cos(kx) - Math.cos(ky));
        const phase = kx * ix + ky * iy - omega * t * 2;
        const amp = 0.3 * Math.sin(phase);
        const px = (ix + 0.5) * dx + amp * dx;
        const py = (iy + 0.5) * dy + amp * dy;
        const r = 3 + Math.abs(amp) * 8;

        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue + omega * 30}, 90%, 60%, 0.8)`;
        ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
        ctx.shadowBlur = r * 2;
        ctx.fill();

        // Bond to right neighbor
        if (ix < nx - 1) {
          const nx2 = (ix + 1.5) * dx + amp * dx;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(nx2, py);
          ctx.strokeStyle = `hsla(${hue}, 60%, 50%, 0.2)`;
          ctx.lineWidth = 1; ctx.stroke();
        }
      }
    }
    ctx.shadowBlur = 0;
  },

  hslToRgb(h, s, l) {
    h=((h%1)+1)%1;
    let r,g,b;
    if(s===0){r=g=b=l;}else{
      const q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q;
      const f=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;};
      r=f(p,q,h+1/3);g=f(p,q,h);b=f(p,q,h-1/3);
    }
    return[Math.round(r*255),Math.round(g*255),Math.round(b*255)];
  }
};

if(typeof module!=='undefined'&&module.exports){module.exports=WavesAlgo;}
else{window.WavesAlgo=WavesAlgo;}
