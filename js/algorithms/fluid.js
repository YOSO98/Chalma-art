/* ══════════════════════════════════════════════════════════════
   CHALMA ART — Fluids & Reaction-Diffusion
   Family 6, seeds 30001–35000
   ══════════════════════════════════════════════════════════════ */
'use strict';

const FluidAlgo = {

  render(ctx, W, H, artwork, t) {
    const { algorithm, params, palette } = artwork;
    switch (algorithm) {
      case 'navier_stokes':    this.navierstokes(ctx, W, H, params, palette, t); break;
      case 'gray_scott':       this.grayScott(ctx, W, H, params, palette, t); break;
      case 'turing_morpho':    this.turingMorpho(ctx, W, H, params, palette, t); break;
      case 'belousov':         this.belousov(ctx, W, H, params, palette, t); break;
      case 'kelvin_helmholtz': this.kelvinHelmholtz(ctx, W, H, params, palette, t); break;
      case 'cahn_hilliard':    this.cahnHilliard(ctx, W, H, params, palette, t); break;
      case 'swift_hohenberg':  this.swiftHohenberg(ctx, W, H, params, palette, t); break;
      default:                 this.grayScott(ctx, W, H, params, palette, t);
    }
  },

  /* ── Simplified Navier-Stokes (Jos Stam, stable fluids) ── */
  navierstokes(ctx, W, H, params, palette, t) {
    const N = params.resolution || 64;
    const visc = params.viscosity || 0.0001;
    const dt2 = 0.1;
    const hue = palette.h1;

    if (!this._ns || this._ns.N !== N) {
      const size = (N + 2) * (N + 2);
      this._ns = {
        N,
        u: new Float32Array(size), v: new Float32Array(size),
        u_prev: new Float32Array(size), v_prev: new Float32Array(size),
        dens: new Float32Array(size), dens_prev: new Float32Array(size)
      };
    }

    const { u, v, u_prev, v_prev, dens, dens_prev } = this._ns;
    const IX = (x, y) => x + (N + 2) * y;

    // Add forces
    const cx = Math.floor(N / 2), cy = Math.floor(N / 2);
    const f = 0.5 + Math.sin(t * 0.5) * 0.3;
    u[IX(cx, cy)] += 100 * dt2 * Math.cos(t * 0.3);
    v[IX(cx, cy)] += 100 * dt2 * Math.sin(t * 0.3);
    dens[IX(cx, cy)] += 200 * dt2;

    // Diffuse & advect (simplified)
    this._nsStep(u, u_prev, v, v_prev, dens, dens_prev, visc, dt2, N);

    // Render
    const cellW = W / N, cellH = H / N;
    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;

    for (let j = 1; j <= N; j++) {
      for (let i = 1; i <= N; i++) {
        const d = Math.min(1, dens[IX(i, j)] * 0.01);
        const vel = Math.sqrt(u[IX(i,j)]**2 + v[IX(i,j)]**2);
        const [r, g, b] = this.hslToRgb(
          (hue / 360 + vel * 0.01) % 1, 0.9, d * 0.7
        );
        const px = Math.floor((i - 1) * cellW);
        const py = Math.floor((j - 1) * cellH);
        for (let dy = 0; dy < Math.ceil(cellH); dy++) {
          for (let dx = 0; dx < Math.ceil(cellW); dx++) {
            const idx = ((py + dy) * W + (px + dx)) * 4;
            if (idx + 3 < data.length) {
              data[idx] = r; data[idx+1] = g; data[idx+2] = b; data[idx+3] = 255;
            }
          }
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  },

  _nsStep(u, u_prev, v, v_prev, dens, dens_prev, visc, dt2, N) {
    const IX = (x, y) => x + (N + 2) * y;
    // Simple advection-diffusion (greatly simplified)
    const diff = visc * dt2 * N * N;
    for (let i = 1; i <= N; i++) {
      for (let j = 1; j <= N; j++) {
        dens[IX(i,j)] = dens[IX(i,j)] * 0.99 +
          (dens[IX(i-1,j)] + dens[IX(i+1,j)] + dens[IX(i,j-1)] + dens[IX(i,j+1)]) * 0.002;
        u[IX(i,j)] *= 0.99;
        v[IX(i,j)] *= 0.99;
      }
    }
  },

  /* ── Gray-Scott reaction-diffusion ── */
  grayScott(ctx, W, H, params, palette, t) {
    const N = params.resolution || 96;
    const f = params.f || 0.055;
    const k = params.k || 0.062;
    const Du = params.Du || 0.21;
    const Dv = params.Dv || 0.105;
    const hue = palette.h1;

    if (!this._gs || this._gs.N !== N || this._gs.key !== `${f}_${k}`) {
      const U = new Float32Array(N * N).fill(1);
      const V = new Float32Array(N * N).fill(0);
      // Seed
      const cx = Math.floor(N / 2), cy = Math.floor(N / 2);
      for (let dy = -8; dy <= 8; dy++)
        for (let dx = -8; dx <= 8; dx++) {
          const i = ((cx + dx) + N) % N + ((cy + dy + N) % N) * N;
          U[i] = 0.5 + Math.random() * 0.1;
          V[i] = 0.25 + Math.random() * 0.1;
        }
      this._gs = { N, key: `${f}_${k}`, U, V, Unext: new Float32Array(N*N), Vnext: new Float32Array(N*N) };
    }

    const { U, V, Unext, Vnext } = this._gs;
    const stepsPerFrame = Math.min(params.steps || 8, 20);

    for (let s = 0; s < stepsPerFrame; s++) {
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          const i = x + y * N;
          const left  = ((x-1+N)%N) + y*N;
          const right = ((x+1)%N)   + y*N;
          const up    = x + ((y-1+N)%N)*N;
          const down  = x + ((y+1)%N)*N;

          const lapU = U[left]+U[right]+U[up]+U[down] - 4*U[i];
          const lapV = V[left]+V[right]+V[up]+V[down] - 4*V[i];
          const uvv = U[i]*V[i]*V[i];

          Unext[i] = Math.max(0, Math.min(1, U[i] + Du*lapU - uvv + f*(1-U[i])));
          Vnext[i] = Math.max(0, Math.min(1, V[i] + Dv*lapV + uvv - (f+k)*V[i]));
        }
      }
      U.set(Unext); V.set(Vnext);
    }

    const imgData = ctx.createImageData(N, N);
    const data = imgData.data;
    for (let i = 0; i < N * N; i++) {
      const v = V[i];
      const [r, g, b] = this.hslToRgb((hue/360 + v*0.8)%1, 0.95, 0.05 + v*0.7);
      data[i*4]=r; data[i*4+1]=g; data[i*4+2]=b; data[i*4+3]=255;
    }

    // Scale up to canvas
    const tmp = document.createElement('canvas');
    tmp.width = N; tmp.height = N;
    tmp.getContext('2d').putImageData(imgData, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(tmp, 0, 0, W, H);
  },

  /* ── Turing morphogenesis ── */
  turingMorpho(ctx, W, H, params, palette, t) {
    const N = params.resolution || 80;
    const hue = palette.h1;

    if (!this._turing) {
      const A = new Float32Array(N * N);
      const I = new Float32Array(N * N);
      for (let i = 0; i < N * N; i++) { A[i] = Math.random(); I[i] = Math.random(); }
      this._turing = { N, A, I, Anext: new Float32Array(N*N), Inext: new Float32Array(N*N) };
    }

    const { A, I, Anext, Inext } = this._turing;
    const ra=5, ri=12, Da=0.25, Di=0.06, sa=0.02, si=-0.04;

    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        let sumA=0, sumI=0, cntA=0, cntI=0;
        for (let dy=-ri;dy<=ri;dy++) for(let dx=-ri;dx<=ri;dx++){
          const d=Math.sqrt(dx*dx+dy*dy);
          const nx=(x+dx+N)%N, ny=(y+dy+N)%N;
          if(d<=ra){sumA+=A[nx+ny*N];cntA++;}
          if(d<=ri){sumI+=I[nx+ny*N];cntI++;}
        }
        const i=x+y*N;
        const aAvg=cntA?sumA/cntA:0, iAvg=cntI?sumI/cntI:0;
        Anext[i]=Math.max(0,Math.min(1,A[i]+Da*(aAvg-A[i])+sa));
        Inext[i]=Math.max(0,Math.min(1,I[i]+Di*(iAvg-I[i])+si));
      }
    }
    A.set(Anext); I.set(Inext);

    const imgData=ctx.createImageData(N,N);
    const data=imgData.data;
    for(let i=0;i<N*N;i++){
      const v=A[i]-I[i];
      const n=(v+1)/2;
      const [r,g,b]=this.hslToRgb((hue/360+n*0.4)%1,0.9,0.05+n*0.65);
      data[i*4]=r;data[i*4+1]=g;data[i*4+2]=b;data[i*4+3]=255;
    }
    const tmp=document.createElement('canvas');
    tmp.width=N;tmp.height=N;
    tmp.getContext('2d').putImageData(imgData,0,0);
    ctx.drawImage(tmp,0,0,W,H);
  },

  /* ── Belousov-Zhabotinsky ── */
  belousov(ctx, W, H, params, palette, t) {
    const N = params.resolution || 80;
    const hue = palette.h1;
    const eps=0.12, q=0.002, f2=1.4;

    if (!this._bz) {
      const a=new Float32Array(N*N), b=new Float32Array(N*N), c=new Float32Array(N*N);
      for(let i=0;i<N*N;i++){a[i]=Math.random();b[i]=Math.random()*0.1;c[i]=Math.random()*0.1;}
      this._bz={N,a,b,c};
    }
    const {a,b,c}=this._bz;
    const an=new Float32Array(N*N), bn=new Float32Array(N*N), cn=new Float32Array(N*N);
    const lap=(arr,i,x,y)=>{
      const l=((x-1+N)%N)+y*N, r=((x+1)%N)+y*N;
      const u=x+((y-1+N)%N)*N, d=x+((y+1)%N)*N;
      return arr[l]+arr[r]+arr[u]+arr[d]-4*arr[i];
    };
    const dt=0.2;
    for(let y=0;y<N;y++) for(let x=0;x<N;x++){
      const i=x+y*N;
      const la=lap(a,i,x,y), lb=lap(b,i,x,y), lc=lap(c,i,x,y);
      an[i]=Math.max(0,Math.min(1,a[i]+(a[i]*(1-a[i]-b[i]*(a[i]-q)/(a[i]+q))/eps+la)*dt));
      bn[i]=Math.max(0,Math.min(1,b[i]+(a[i]-b[i]+lb)*dt));
      cn[i]=Math.max(0,Math.min(1,c[i]+(f2*(a[i]-c[i])+lc*0.5)*dt));
    }
    a.set(an);b.set(bn);c.set(cn);

    const imgData=ctx.createImageData(N,N);
    const data=imgData.data;
    for(let i=0;i<N*N;i++){
      const [r,g,b2]=this.hslToRgb((hue/360+a[i]*0.4)%1,0.9,0.1+a[i]*0.6);
      data[i*4]=r;data[i*4+1]=g;data[i*4+2]=b2;data[i*4+3]=255;
    }
    const tmp=document.createElement('canvas');
    tmp.width=N;tmp.height=N;
    tmp.getContext('2d').putImageData(imgData,0,0);
    ctx.drawImage(tmp,0,0,W,H);
  },

  /* ── Kelvin-Helmholtz instability ── */
  kelvinHelmholtz(ctx, W, H, params, palette, t) {
    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;
    const hue = palette.h1;

    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const x = px / W, y = py / H;
        const interface_y = 0.5 + 0.05 * Math.sin(2 * Math.PI * x * 4 + t * 2);
        const shear = y < interface_y ? 1 : -1;
        // Kelvin-Helmholtz rolls
        let vort = 0;
        for (let m = 1; m <= 5; m++) {
          const kx = 2 * Math.PI * m;
          const growth = Math.exp(Math.min(8, m * t * 0.3));
          vort += Math.sin(kx * x + t * m * 0.2) * Math.exp(-Math.abs(y - 0.5) * m * 5) / m;
        }
        const v = (shear * 0.3 + vort * 0.7 + 1) / 2;
        const [r, g, b] = this.hslToRgb((hue/360 + v*0.5)%1, 0.9, 0.1+v*0.6);
        const idx = (py*W+px)*4;
        data[idx]=r; data[idx+1]=g; data[idx+2]=b; data[idx+3]=255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  },

  /* ── Cahn-Hilliard (phase separation) ── */
  cahnHilliard(ctx, W, H, params, palette, t) {
    const N = params.resolution || 80;
    const hue = palette.h1;

    if (!this._ch) {
      const phi = new Float32Array(N*N);
      for(let i=0;i<N*N;i++) phi[i]=(Math.random()-0.5)*0.1;
      this._ch = {N, phi, mu: new Float32Array(N*N)};
    }
    const {phi, mu} = this._ch;
    const lap = (arr,x,y)=>{
      const l=((x-1+N)%N)+y*N, r=((x+1)%N)+y*N;
      const u=x+((y-1+N)%N)*N, d=x+((y+1)%N)*N, i=x+y*N;
      return arr[l]+arr[r]+arr[u]+arr[d]-4*arr[i];
    };
    for(let y=0;y<N;y++) for(let x=0;x<N;x++){
      const i=x+y*N;
      mu[i]=phi[i]*phi[i]*phi[i]-phi[i]-0.5*lap(phi,x,y);
    }
    const phin=new Float32Array(N*N);
    for(let y=0;y<N;y++) for(let x=0;x<N;x++){
      const i=x+y*N;
      phin[i]=phi[i]+0.1*lap(mu,x,y);
    }
    phi.set(phin);

    const imgData=ctx.createImageData(N,N);
    const data=imgData.data;
    for(let i=0;i<N*N;i++){
      const v=(phi[i]+1)/2;
      const [r,g,b]=this.hslToRgb((hue/360+v*0.3)%1,0.9,0.1+v*0.65);
      data[i*4]=r;data[i*4+1]=g;data[i*4+2]=b;data[i*4+3]=255;
    }
    const tmp=document.createElement('canvas');
    tmp.width=N;tmp.height=N;
    tmp.getContext('2d').putImageData(imgData,0,0);
    ctx.drawImage(tmp,0,0,W,H);
  },

  /* ── Swift-Hohenberg (pattern formation) ── */
  swiftHohenberg(ctx, W, H, params, palette, t) {
    const N = params.resolution || 80;
    const hue = palette.h1;
    const eps = 0.5, q0 = 1;

    if (!this._sh) {
      const u = new Float32Array(N*N);
      for(let i=0;i<N*N;i++) u[i]=(Math.random()-0.5)*0.1;
      this._sh = {N, u};
    }
    const {u} = this._sh;
    const lap=(x,y)=>{
      const l=((x-1+N)%N)+y*N, r=((x+1)%N)+y*N;
      const up=x+((y-1+N)%N)*N, d=x+((y+1)%N)*N, i=x+y*N;
      return u[l]+u[r]+u[up]+u[d]-4*u[i];
    };
    const un=new Float32Array(N*N);
    for(let y=0;y<N;y++) for(let x=0;x<N;x++){
      const i=x+y*N;
      const l=lap(x,y);
      // bilaplacian approx
      const ll=((x>1?u[x-2+y*N]:0)+(x<N-2?u[x+2+y*N]:0)+(y>1?u[x+(y-2)*N]:0)+(y<N-2?u[x+(y+2)*N]:0)-4*l);
      const Lu=l; const L2u=ll;
      un[i]=Math.max(-2,Math.min(2,u[i]+0.1*(eps*u[i]-(1+q0*q0)*(1+q0*q0)*u[i]-Lu-u[i]*u[i]*u[i])));
    }
    u.set(un);

    const imgData=ctx.createImageData(N,N);
    const data=imgData.data;
    for(let i=0;i<N*N;i++){
      const v=(u[i]+1)/2;
      const [r,g,b]=this.hslToRgb((hue/360+v*0.4)%1,0.9,0.1+v*0.65);
      data[i*4]=r;data[i*4+1]=g;data[i*4+2]=b;data[i*4+3]=255;
    }
    const tmp=document.createElement('canvas');
    tmp.width=N;tmp.height=N;
    tmp.getContext('2d').putImageData(imgData,0,0);
    ctx.drawImage(tmp,0,0,W,H);
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

if(typeof module!=='undefined'&&module.exports){module.exports=FluidAlgo;}
else{window.FluidAlgo=FluidAlgo;}
