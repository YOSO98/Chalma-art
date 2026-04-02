/* ══════════════════════════════════════════════════════════════
   CHALMA ART — Universal Renderer
   Routes artwork to the correct algorithm family renderer
   ══════════════════════════════════════════════════════════════ */
'use strict';

const Renderer = {

  /* Algorithm family map */
  _algos: null,

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

  /**
   * Render an artwork onto a canvas context.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} W - canvas width
   * @param {number} H - canvas height
   * @param {object} artwork - from generateArtwork(seed)
   * @param {number} t - time in seconds
   */
  render(ctx, W, H, artwork, t) {
    const algos = this._getAlgos();
    const algo = algos[artwork.familyId];
    if (!algo) {
      // Fallback
      ctx.fillStyle = artwork.palette.bg || '#03030a';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = artwork.palette.primary || '#c9a84c';
      ctx.font = `${Math.min(W, H) * 0.05}px "Space Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Seed #${artwork.seed}`, W / 2, H / 2);
      return;
    }
    try {
      algo.render(ctx, W, H, artwork, t);
    } catch (e) {
      // On render error, show graceful fallback
      ctx.fillStyle = '#03030a';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(201,168,76,0.3)';
      ctx.fillRect(W*0.1, H*0.1, W*0.8, H*0.8);
    }
  },

  /**
   * Create a managed canvas animation for a card (thumbnail).
   * Returns a { canvas, start, stop } object.
   */
  createCardRenderer(artwork, size = 300) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    let raf = null;
    let t = 0;
    let running = false;
    let lastFrame = 0;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;

    // Clear algo-specific state so each card is independent
    const algoObj = this._getAlgos()[artwork.familyId];
    const stateKeys = Object.keys(algoObj || {}).filter(k => k.startsWith('_'));
    const savedState = {};
    for (const k of stateKeys) savedState[k] = algoObj[k];

    // Each card gets its own isolated algo instance
    const isolatedAlgo = algoObj ? Object.create(algoObj) : null;
    if (isolatedAlgo) {
      for (const k of stateKeys) delete isolatedAlgo[k];
    }

    const loop = (timestamp) => {
      if (!running) return;
      const elapsed = timestamp - lastFrame;
      if (elapsed >= frameInterval) {
        lastFrame = timestamp;
        if (isolatedAlgo) {
          try { isolatedAlgo.render(ctx, size, size, artwork, t); }
          catch (e) {
            ctx.fillStyle = '#03030a';
            ctx.fillRect(0, 0, size, size);
          }
        }
        t += frameInterval / 1000;
      }
      raf = requestAnimationFrame(loop);
    };

    return {
      canvas,
      start() {
        if (running) return;
        running = true;
        lastFrame = 0;
        raf = requestAnimationFrame(loop);
      },
      stop() {
        running = false;
        if (raf) { cancelAnimationFrame(raf); raf = null; }
      },
      setT(time) { t = time; },
      getT() { return t; }
    };
  },

  /**
   * Create a full-quality renderer for artwork.html detail page.
   * @param {HTMLCanvasElement} canvas
   * @param {object} artwork
   * @returns {{ start, stop, setT }}
   */
  createDetailRenderer(canvas, artwork) {
    const ctx = canvas.getContext('2d');
    let raf = null;
    let running = false;
    let startTime = null;
    let pausedAt = 0;

    const algoObj = this._getAlgos()[artwork.familyId];
    const isolatedAlgo = algoObj ? Object.create(algoObj) : null;
    if (isolatedAlgo) {
      const keys = Object.keys(algoObj).filter(k => k.startsWith('_'));
      for (const k of keys) delete isolatedAlgo[k];
    }

    const loop = (timestamp) => {
      if (!running) return;
      if (!startTime) startTime = timestamp;
      const t = pausedAt + (timestamp - startTime) / 1000;
      const W = canvas.width, H = canvas.height;

      if (isolatedAlgo) {
        try { isolatedAlgo.render(ctx, W, H, artwork, t); }
        catch (e) {
          ctx.fillStyle = '#03030a';
          ctx.fillRect(0, 0, W, H);
        }
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
        running = false;
        if (startTime && raf) pausedAt += (performance.now() - startTime) / 1000;
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        startTime = null;
      },
      get t() {
        return pausedAt + (startTime ? (performance.now() - startTime) / 1000 : 0);
      },
      downloadPNG(filename) {
        const link = document.createElement('a');
        link.download = filename || `chalma-${artwork.seed}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };
  },

  /**
   * Render a single static frame to a canvas (no animation).
   * Used for thumbnail preview generation.
   */
  renderStatic(artwork, size = 150) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const algoObj = this._getAlgos()[artwork.familyId];
    if (algoObj) {
      const isolated = Object.create(algoObj);
      const keys = Object.keys(algoObj).filter(k => k.startsWith('_'));
      for (const k of keys) delete isolated[k];
      try { isolated.render(ctx, size, size, artwork, 0); }
      catch (e) {
        ctx.fillStyle = artwork.palette.bg || '#03030a';
        ctx.fillRect(0, 0, size, size);
      }
    }
    return canvas;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Renderer;
} else {
  window.Renderer = Renderer;
}
