/* ══════════════════════════════════════════════════════════════
   CHALMA ART — Neural Networks Visualized
   Family 9, seeds 45001–50000
   ══════════════════════════════════════════════════════════════ */
'use strict';

const NeuralAlgo = {

  render(ctx, W, H, artwork, t) {
    const { algorithm, params, palette } = artwork;
    switch (algorithm) {
      case 'perceptron':       this.perceptron(ctx, W, H, params, palette, t); break;
      case 'som_kohonen':      this.somKohonen(ctx, W, H, params, palette, t); break;
      case 'hopfield':         this.hopfield(ctx, W, H, params, palette, t); break;
      case 'convnet_features': this.convnetFeatures(ctx, W, H, params, palette, t); break;
      case 'growing_neural_gas':this.growingNeuralGas(ctx, W, H, params, palette, t); break;
      case 'boltzmann':        this.boltzmann(ctx, W, H, params, palette, t); break;
      case 'cellular_nn':      this.cellularNN(ctx, W, H, params, palette, t); break;
      case 'reservoir':        this.reservoir(ctx, W, H, params, palette, t); break;
      default:                 this.perceptron(ctx, W, H, params, palette, t);
    }
  },

  /* ── Perceptron (animated forward pass) ── */
  perceptron(ctx, W, H, params, palette, t) {
    ctx.fillStyle = '#03030a';
    ctx.fillRect(0, 0, W, H);

    const { layers = 4, neuronsPerLayer = 8 } = params;
    const hue = palette.h1;

    const layerCount = Math.min(layers, 6);
    const nPerLayer = Math.min(neuronsPerLayer, 14);

    const lx = (i) => (W * 0.1) + i * (W * 0.8) / (layerCount - 1);
    const ny = (j, total) => (H * 0.15) + j * (H * 0.7) / (total - 1);

    // Compute activations
    if (!this._percAct || Math.floor(t * 0.5) !== this._percFrame) {
      const act = Array.from({ length: layerCount }, (_, li) =>
        Array.from({ length: nPerLayer }, () => Math.random())
      );
      // Forward pass (simplified)
      for (let li = 1; li < layerCount; li++) {
        for (let ni = 0; ni < nPerLayer; ni++) {
          let sum = 0;
          for (let pi = 0; pi < nPerLayer; pi++) {
            sum += act[li-1][pi] * (Math.random() * 2 - 1);
          }
          act[li][ni] = 1 / (1 + Math.exp(-sum)); // sigmoid
        }
      }
      this._percAct = act;
      this._percFrame = Math.floor(t * 0.5);
    }

    const act = this._percAct;

    // Draw connections
    for (let li = 0; li < layerCount - 1; li++) {
      for (let ni = 0; ni < nPerLayer; ni++) {
        for (let nj = 0; nj < nPerLayer; nj++) {
          const x1 = lx(li), y1 = ny(ni, nPerLayer);
          const x2 = lx(li+1), y2 = ny(nj, nPerLayer);
          const w = act[li][ni] * act[li+1][nj];
          if (w < 0.1) continue;

          // Animated signal propagation
          const progress = (t * params.activationSpeed || t) % 1;
          const signalX = x1 + (x2 - x1) * progress;
          const signalY = y1 + (y2 - y1) * progress;

          ctx.beginPath();
          ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
          ctx.strokeStyle = `hsla(${hue}, 60%, 40%, ${w * 0.2})`;
          ctx.lineWidth = w;
          ctx.stroke();

          // Signal dot
          if (w > 0.5) {
            ctx.beginPath();
            ctx.arc(signalX, signalY, 2, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${hue + w * 60}, 90%, 70%, ${w * 0.6})`;
            ctx.fill();
          }
        }
      }
    }

    // Draw neurons
    for (let li = 0; li < layerCount; li++) {
      for (let ni = 0; ni < nPerLayer; ni++) {
        const x = lx(li), y = ny(ni, nPerLayer);
        const activation = act[li][ni];
        const r = 4 + activation * 6;

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${hue + activation * 60}, 90%, ${20 + activation * 50}%)`;
        ctx.shadowColor = `hsl(${hue + activation * 60}, 100%, 70%)`;
        ctx.shadowBlur = activation * 15;
        ctx.fill();
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.5)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    ctx.shadowBlur = 0;
  },

  /* ── Self-Organizing Map (Kohonen) ── */
  somKohonen(ctx, W, H, params, palette, t) {
    ctx.fillStyle = '#03030a';
    ctx.fillRect(0, 0, W, H);

    const N = 16; // grid size
    const hue = palette.h1;

    if (!this._som) {
      // Initialize SOM weights (2D → 3D color space)
      const weights = Array.from({ length: N }, (_, y) =>
        Array.from({ length: N }, (_, x) => [
          x / N, y / N, Math.random()
        ])
      );
      this._som = { weights, iter: 0 };
    }

    const { weights } = this._som;

    // Training step (visualized)
    const lr = 0.1 * Math.exp(-this._som.iter * 0.001);
    const sigma = N * 0.5 * Math.exp(-this._som.iter * 0.002);
    const input = [
      0.5 + Math.sin(t * 0.3) * 0.4,
      0.5 + Math.cos(t * 0.5) * 0.4,
      0.5 + Math.sin(t * 0.7) * 0.4
    ];

    // Find BMU
    let bestDist = Infinity, bx = 0, by = 0;
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const w = weights[y][x];
        const d = (w[0]-input[0])**2 + (w[1]-input[1])**2 + (w[2]-input[2])**2;
        if (d < bestDist) { bestDist = d; bx = x; by = y; }
      }
    }

    // Update weights
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const dist = Math.sqrt((x-bx)**2 + (y-by)**2);
        const influence = Math.exp(-dist**2 / (2 * sigma**2));
        const w = weights[y][x];
        for (let k = 0; k < 3; k++) {
          w[k] += lr * influence * (input[k] - w[k]);
          w[k] = Math.max(0, Math.min(1, w[k]));
        }
      }
    }
    this._som.iter++;

    // Render SOM grid
    const cw = W / N, ch = H / N;
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const w = weights[y][x];
        const r = Math.floor(w[0] * 255);
        const g = Math.floor(w[1] * 255);
        const b = Math.floor(w[2] * 255);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x * cw, y * ch, cw + 0.5, ch + 0.5);
      }
    }

    // Highlight BMU
    ctx.beginPath();
    ctx.rect(bx * cw, by * ch, cw, ch);
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
  },

  /* ── Hopfield network ── */
  hopfield(ctx, W, H, params, palette, t) {
    const N = 16;
    const hue = palette.h1;

    if (!this._hopfield) {
      // Store 3 patterns
      const patterns = Array.from({ length: 3 }, () =>
        Array.from({ length: N * N }, () => Math.random() < 0.5 ? 1 : -1)
      );
      // Compute weights
      const W2 = new Float32Array(N * N * N * N);
      for (const p of patterns) {
        for (let i = 0; i < N*N; i++) {
          for (let j = 0; j < N*N; j++) {
            if (i !== j) W2[i * N*N + j] += p[i] * p[j] / (N*N);
          }
        }
      }
      const state = patterns[0].map(v => v + (Math.random()-0.5)*0.5);
      this._hopfield = { N, W: W2, state, patterns, iter: 0 };
    }

    const { state, W: W2 } = this._hopfield;

    // Update a few neurons per frame
    for (let k = 0; k < 20; k++) {
      const i = Math.floor(Math.random() * N * N);
      let net = 0;
      for (let j = 0; j < N*N; j++) net += W2[i*N*N+j] * state[j];
      state[i] = Math.tanh(net * 2 + Math.sin(t * 0.1) * 0.1);
    }

    // Render
    const cw = W / N, ch = H / N;
    for (let i = 0; i < N * N; i++) {
      const x = i % N, y = Math.floor(i / N);
      const v = (state[i] + 1) / 2;
      const [r, g, b] = this.hslToRgb((hue/360 + v*0.3)%1, 0.9, 0.05+v*0.65);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x * cw, y * ch, cw + 0.5, ch + 0.5);
    }
  },

  /* ── ConvNet feature maps ── */
  convnetFeatures(ctx, W, H, params, palette, t) {
    ctx.fillStyle = '#03030a';
    ctx.fillRect(0, 0, W, H);

    const hue = palette.h1;
    const maps = 9; // number of feature maps
    const mapSize = Math.floor(Math.min(W, H) / (Math.sqrt(maps) + 0.5));
    const cols = Math.ceil(Math.sqrt(maps));

    for (let m = 0; m < maps; m++) {
      const mx = (m % cols) * (mapSize + 4) + 10;
      const my = Math.floor(m / cols) * (mapSize + 4) + 10;

      // Generate feature map (conv filter response visualization)
      const kernelAngle = (m / maps) * Math.PI * 2;
      const freq = 1 + m * 0.5;

      for (let py = 0; py < mapSize; py++) {
        for (let px = 0; px < mapSize; px++) {
          const nx = px / mapSize, ny = py / mapSize;
          // Gabor-like filter response
          const dx = nx - 0.5, dy = ny - 0.5;
          const r = Math.sqrt(dx*dx + dy*dy);
          const theta = Math.atan2(dy, dx);
          const response = Math.exp(-r*r * 8) *
            Math.cos(freq * Math.PI * (dx*Math.cos(kernelAngle) + dy*Math.sin(kernelAngle)) * 4 + t * (m+1) * 0.3);
          const v = (response + 1) / 2;
          const [rr, g, b] = this.hslToRgb((hue/360 + m*0.05 + v*0.2)%1, 0.9, 0.1+v*0.65);
          ctx.fillStyle = `rgb(${rr},${g},${b})`;
          ctx.fillRect(mx + px, my + py, 1, 1);
        }
      }

      // Border
      ctx.strokeStyle = `hsla(${hue + m*15}, 60%, 40%, 0.5)`;
      ctx.lineWidth = 1;
      ctx.strokeRect(mx, my, mapSize, mapSize);
    }
  },

  /* ── Growing Neural Gas ── */
  growingNeuralGas(ctx, W, H, params, palette, t) {
    ctx.fillStyle = 'rgba(3,3,10,0.15)';
    ctx.fillRect(0, 0, W, H);

    const hue = palette.h1;

    if (!this._gng) {
      this._gng = {
        nodes: Array.from({ length: 20 }, () => ({
          x: Math.random() * W, y: Math.random() * H,
          error: 0, age: 0
        })),
        edges: [],
        iter: 0
      };
    }

    const { nodes, edges } = this._gng;

    // GNG step
    const input = {
      x: W/2 + Math.cos(t * 0.7) * W * 0.35 + Math.cos(t * 1.3) * W * 0.1,
      y: H/2 + Math.sin(t * 0.5) * H * 0.35 + Math.sin(t * 1.1) * H * 0.1
    };

    // Find 2 nearest nodes
    const dists = nodes.map((n, i) => ({
      i, d: (n.x-input.x)**2 + (n.y-input.y)**2
    })).sort((a, b) => a.d - b.d);

    const [s1, s2] = [dists[0].i, dists[1].i];

    // Move winners
    const lr1 = 0.2, lr2 = 0.006;
    nodes[s1].x += lr1 * (input.x - nodes[s1].x);
    nodes[s1].y += lr1 * (input.y - nodes[s1].y);
    nodes[s1].error += dists[0].d;

    for (const n of nodes) {
      n.x += lr2 * (input.x - n.x);
      n.y += lr2 * (input.y - n.y);
    }

    this._gng.iter++;

    // Add node occasionally
    if (this._gng.iter % 50 === 0 && nodes.length < 80) {
      const maxErr = nodes.reduce((a, b) => a.error > b.error ? a : b);
      nodes.push({ x: maxErr.x + (Math.random()-0.5)*10, y: maxErr.y + (Math.random()-0.5)*10, error: 0, age: 0 });
      maxErr.error *= 0.5;
    }

    // Draw edges
    for (const [i, j] of edges) {
      if (i < nodes.length && j < nodes.length) {
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.strokeStyle = `hsla(${hue}, 60%, 50%, 0.3)`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    // Draw nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const isBMU = i === s1;
      ctx.beginPath();
      ctx.arc(n.x, n.y, isBMU ? 6 : 3, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${hue + (n.error/1000)*30}, 85%, ${isBMU?75:55}%)`;
      ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
      ctx.shadowBlur = isBMU ? 12 : 4;
      ctx.fill();
    }

    // Input point
    ctx.beginPath();
    ctx.arc(input.x, input.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${(hue+180)%360}, 100%, 80%)`;
    ctx.shadowColor = `hsl(${(hue+180)%360}, 100%, 70%)`;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  },

  /* ── Boltzmann machine ── */
  boltzmann(ctx, W, H, params, palette, t) {
    ctx.fillStyle = '#03030a';
    ctx.fillRect(0, 0, W, H);

    const N = 12;
    const hue = palette.h1;

    if (!this._boltz) {
      this._boltz = {
        visible: Array.from({length:N},()=>Math.random()<0.5?1:-1),
        hidden:  Array.from({length:N},()=>Math.random()<0.5?1:-1),
        W: Array.from({length:N},()=>Array.from({length:N},()=>(Math.random()-0.5)*0.5))
      };
    }

    const { visible: vis, hidden: hid, W: W2 } = this._boltz;

    // Gibbs sampling
    for (let k = 0; k < 3; k++) {
      for (let i = 0; i < N; i++) {
        let net = 0;
        for (let j = 0; j < N; j++) net += W2[i][j] * hid[j];
        vis[i] = Math.random() < 1/(1+Math.exp(-net*2)) ? 1 : -1;
      }
      for (let j = 0; j < N; j++) {
        let net = 0;
        for (let i = 0; i < N; i++) net += W2[i][j] * vis[i];
        hid[j] = Math.random() < 1/(1+Math.exp(-net*2)) ? 1 : -1;
      }
    }

    // Render bipartite graph
    const vx = W * 0.25, hx = W * 0.75;
    const getY = (i, n) => H * 0.1 + i * (H * 0.8) / (n-1);

    // Connections
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const w = W2[i][j];
        if (Math.abs(w) < 0.1) continue;
        ctx.beginPath();
        ctx.moveTo(vx, getY(i, N));
        ctx.lineTo(hx, getY(j, N));
        ctx.strokeStyle = w > 0
          ? `hsla(${hue}, 80%, 55%, ${Math.abs(w)*0.4})`
          : `hsla(${(hue+180)%360}, 80%, 55%, ${Math.abs(w)*0.4})`;
        ctx.lineWidth = Math.abs(w) * 2;
        ctx.stroke();
      }
    }

    // Visible units
    for (let i = 0; i < N; i++) {
      const y = getY(i, N);
      const active = vis[i] > 0;
      ctx.beginPath();
      ctx.arc(vx, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = active ? `hsl(${hue}, 90%, 65%)` : `hsl(${hue}, 20%, 20%)`;
      ctx.shadowColor = active ? `hsl(${hue}, 100%, 70%)` : 'none';
      ctx.shadowBlur = active ? 12 : 0;
      ctx.fill();
    }

    // Hidden units
    for (let j = 0; j < N; j++) {
      const y = getY(j, N);
      const active = hid[j] > 0;
      ctx.beginPath();
      ctx.arc(hx, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = active ? `hsl(${(hue+60)%360}, 90%, 65%)` : `hsl(${hue}, 20%, 20%)`;
      ctx.shadowColor = active ? `hsl(${(hue+60)%360}, 100%, 70%)` : 'none';
      ctx.shadowBlur = active ? 12 : 0;
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  },

  /* ── Cellular Neural Network ── */
  cellularNN(ctx, W, H, params, palette, t) {
    const N = 40;
    const hue = palette.h1;

    if (!this._cnn) {
      this._cnn = {
        state: Array.from({length:N},()=>Array.from({length:N},()=>Math.random()*2-1)),
        A: [[0.1,0.2,0.1],[0.2,0.4,0.2],[0.1,0.2,0.1]], // feedback template
        B: [[0.1,0.1,0.1],[0.1,0.8,0.1],[0.1,0.1,0.1]], // input template
        input: Array.from({length:N},()=>Array.from({length:N},()=>Math.random()*2-1))
      };
    }

    const {state, A, B, input} = this._cnn;
    const sigma = x => Math.max(-1, Math.min(1, x));
    const next = Array.from({length:N},()=>new Array(N).fill(0));

    for (let y=0;y<N;y++) for(let x=0;x<N;x++){
      let sum=0;
      for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++){
        const ny2=Math.max(0,Math.min(N-1,y+dy)), nx2=Math.max(0,Math.min(N-1,x+dx));
        sum+=A[dy+1][dx+1]*sigma(state[ny2][nx2]);
        sum+=B[dy+1][dx+1]*input[ny2][nx2];
      }
      next[y][x]=sigma(sum + Math.sin(t*0.1)*0.05);
    }
    for(let y=0;y<N;y++) for(let x=0;x<N;x++) state[y][x]=next[y][x];

    const imgData=ctx.createImageData(N,N);
    const data=imgData.data;
    for(let y=0;y<N;y++) for(let x=0;x<N;x++){
      const v=(state[y][x]+1)/2;
      const [r,g,b]=this.hslToRgb((hue/360+v*0.3)%1,0.9,0.1+v*0.65);
      const i=(y*N+x)*4;
      data[i]=r;data[i+1]=g;data[i+2]=b;data[i+3]=255;
    }
    const tmp=document.createElement('canvas');
    tmp.width=N;tmp.height=N;
    tmp.getContext('2d').putImageData(imgData,0,0);
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(tmp,0,0,W,H);
  },

  /* ── Echo State / Reservoir Computing ── */
  reservoir(ctx, W, H, params, palette, t) {
    ctx.fillStyle = 'rgba(3,3,10,0.18)';
    ctx.fillRect(0, 0, W, H);

    const hue = palette.h1;
    const N = Math.min(params.neuronsPerLayer || 40, 60);

    if (!this._res) {
      // Random sparse reservoir
      const W2 = Array.from({length:N}, () =>
        Array.from({length:N}, () => Math.random() < 0.1 ? (Math.random()-0.5)*1.5 : 0)
      );
      // Spectral radius scaling
      const positions = Array.from({length:N}, () => ({
        x: Math.random()*W, y: Math.random()*H
      }));
      const state = new Float32Array(N);
      this._res = {W: W2, state, positions};
    }

    const {W: W2, state, positions} = this._res;
    const input = Math.sin(t * params.pulseRate || t);

    // Update reservoir
    const newState = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      let net = input * 0.5;
      for (let j = 0; j < N; j++) net += W2[i][j] * state[j];
      newState[i] = Math.tanh(net);
    }
    state.set(newState);

    // Draw connections
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const w = W2[i][j];
        if (w === 0) continue;
        const alpha = Math.abs(w) * Math.abs(state[i]) * 0.3;
        if (alpha < 0.01) continue;
        ctx.beginPath();
        ctx.moveTo(positions[i].x, positions[i].y);
        ctx.lineTo(positions[j].x, positions[j].y);
        ctx.strokeStyle = w > 0
          ? `hsla(${hue}, 70%, 55%, ${alpha})`
          : `hsla(${(hue+180)%360}, 70%, 55%, ${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    // Draw neurons
    for (let i = 0; i < N; i++) {
      const { x, y } = positions[i];
      const activation = Math.abs(state[i]);
      const r = 3 + activation * 5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI*2);
      ctx.fillStyle = `hsl(${hue + state[i]*30}, 85%, ${20+activation*50}%)`;
      ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
      ctx.shadowBlur = activation * 10;
      ctx.fill();
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

if(typeof module!=='undefined'&&module.exports){module.exports=NeuralAlgo;}
else{window.NeuralAlgo=NeuralAlgo;}
