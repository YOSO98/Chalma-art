/* ══════════════════════════════════════════════════════════════
   CHALMA ART — Cellular Automata
   Family 3, seeds 15001–20000
   ══════════════════════════════════════════════════════════════ */
'use strict';

const CellularAlgo = {

  render(ctx, W, H, artwork, t) {
    const { algorithm, params, palette } = artwork;
    switch (algorithm) {
      case 'conway':              this.conway(ctx, W, H, params, palette, t); break;
      case 'wolfram1d':           this.wolfram1d(ctx, W, H, params, palette, t); break;
      case 'langton_ant':         this.langtonAnt(ctx, W, H, params, palette, t); break;
      case 'brians_brain':        this.briansBrain(ctx, W, H, params, palette, t); break;
      case 'lenia':               this.lenia(ctx, W, H, params, palette, t); break;
      case 'smoothlife':          this.smoothLife(ctx, W, H, params, palette, t); break;
      case 'generations':         this.generations(ctx, W, H, params, palette, t); break;
      case 'vote':                this.vote(ctx, W, H, params, palette, t); break;
      default:                    this.conway(ctx, W, H, params, palette, t);
    }
  },

  _initGrid(W, H, cellSize, density) {
    const cols = Math.floor(W / cellSize);
    const rows = Math.floor(H / cellSize);
    const grid = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => Math.random() < density ? 1 : 0)
    );
    return { grid, cols, rows };
  },

  /* ── Conway's Game of Life ── */
  conway(ctx, W, H, params, palette, t) {
    const cs = params.cellSize || 6;
    const hue = palette.h1;

    if (!this._conway) {
      const { grid, cols, rows } = this._initGrid(W, H, cs, params.density || 0.35);
      this._conway = { grid, cols, rows, gen: 0 };
    }
    const { grid, cols, rows } = this._conway;

    ctx.fillStyle = `hsl(${hue},20%,5%)`;
    ctx.fillRect(0, 0, W, H);

    const next = Array.from({ length: rows }, (_, y) =>
      Array.from({ length: cols }, (_, x) => {
        let alive = 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            alive += grid[(y + dy + rows) % rows][(x + dx + cols) % cols];
          }
        const c = grid[y][x];
        return (c && (alive === 2 || alive === 3)) || (!c && alive === 3) ? 1 : 0;
      })
    );

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (grid[y][x]) {
          const alive = next[y][x];
          ctx.fillStyle = alive
            ? `hsl(${hue}, 90%, 65%)`
            : `hsl(${(hue+60)%360}, 80%, 40%)`;
          ctx.fillRect(x * cs, y * cs, cs - 1, cs - 1);
        }
      }
    }
    this._conway.grid = next;
    this._conway.gen++;
  },

  /* ── Wolfram 1D CA ── */
  wolfram1d(ctx, W, H, params, palette, t) {
    const rule = params.rule || 110;
    const cs = params.cellSize || 4;
    const cols = Math.floor(W / cs);
    const rows = Math.floor(H / cs);
    const hue = palette.h1;

    if (!this._wolfram || this._wolfram.rule !== rule) {
      let row = new Uint8Array(cols);
      row[Math.floor(cols / 2)] = 1;
      const ruleset = Array.from({ length: 8 }, (_, i) => (rule >> i) & 1);
      const history = [row.slice()];
      for (let r = 1; r < rows; r++) {
        const next = new Uint8Array(cols);
        for (let c = 0; c < cols; c++) {
          const l = row[(c - 1 + cols) % cols];
          const m = row[c];
          const ri = row[(c + 1) % cols];
          next[c] = ruleset[l * 4 + m * 2 + ri];
        }
        row = next;
        history.push(row.slice());
      }
      this._wolfram = { rule, history, rows, cols };
    }

    ctx.fillStyle = `hsl(${hue},20%,4%)`;
    ctx.fillRect(0, 0, W, H);

    const { history } = this._wolfram;
    const offset = Math.floor(t * 2) % Math.max(1, history.length);
    for (let r = 0; r < rows; r++) {
      const row = history[(r + offset) % history.length];
      for (let c = 0; c < cols; c++) {
        if (row[c]) {
          const bright = 40 + (r / rows) * 30;
          ctx.fillStyle = `hsl(${hue + r * 0.3}, 85%, ${bright}%)`;
          ctx.fillRect(c * cs, r * cs, cs, cs);
        }
      }
    }
  },

  /* ── Langton's Ant ── */
  langtonAnt(ctx, W, H, params, palette, t) {
    const cs = params.cellSize || 4;
    const hue = palette.h1;

    if (!this._langton) {
      const cols = Math.floor(W / cs);
      const rows = Math.floor(H / cs);
      this._langton = {
        grid: new Uint8Array(cols * rows),
        x: Math.floor(cols / 2), y: Math.floor(rows / 2),
        dir: 0, cols, rows, step: 0
      };
    }

    const { grid, cols, rows } = this._langton;
    const stepsPerFrame = 200;

    for (let s = 0; s < stepsPerFrame; s++) {
      const { x, y } = this._langton;
      const idx = y * cols + x;
      if (grid[idx] === 0) {
        this._langton.dir = (this._langton.dir + 1) % 4;
        grid[idx] = 1;
      } else {
        this._langton.dir = (this._langton.dir + 3) % 4;
        grid[idx] = 0;
      }
      const dirs = [[0,-1],[1,0],[0,1],[-1,0]];
      const [dx, dy] = dirs[this._langton.dir];
      this._langton.x = (x + dx + cols) % cols;
      this._langton.y = (y + dy + rows) % rows;
      this._langton.step++;
    }

    ctx.fillStyle = `hsl(${hue},20%,4%)`;
    ctx.fillRect(0, 0, W, H);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (grid[y * cols + x]) {
          ctx.fillStyle = `hsl(${hue + x * 0.1}, 85%, 60%)`;
          ctx.fillRect(x * cs, y * cs, cs - 1, cs - 1);
        }
      }
    }

    // Ant head
    ctx.fillStyle = `hsl(${(hue+180)%360}, 100%, 80%)`;
    ctx.fillRect(this._langton.x * cs, this._langton.y * cs, cs, cs);
  },

  /* ── Brian's Brain ── */
  briansBrain(ctx, W, H, params, palette, t) {
    const cs = params.cellSize || 5;
    const hue = palette.h1;

    if (!this._brain) {
      const cols = Math.floor(W / cs);
      const rows = Math.floor(H / cs);
      // 0=dead, 1=alive, 2=dying
      const grid = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => Math.random() < 0.3 ? 1 : 0)
      );
      this._brain = { grid, cols, rows };
    }

    const { grid, cols, rows } = this._brain;
    ctx.fillStyle = `hsl(${hue},20%,3%)`;
    ctx.fillRect(0, 0, W, H);

    const next = Array.from({ length: rows }, (_, y) =>
      Array.from({ length: cols }, (_, x) => {
        const c = grid[y][x];
        if (c === 1) return 2;
        if (c === 2) return 0;
        let alive = 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            if (grid[(y+dy+rows)%rows][(x+dx+cols)%cols] === 1) alive++;
          }
        return alive === 2 ? 1 : 0;
      })
    );

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const c = grid[y][x];
        if (c === 1) ctx.fillStyle = `hsl(${hue}, 100%, 75%)`;
        else if (c === 2) ctx.fillStyle = `hsl(${(hue+120)%360}, 80%, 35%)`;
        else continue;
        ctx.fillRect(x * cs, y * cs, cs - 1, cs - 1);
      }
    }
    this._brain.grid = next;
  },

  /* ── Lenia (continuous life-like CA) ── */
  lenia(ctx, W, H, params, palette, t) {
    const res = 96;
    const hue = palette.h1;

    if (!this._lenia) {
      this._lenia = {
        grid: Array.from({ length: res }, () =>
          Array.from({ length: res }, () => Math.random() < 0.4 ? Math.random() : 0)
        )
      };
    }

    const { grid } = this._lenia;
    const R = 8, dt = 0.1;
    const mu = 0.15, sigma = 0.016;
    const growth = v => 2 * Math.exp(-((v - mu) ** 2) / (2 * sigma * sigma)) - 1;

    const next = Array.from({ length: res }, (_, y) =>
      Array.from({ length: res }, (_, x) => {
        let sum = 0, cnt = 0;
        for (let dy = -R; dy <= R; dy++)
          for (let dx = -R; dx <= R; dx++) {
            const d = Math.sqrt(dx*dx+dy*dy);
            if (d > R) continue;
            sum += grid[(y+dy+res)%res][(x+dx+res)%res];
            cnt++;
          }
        const avg = cnt > 0 ? sum / cnt : 0;
        return Math.max(0, Math.min(1, grid[y][x] + dt * growth(avg)));
      })
    );

    const cellW = W / res, cellH = H / res;
    for (let y = 0; y < res; y++) {
      for (let x = 0; x < res; x++) {
        const v = next[y][x];
        if (v > 0.01) {
          const [r, g, b] = this.hslToRgb((hue / 360 + v * 0.3) % 1, 0.9, v * 0.7);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x * cellW, y * cellH, cellW + 0.5, cellH + 0.5);
        }
      }
    }
    this._lenia.grid = next;
  },

  /* ── SmoothLife ── */
  smoothLife(ctx, W, H, params, palette, t) {
    const res = 80;
    const hue = palette.h1;

    if (!this._smooth) {
      this._smooth = {
        grid: Array.from({ length: res }, () =>
          Array.from({ length: res }, () => Math.random() < 0.45 ? Math.random() : 0)
        )
      };
    }

    const { grid } = this._smooth;
    const ri = 3, ro = 9;
    const b1=0.278,b2=0.365,d1=0.267,d2=0.445;
    const dt = 0.5;

    const lerp = (a, b, t2) => a + (b - a) * t2;
    const sigma1 = (x, a) => 1 / (1 + Math.exp(-4 * (x - a) / 0.028));
    const sigma2 = (x, a, b) => sigma1(x, a) * (1 - sigma1(x, b));
    const sigmaN = (x, y, m) => x * (1 - sigma1(m, 0.5)) + y * sigma1(m, 0.5);
    const f = (n, m) => sigma2(n, sigmaN(b1, d1, m), sigmaN(b2, d2, m));

    const next = Array.from({ length: res }, (_, y) =>
      Array.from({ length: res }, (_, x) => {
        let inner = 0, outer = 0, ic = 0, oc = 0;
        for (let dy = -ro; dy <= ro; dy++)
          for (let dx = -ro; dx <= ro; dx++) {
            const d = Math.sqrt(dx*dx+dy*dy);
            const v = grid[(y+dy+res)%res][(x+dx+res)%res];
            if (d <= ri) { inner += v; ic++; }
            else if (d <= ro) { outer += v; oc++; }
          }
        const m = ic > 0 ? inner / ic : 0;
        const n = oc > 0 ? outer / oc : 0;
        return Math.max(0, Math.min(1, grid[y][x] + dt * (2 * f(n, m) - 1)));
      })
    );

    const cw = W/res, ch = H/res;
    ctx.fillStyle = '#03030a';
    ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < res; y++)
      for (let x = 0; x < res; x++) {
        const v = next[y][x];
        if (v > 0.05) {
          const [r, g, b] = this.hslToRgb((hue/360+v*0.4)%1, 0.9, v*0.65);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x*cw, y*ch, cw+0.5, ch+0.5);
        }
      }
    this._smooth.grid = next;
  },

  /* ── Generations CA ── */
  generations(ctx, W, H, params, palette, t) {
    const cs = params.cellSize || 5;
    const hue = palette.h1;
    const maxState = 4;

    if (!this._gen) {
      const cols = Math.floor(W / cs), rows = Math.floor(H / cs);
      this._gen = {
        grid: Array.from({ length: rows }, () =>
          Array.from({ length: cols }, () => Math.random() < 0.3 ? 1 : 0)
        ),
        cols, rows
      };
    }

    const { grid, cols, rows } = this._gen;
    ctx.fillStyle = '#03030a';
    ctx.fillRect(0, 0, W, H);

    const next = Array.from({ length: rows }, (_, y) =>
      Array.from({ length: cols }, (_, x) => {
        const c = grid[y][x];
        if (c > 1) return c - 1;
        let alive = 0;
        for (let dy=-1;dy<=1;dy++)
          for (let dx=-1;dx<=1;dx++) {
            if (dx===0&&dy===0) continue;
            if (grid[(y+dy+rows)%rows][(x+dx+cols)%cols]===1) alive++;
          }
        return (c===0 && (alive===3||alive===6)) ? 1 : c===1 ? maxState : 0;
      })
    );

    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        const c = grid[y][x];
        if (c > 0) {
          const bright = 20 + (c / maxState) * 55;
          ctx.fillStyle = `hsl(${hue + c * 15}, 85%, ${bright}%)`;
          ctx.fillRect(x*cs, y*cs, cs-1, cs-1);
        }
      }
    this._gen.grid = next;
  },

  /* ── Vote CA ── */
  vote(ctx, W, H, params, palette, t) {
    const cs = params.cellSize || 4;
    const hue = palette.h1;
    const threshold = 4;

    if (!this._vote) {
      const cols = Math.floor(W / cs), rows = Math.floor(H / cs);
      this._vote = {
        grid: Array.from({ length: rows }, () =>
          Array.from({ length: cols }, () => Math.random() < 0.5 ? 1 : 0)
        ),
        cols, rows
      };
    }

    const { grid, cols, rows } = this._vote;
    ctx.fillStyle = '#03030a';
    ctx.fillRect(0, 0, W, H);

    const next = Array.from({ length: rows }, (_, y) =>
      Array.from({ length: cols }, (_, x) => {
        let sum = 0;
        for (let dy=-1;dy<=1;dy++)
          for (let dx=-1;dx<=1;dx++)
            sum += grid[(y+dy+rows)%rows][(x+dx+cols)%cols];
        return sum >= threshold ? 1 : 0;
      })
    );

    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        if (grid[y][x]) {
          ctx.fillStyle = `hsl(${hue + x * 0.05}, 80%, 55%)`;
          ctx.fillRect(x*cs, y*cs, cs-1, cs-1);
        }
      }
    this._vote.grid = next;
  },

  hslToRgb(h, s, l) {
    h=((h%1)+1)%1;
    let r,g,b;
    if(s===0){r=g=b=l;}
    else{
      const q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q;
      const hue2rgb=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;};
      r=hue2rgb(p,q,h+1/3);g=hue2rgb(p,q,h);b=hue2rgb(p,q,h-1/3);
    }
    return[Math.round(r*255),Math.round(g*255),Math.round(b*255)];
  }
};

if(typeof module!=='undefined'&&module.exports){module.exports=CellularAlgo;}
else{window.CellularAlgo=CellularAlgo;}
