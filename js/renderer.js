/* ══════════════════════════════════════════════════════════════
   CHALMA ART — Universal Renderer (optimisé performance)
   - Cards : frame statique unique + animation au hover uniquement
   - Max 3 animations simultanées dans la galerie
   ══════════════════════════════════════════════════════════════ */
'use strict';

const Renderer = {

  _algos: null,
  _activeAnimations: 0,
  _MAX_ANIMATIONS: 3,

  _getAlgos() {
    if (!this._algos) {
      this._algos = [
        window.FractalsAlgo,
        window.AttractorsAlgo,
        window.ParticlesAlgo,
        window.CellularAlgo,
        window.WavesAlgo,
        window.GeometryAlgo,
        window.FluidAlgo,
        window.OrganicAlgo,
        window.CosmicAlgo,
        window.NeuralAlgo
      ];
    }
    return this._algos;
  },

  render(ctx, W, H, artwork, t) {
    const algo = this._getAlgos()[artwork.familyId];
    if (!algo) {
      ctx.fillStyle = artwork.palette.bg || '#03030a';
      ctx.fillRect(0, 0, W, H);
      return;
    }
    try {
      algo.render(ctx, W, H, artwork, t);
    } catch (e) {
      ctx.fillStyle = '#03030a';
      ctx.fillRect(0, 0, W, H);
    }
  },

  /**
   * Crée un renderer de card :
   * - Rendu statique immédiat (t=0 ou t aléatoire)
   * - Animation uniquement au hover, stoppée au mouse-leave
   */
  createCardRenderer(artwork, size = 300) {
    const canvas = document.createElement('canvas');
    canvas.width  = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Isolated algo instance (pas de state partagé)
    const algoObj = this._getAlgos()[artwork.familyId];
    const isolated = algoObj ? Object.create(algoObj) : null;
    if (isolated) {
      Object.keys(algoObj).filter(k => k.startsWith('_')).forEach(k => delete isolated[k]);
    }

    let raf = null;
    let running = false;
    let t = Math.random() * 60; // offset aléatoire pour diversifier les frames statiques
    const self = this;

    const renderFrame = () => {
      if (isolated) {
        try { isolated.render(ctx, size, size, artwork, t); }
        catch (e) { ctx.fillStyle = '#03030a'; ctx.fillRect(0, 0, size, size); }
      }
    };

    // Rendu statique initial
    renderFrame();

    const start = () => {
      if (running || self._activeAnimations >= self._MAX_ANIMATIONS) return;
      running = true;
      self._activeAnimations++;
      let last = 0;
      const loop = (ts) => {
        if (!running) return;
        if (ts - last >= 33) { // ~30fps
          renderFrame();
          t += 0.033;
          last = ts;
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      self._activeAnimations = Math.max(0, self._activeAnimations - 1);
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    };

    return { canvas, start, stop };
  },

  /**
   * Renderer plein qualité pour la page détail (artwork.html).
   */
  createDetailRenderer(canvas, artwork) {
    const ctx = canvas.getContext('2d');
    let raf = null;
    let running = false;
    let startTime = null;
    let pausedAt = 0;

    const algoObj = this._getAlgos()[artwork.familyId];
    const isolated = algoObj ? Object.create(algoObj) : null;
    if (isolated) {
      Object.keys(algoObj).filter(k => k.startsWith('_')).forEach(k => delete isolated[k]);
    }

    const loop = (ts) => {
      if (!running) return;
      if (!startTime) startTime = ts;
      const t = pausedAt + (ts - startTime) / 1000;
      const W = canvas.width, H = canvas.height;
      if (isolated) {
        try { isolated.render(ctx, W, H, artwork, t); }
        catch (e) { ctx.fillStyle = '#03030a'; ctx.fillRect(0, 0, W, H); }
      }
      raf = requestAnimationFrame(loop);
    };

    return {
      start() {
        if (running) return;
        running = true;
        startTime = null;
        raf = requestAnimationFrame(loop);
      },
      stop() {
        if (!running) return;
        running = false;
        if (startTime) pausedAt += (performance.now() - startTime) / 1000;
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        startTime = null;
      },
      downloadPNG(filename) {
        const a = document.createElement('a');
        a.download = filename || `chalma-${artwork.seed}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
      }
    };
  }
};

if (typeof module !== 'undefined' && module.exports) module.exports = Renderer;
else window.Renderer = Renderer;
