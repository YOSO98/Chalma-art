/* ══════════════════════════════════════════════════════════════
   CHALMA ART — Organic Growth
   Family 7, seeds 35001–40000
   ══════════════════════════════════════════════════════════════ */
'use strict';

const OrganicAlgo = {

  render(ctx, W, H, artwork, t) {
    const { algorithm, params, palette } = artwork;
    switch (algorithm) {
      case 'dla':             this.dla(ctx, W, H, params, palette, t); break;
      case 'physarum':        this.physarum(ctx, W, H, params, palette, t); break;
      case 'bacterial_colony':this.bacterial(ctx, W, H, params, palette, t); break;
      case 'phyllotaxis':     this.phyllotaxis(ctx, W, H, params, palette, t); break;
      case 'shell_growth':    this.shellGrowth(ctx, W, H, params, palette, t); break;
      case 'lightning':       this.lightning(ctx, W, H, params, palette, t); break;
      case 'river_network':   this.riverNetwork(ctx, W, H, params, palette, t); break;
      case 'eden_growth':     this.edenGrowth(ctx, W, H, params, palette, t); break;
      case 'dbm':             this.dbm(ctx, W, H, params, palette, t); break;
      default:                this.dla(ctx, W, H, params, palette, t);
    }
  },

  /* ── DLA — Diffusion Limited Aggregation ── */
  dla(ctx, W, H, params, palette, t) {
    const hue = palette.h1;

    if (!this._dla) {
      const maxPts = 8000;
      this._dla = {
        cluster: [{ x: W/2, y: H/2, gen: 0 }],
        canvas: document.createElement('canvas'),
        done: false
      };
      this._dla.canvas.width = W;
      this._dla.canvas.height = H;
      const tmpCtx = this._dla.canvas.getContext('2d');
      tmpCtx.fillStyle = '#03030a';
      tmpCtx.fillRect(0, 0, W, H);
    }

    const { cluster, canvas } = this._dla;
    const tmpCtx = canvas.getContext('2d');

    if (cluster.length < 8000) {
      const addPerFrame = 30;
      for (let a = 0; a < addPerFrame; a++) {
        // Random walker
        const angle = Math.random() * Math.PI * 2;
        const r0 = Math.min(W, H) * 0.45;
        let wx = W/2 + Math.cos(angle) * r0;
        let wy = H/2 + Math.sin(angle) * r0;
        let stuck = false;

        for (let step = 0; step < 5000; step++) {
          wx += (Math.random() - 0.5) * 4;
          wy += (Math.random() - 0.5) * 4;
          wx = Math.max(0, Math.min(W, wx));
          wy = Math.max(0, Math.min(H, wy));

          for (const pt of cluster) {
            const dx = wx - pt.x, dy = wy - pt.y;
            if (dx*dx + dy*dy < 9) {
              const gen = pt.gen + 1;
              cluster.push({ x: wx, y: wy, gen });
              const bright = Math.max(20, 65 - gen * 0.5);
              tmpCtx.fillStyle = `hsl(${hue + gen * 0.3}, 85%, ${bright}%)`;
              tmpCtx.beginPath();
              tmpCtx.arc(wx, wy, 1.5, 0, Math.PI * 2);
              tmpCtx.fill();
              stuck = true;
              break;
            }
          }
          if (stuck) break;
        }
      }
    }
    ctx.drawImage(canvas, 0, 0);
  },

  /* ── Physarum Polycephalum (slime mold) ── */
  physarum(ctx, W, H, params, palette, t) {
    const N = 96;
    const nAgents = params.particles || 2000;
    const hue = palette.h1;

    if (!this._phy) {
      const trail = new Float32Array(N * N);
      const agents = Array.from({ length: nAgents }, () => ({
        x: (0.3 + Math.random() * 0.4) * N,
        y: (0.3 + Math.random() * 0.4) * N,
        angle: Math.random() * Math.PI * 2
      }));
      this._phy = { N, trail, agents };
    }

    const { trail, agents } = this._phy;
    const SA = 22.5 * Math.PI / 180; // sensor angle
    const SO = 9; // sensor offset
    const RA = 45 * Math.PI / 180; // rotation angle
    const depT = 5, decayT = 0.95;

    // Agents sense and move
    for (const ag of agents) {
      const sense = (angle) => {
        const sx = ag.x + Math.cos(angle) * SO;
        const sy = ag.y + Math.sin(angle) * SO;
        const ix = Math.floor(((sx % N) + N) % N);
        const iy = Math.floor(((sy % N) + N) % N);
        return trail[ix + iy * N];
      };
      const F = sense(ag.angle);
      const FL = sense(ag.angle - SA);
      const FR = sense(ag.angle + SA);

      if (F > FL && F > FR) {
        // Continue
      } else if (F < FL && F < FR) {
        ag.angle += (Math.random() < 0.5 ? 1 : -1) * RA;
      } else if (FR > FL) {
        ag.angle += RA;
      } else if (FL > FR) {
        ag.angle -= RA;
      }

      ag.x = (ag.x + Math.cos(ag.angle) + N) % N;
      ag.y = (ag.y + Math.sin(ag.angle) + N) % N;
      const ix = Math.floor(ag.x), iy = Math.floor(ag.y);
      trail[ix + iy * N] = Math.min(1, trail[ix + iy * N] + depT * 0.1);
    }

    // Diffuse & decay trail
    const newTrail = new Float32Array(N * N);
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const i = x + y * N;
        const l = ((x-1+N)%N) + y*N;
        const r = ((x+1)%N) + y*N;
        const u = x + ((y-1+N)%N)*N;
        const d = x + ((y+1)%N)*N;
        newTrail[i] = (trail[i]*4 + trail[l] + trail[r] + trail[u] + trail[d]) / 8 * decayT;
      }
    }
    trail.set(newTrail);

    // Render
    const imgData = ctx.createImageData(N, N);
    const data = imgData.data;
    for (let i = 0; i < N * N; i++) {
      const v = Math.min(1, trail[i]);
      const [rr, g, b] = this.hslToRgb((hue/360 + v*0.3)%1, 0.9, v*0.7);
      data[i*4]=rr; data[i*4+1]=g; data[i*4+2]=b; data[i*4+3]=255;
    }
    const tmp = document.createElement('canvas');
    tmp.width = N; tmp.height = N;
    tmp.getContext('2d').putImageData(imgData, 0, 0);
    ctx.drawImage(tmp, 0, 0, W, H);
  },

  /* ── Bacterial colony ── */
  bacterial(ctx, W, H, params, palette, t) {
    const hue = palette.h1;
    if (!this._bact) {
      this._bact = {
        canvas: document.createElement('canvas'),
        cells: [{ x: W/2, y: H/2, age: 0 }],
        gen: 0
      };
      this._bact.canvas.width = W; this._bact.canvas.height = H;
      const tmpCtx = this._bact.canvas.getContext('2d');
      tmpCtx.fillStyle = '#03030a';
      tmpCtx.fillRect(0, 0, W, H);
    }

    const { canvas, cells } = this._bact;
    const tmpCtx = canvas.getContext('2d');
    const growthRate = params.growthRate || 0.03;
    const maxCells = 3000;

    if (cells.length < maxCells) {
      const toAdd = [];
      for (const cell of cells) {
        if (Math.random() < growthRate && cells.length + toAdd.length < maxCells) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 2 + Math.random() * 3;
          toAdd.push({ x: cell.x + Math.cos(angle)*dist, y: cell.y + Math.sin(angle)*dist, age: cell.age+1 });
        }
      }
      for (const c of toAdd) {
        cells.push(c);
        const bright = 30 + c.age * 0.1;
        tmpCtx.fillStyle = `hsl(${hue + c.age * 0.5}, 80%, ${Math.min(65, bright)}%)`;
        tmpCtx.beginPath();
        tmpCtx.arc(c.x, c.y, 1.5 + Math.random(), 0, Math.PI * 2);
        tmpCtx.fill();
      }
    }
    ctx.drawImage(canvas, 0, 0);
  },

  /* ── Phyllotaxis (sunflower spiral) ── */
  phyllotaxis(ctx, W, H, params, palette, t) {
    ctx.fillStyle = 'rgba(3,3,10,0.15)';
    ctx.fillRect(0, 0, W, H);

    const phi = (1 + Math.sqrt(5)) / 2;
    const n = 1200;
    const hue = palette.h1;
    const cx = W/2, cy = H/2;
    const scale = Math.min(W, H) * 0.45;
    const rot = t * 0.05;

    for (let i = 0; i < n; i++) {
      const angle = i * phi * Math.PI * 2 + rot;
      const r = Math.sqrt(i / n) * scale;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      const size = Math.max(0.5, 4 * (1 - i/n) + 1);
      const bright = 40 + (i/n) * 30;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${hue + i*0.05}, 85%, ${bright}%)`;
      ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
      ctx.shadowBlur = size;
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  },

  /* ── Shell growth (logarithmic spiral) ── */
  shellGrowth(ctx, W, H, params, palette, t) {
    ctx.fillStyle = 'rgba(3,3,10,0.18)';
    ctx.fillRect(0, 0, W, H);

    const hue = palette.h1;
    const cx = W/2, cy = H/2;
    const b = 0.2;
    const maxR = Math.min(W, H) * 0.42;

    // Main spiral
    ctx.beginPath();
    let started = false;
    for (let deg = 0; deg < 1440; deg++) {
      const theta = deg * Math.PI / 180;
      const r = Math.exp(b * theta) * 3;
      if (r > maxR) break;
      const x = cx + r * Math.cos(theta + t * 0.1);
      const y = cy + r * Math.sin(theta + t * 0.1);
      if (!started) { ctx.moveTo(x, y); started = true; }
      else ctx.lineTo(x, y);
    }
    const grad = ctx.createLinearGradient(cx-maxR, cy-maxR, cx+maxR, cy+maxR);
    grad.addColorStop(0, `hsl(${hue}, 90%, 30%)`);
    grad.addColorStop(1, `hsl(${(hue+60)%360}, 90%, 65%)`);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.shadowColor = `hsl(${hue}, 100%, 65%)`;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Radial lines (shell ribs)
    for (let i = 0; i < 36; i++) {
      const theta = (i / 36) * Math.PI * 2 + t * 0.05;
      const r = Math.exp(b * theta) * 3;
      if (r < maxR) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + r * Math.cos(theta + t * 0.1), cy + r * Math.sin(theta + t * 0.1));
        ctx.strokeStyle = `hsla(${hue + i*5}, 70%, 45%, 0.2)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  },

  /* ── Lightning (DBM-based) ── */
  lightning(ctx, W, H, params, palette, t) {
    const hue = palette.h1;

    if (!this._lightning || Math.floor(t * 0.2) !== this._lightning.frame) {
      const bolt = this._generateBolt(W/2, 0, W/2, H, 8, W*0.15);
      this._lightning = { bolt, frame: Math.floor(t * 0.2) };
    }

    ctx.fillStyle = 'rgba(3,3,10,0.3)';
    ctx.fillRect(0, 0, W, H);

    const { bolt } = this._lightning;
    const age = (t * 5) % 2;
    const alpha = age < 1 ? age : 2 - age;

    ctx.beginPath();
    ctx.moveTo(bolt[0].x, bolt[0].y);
    for (const pt of bolt) ctx.lineTo(pt.x, pt.y);
    ctx.strokeStyle = `hsla(${hue}, 20%, 95%, ${alpha * 0.9})`;
    ctx.lineWidth = 3;
    ctx.shadowColor = `hsl(${hue}, 100%, 80%)`;
    ctx.shadowBlur = 20;
    ctx.stroke();

    ctx.strokeStyle = `hsla(${hue}, 90%, 70%, ${alpha * 0.6})`;
    ctx.lineWidth = 8;
    ctx.shadowBlur = 40;
    ctx.stroke();
    ctx.shadowBlur = 0;
  },

  _generateBolt(x1, y1, x2, y2, depth, offset) {
    if (depth === 0 || offset < 2) return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
    const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * offset;
    const my = (y1 + y2) / 2 + (Math.random() - 0.5) * offset * 0.3;
    return [
      ...this._generateBolt(x1, y1, mx, my, depth-1, offset/1.8),
      ...this._generateBolt(mx, my, x2, y2, depth-1, offset/1.8)
    ];
  },

  /* ── River network (erosion-like) ── */
  riverNetwork(ctx, W, H, params, palette, t) {
    const hue = palette.h1;
    if (!this._river) {
      const N = 80;
      const height = new Float32Array(N * N);
      // Generate terrain
      for (let y = 0; y < N; y++)
        for (let x = 0; x < N; x++) {
          height[x+y*N] = Math.random() + (y/N)*2;
          for (let oct = 1; oct <= 4; oct++) {
            height[x+y*N] += Math.sin(x*oct*0.3)*Math.cos(y*oct*0.3) / (oct*2);
          }
        }
      this._river = { N, height, canvas: null };
      // Pre-render
      const tmp = document.createElement('canvas');
      tmp.width = N; tmp.height = N;
      const tctx = tmp.getContext('2d');
      const imgData = tctx.createImageData(N, N);
      const data = imgData.data;
      const maxH = Math.max(...height);
      const minH = Math.min(...height);
      for (let i = 0; i < N*N; i++) {
        const v = (height[i]-minH)/(maxH-minH);
        const [r,g,b] = this.hslToRgb((hue/360+v*0.4)%1,0.85,0.1+v*0.5);
        data[i*4]=r;data[i*4+1]=g;data[i*4+2]=b;data[i*4+3]=255;
      }
      tctx.putImageData(imgData, 0, 0);
      this._river.canvas = tmp;
    }
    ctx.drawImage(this._river.canvas, 0, 0, W, H);
  },

  /* ── Eden growth model ── */
  edenGrowth(ctx, W, H, params, palette, t) {
    const hue = palette.h1;
    if (!this._eden) {
      const N = 120;
      const grid = new Uint8Array(N*N);
      const cx=Math.floor(N/2), cy=Math.floor(N/2);
      grid[cx+cy*N]=1;
      const boundary=[[cx,cy]];
      this._eden={N,grid,boundary,canvas:document.createElement('canvas'),step:0};
      this._eden.canvas.width=N;this._eden.canvas.height=N;
      const tctx=this._eden.canvas.getContext('2d');
      tctx.fillStyle='#03030a';tctx.fillRect(0,0,N,N);
    }
    const {N,grid,boundary,canvas}=this._eden;
    const tctx=canvas.getContext('2d');
    const dirs=[[0,-1],[1,0],[0,1],[-1,0]];
    const maxGrow=100;

    for(let g=0;g<maxGrow&&boundary.length>0;g++){
      const bi=Math.floor(Math.random()*boundary.length);
      const [bx,by]=boundary[bi];
      const [dx,dy]=dirs[Math.floor(Math.random()*4)];
      const nx=(bx+dx+N)%N, ny=(by+dy+N)%N;
      if(!grid[nx+ny*N]){
        grid[nx+ny*N]=1;
        const dist=Math.sqrt((nx-N/2)**2+(ny-N/2)**2);
        const bright=25+dist/(N*0.5)*40;
        tctx.fillStyle=`hsl(${hue+dist},85%,${bright}%)`;
        tctx.fillRect(nx,ny,1,1);
        boundary.push([nx,ny]);
      }
    }
    ctx.drawImage(canvas,0,0,W,H);
  },

  /* ── DBM (Dielectric Breakdown Model) ── */
  dbm(ctx, W, H, params, palette, t) {
    const hue = palette.h1;
    if (!this._dbm) {
      const branches = [this._generateBolt(W/2, 0, W/2+50, H*0.6, 7, W*0.12)];
      branches.push(this._generateBolt(W/2, 0, W/2-60, H*0.7, 7, W*0.1));
      branches.push(this._generateBolt(W/2, 0, W/2+20, H*0.9, 7, W*0.14));
      this._dbm = { branches };
    }
    ctx.fillStyle = 'rgba(3,3,10,0.3)';
    ctx.fillRect(0, 0, W, H);

    const alpha = 0.7 + Math.sin(t * 3) * 0.15;
    for (let i = 0; i < this._dbm.branches.length; i++) {
      const b = this._dbm.branches[i];
      ctx.beginPath();
      ctx.moveTo(b[0].x, b[0].y);
      for (const pt of b) ctx.lineTo(pt.x, pt.y);
      ctx.strokeStyle = `hsla(${hue + i*30}, 90%, 70%, ${alpha})`;
      ctx.lineWidth = 2 - i * 0.3;
      ctx.shadowColor = `hsl(${hue+i*30}, 100%, 80%)`;
      ctx.shadowBlur = 15;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  },

  hslToRgb(h,s,l){
    h=((h%1)+1)%1;let r,g,b;
    if(s===0){r=g=b=l;}else{
      const q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q;
      const f=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;};
      r=f(p,q,h+1/3);g=f(p,q,h);b=f(p,q,h-1/3);
    }
    return[Math.round(r*255),Math.round(g*255),Math.round(b*255)];
  }
};

if(typeof module!=='undefined'&&module.exports){module.exports=OrganicAlgo;}
else{window.OrganicAlgo=OrganicAlgo;}
