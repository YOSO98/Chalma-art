/* ══════════════════════════════════════════════════════════════
   CHALMA ART — PRNG (Pseudo-Random Number Generator)
   Mulberry32 — fast, high quality, seedable 32-bit PRNG
   ══════════════════════════════════════════════════════════════ */

'use strict';

/**
 * Creates a seeded Mulberry32 PRNG.
 * Returns a function that yields floats in [0, 1).
 */
function mulberry32(seed) {
  let s = seed >>> 0;
  return function() {
    s += 0x6D2B79F5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Creates a seeded xoshiro128** PRNG (higher quality for larger sequences).
 * Returns a function that yields floats in [0, 1).
 */
function xoshiro128ss(seed) {
  let s0 = seed ^ 0xdeadbeef;
  let s1 = seed ^ 0x12345678;
  let s2 = (seed * 0x9e3779b9) >>> 0;
  let s3 = (seed * 0x6c62272e) >>> 0;

  function rotl(x, k) {
    return (x << k) | (x >>> (32 - k));
  }
  return function() {
    const result = Math.imul(rotl(Math.imul(s1, 5), 7), 9) >>> 0;
    const t = (s1 << 9) >>> 0;
    s2 ^= s0;
    s3 ^= s1;
    s1 ^= s2;
    s0 ^= s3;
    s2 ^= t;
    s3 = rotl(s3, 11);
    return result / 4294967296;
  };
}

/**
 * Convenience: create a PRNG from a seed and expose utility methods.
 */
function createRNG(seed) {
  const raw = mulberry32(seed);

  return {
    /** Float in [0, 1) */
    next() { return raw(); },

    /** Float in [min, max) */
    range(min, max) { return min + raw() * (max - min); },

    /** Integer in [min, max] inclusive */
    int(min, max) { return Math.floor(min + raw() * (max - min + 1)); },

    /** Pick a random element from an array */
    pick(arr) { return arr[Math.floor(raw() * arr.length)]; },

    /** Shuffle array in-place (Fisher-Yates) */
    shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(raw() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },

    /** Boolean with probability p (default 0.5) */
    bool(p = 0.5) { return raw() < p; },

    /** Gaussian (Box-Muller) */
    gauss(mean = 0, std = 1) {
      const u = 1 - raw();
      const v = raw();
      const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      return mean + std * z;
    },

    /** Weighted pick: weights array must match items array length */
    weightedPick(items, weights) {
      const total = weights.reduce((a, b) => a + b, 0);
      let r = raw() * total;
      for (let i = 0; i < items.length; i++) {
        r -= weights[i];
        if (r <= 0) return items[i];
      }
      return items[items.length - 1];
    }
  };
}

// Export for both module and browser global usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { mulberry32, xoshiro128ss, createRNG };
} else {
  window.mulberry32  = mulberry32;
  window.xoshiro128ss = xoshiro128ss;
  window.createRNG   = createRNG;
}
