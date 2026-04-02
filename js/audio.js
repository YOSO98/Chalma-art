/* ══════════════════════════════════════════════════════════════
   CHALMA ART — Audio Engine (Web Audio API)
   Procedural sound signatures per artwork family
   ══════════════════════════════════════════════════════════════ */
'use strict';

const AudioEngine = {
  _ctx: null,
  _masterGain: null,
  _active: new Map(), // seed → { nodes, stop }
  _muted: false,
  _volume: 0.5,

  get ctx() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._masterGain = this._ctx.createGain();
      this._masterGain.gain.value = this._volume;
      this._masterGain.connect(this._ctx.destination);
    }
    return this._ctx;
  },

  resume() {
    if (this._ctx && this._ctx.state === 'suspended') this._ctx.resume();
  },

  setVolume(v) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this._masterGain) this._masterGain.gain.setTargetAtTime(this._volume, this.ctx.currentTime, 0.1);
  },

  mute() {
    this._muted = true;
    if (this._masterGain) this._masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
  },

  unmute() {
    this._muted = false;
    if (this._masterGain) this._masterGain.gain.setTargetAtTime(this._volume, this.ctx.currentTime, 0.05);
  },

  /**
   * Play audio for an artwork. Returns a stop function.
   */
  play(artwork) {
    this.resume();
    const { seed, familyId, audioProfile, palette } = artwork;

    // Stop existing audio for this seed
    this.stop(seed);

    const ac = this.ctx;
    const out = this._masterGain;
    const nodes = [];
    const gainNode = ac.createGain();
    gainNode.gain.setValueAtTime(0, ac.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4, ac.currentTime + audioProfile.attack);
    gainNode.connect(out);
    nodes.push(gainNode);

    let stopFn;

    switch (familyId) {
      case 0: stopFn = this._playArpeggio(ac, gainNode, audioProfile, palette, nodes); break;
      case 1: stopFn = this._playDrone(ac, gainNode, audioProfile, palette, nodes); break;
      case 2: stopFn = this._playGranular(ac, gainNode, audioProfile, palette, nodes); break;
      case 3: stopFn = this._playRhythmic(ac, gainNode, audioProfile, palette, nodes); break;
      case 4: stopFn = this._playPureTone(ac, gainNode, audioProfile, palette, nodes); break;
      case 5: stopFn = this._playSpherical(ac, gainNode, audioProfile, palette, nodes); break;
      case 6: stopFn = this._playFiltered(ac, gainNode, audioProfile, palette, nodes); break;
      case 7: stopFn = this._playNature(ac, gainNode, audioProfile, palette, nodes); break;
      case 8: stopFn = this._playPad(ac, gainNode, audioProfile, palette, nodes); break;
      case 9: stopFn = this._playGlitch(ac, gainNode, audioProfile, palette, nodes); break;
      default: stopFn = this._playArpeggio(ac, gainNode, audioProfile, palette, nodes);
    }

    const stopAll = () => {
      gainNode.gain.setTargetAtTime(0, ac.currentTime, 0.3);
      if (stopFn) stopFn();
      setTimeout(() => {
        for (const n of nodes) {
          try { n.disconnect(); } catch (e) {}
        }
      }, 500);
    };

    this._active.set(seed, { nodes, stop: stopAll });
    return stopAll;
  },

  stop(seed) {
    if (this._active.has(seed)) {
      this._active.get(seed).stop();
      this._active.delete(seed);
    }
  },

  stopAll() {
    for (const [seed] of this._active) this.stop(seed);
  },

  /* ── Helper: create reverb convolution ── */
  _createReverb(ac, duration = 2, decay = 2) {
    const rate = ac.sampleRate;
    const length = rate * duration;
    const impulse = ac.createBuffer(2, length, rate);
    for (let c = 0; c < 2; c++) {
      const ch = impulse.getChannelData(c);
      for (let i = 0; i < length; i++) {
        ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    const convolver = ac.createConvolver();
    convolver.buffer = impulse;
    return convolver;
  },

  /* ── Helper: ADSR envelope gain ── */
  _adsr(gainNode, ac, { attack = 0.1, decay = 0.3, sustain = 0.7, release = 1.0 }, peak = 0.5) {
    const t = ac.currentTime;
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(peak, t + attack);
    gainNode.gain.linearRampToValueAtTime(peak * sustain, t + attack + decay);
  },

  /* ── Pentatonic scale helper ── */
  _pentatonicFreqs(base, count = 8) {
    const ratios = [1, 9/8, 5/4, 3/2, 5/3, 2, 9/4, 5/2];
    return Array.from({ length: count }, (_, i) => base * ratios[i % ratios.length] * Math.pow(2, Math.floor(i / ratios.length)));
  },

  /* ════════════════════════════════════════════════
     0 — FRACTALES: crystalline arpeggios
  ════════════════════════════════════════════════ */
  _playArpeggio(ac, out, profile, palette, nodes) {
    const freqs = this._pentatonicFreqs(profile.baseFreq, 8);
    const phi = (1 + Math.sqrt(5)) / 2;
    let step = 0;
    const reverb = this._createReverb(ac, 3, 2.5);
    reverb.connect(out);
    nodes.push(reverb);

    const play = () => {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = 'sine';
      osc.frequency.value = freqs[step % freqs.length];
      g.gain.setValueAtTime(0.15, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.5);
      osc.connect(g);
      g.connect(reverb);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + 0.5);
      step = Math.round(step + phi) % freqs.length;
      nodes.push(osc, g);
    };

    play();
    const tempo = 60 / (profile.tempo || 120);
    const interval = setInterval(play, tempo * 1000);
    return () => clearInterval(interval);
  },

  /* ════════════════════════════════════════════════
     1 — ATTRACTEURS: deep drones
  ════════════════════════════════════════════════ */
  _playDrone(ac, out, profile, palette, nodes) {
    const base = profile.baseFreq;
    const reverb = this._createReverb(ac, 8, 3);
    reverb.connect(out);
    nodes.push(reverb);

    const oscillators = [0, 0.05, -0.03, 7, -7].map((detune, i) => {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = i < 3 ? 'sawtooth' : 'sine';
      osc.frequency.value = base * (i < 3 ? 1 : Math.pow(2, Math.round(i)));
      osc.detune.value = detune * 100;
      g.gain.value = i < 3 ? 0.08 : 0.04;
      osc.connect(g);
      g.connect(reverb);
      osc.start();
      nodes.push(osc, g);
      return osc;
    });

    // Slow LFO modulation
    const lfo = ac.createOscillator();
    const lfoGain = ac.createGain();
    lfo.frequency.value = 0.05;
    lfoGain.gain.value = 8;
    lfo.connect(lfoGain);
    lfoGain.connect(oscillators[0].detune);
    lfo.start();
    nodes.push(lfo, lfoGain);

    return () => { for (const o of oscillators) { try { o.stop(); } catch(e){} } };
  },

  /* ════════════════════════════════════════════════
     2 — PARTICULES: granular synthesis
  ════════════════════════════════════════════════ */
  _playGranular(ac, out, profile, palette, nodes) {
    const playGrain = () => {
      const noise = ac.createBuffer(1, ac.sampleRate * 0.05, ac.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

      const source = ac.createBufferSource();
      source.buffer = noise;
      const g = ac.createGain();
      const filter = ac.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = profile.baseFreq * (0.5 + Math.random() * 2);
      filter.Q.value = 10;

      const env = ac.createGain();
      env.gain.setValueAtTime(0, ac.currentTime);
      env.gain.linearRampToValueAtTime(0.2, ac.currentTime + 0.01);
      env.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.08);

      source.connect(filter);
      filter.connect(env);
      env.connect(out);
      source.start();
      source.stop(ac.currentTime + 0.1);
      nodes.push(source, filter, env, g);
    };

    playGrain();
    const interval = setInterval(playGrain, 80 + Math.random() * 120);
    return () => clearInterval(interval);
  },

  /* ════════════════════════════════════════════════
     3 — AUTOMATES: rhythmic sequencer
  ════════════════════════════════════════════════ */
  _playRhythmic(ac, out, profile, palette, nodes) {
    const pattern = Array.from({ length: 16 }, () => Math.random() < 0.4 ? 1 : 0);
    const freqs = [55, 110, 165, 220, 330];
    let step = 0;
    const tempo = 60 / (profile.tempo || 120) / 4;

    const playStep = () => {
      if (pattern[step % 16]) {
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.type = 'square';
        osc.frequency.value = freqs[step % freqs.length];
        g.gain.setValueAtTime(0.15, ac.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + tempo * 0.8);
        osc.connect(g);
        g.connect(out);
        osc.start();
        osc.stop(ac.currentTime + tempo * 0.8);
        nodes.push(osc, g);
      }
      step++;
    };

    playStep();
    const interval = setInterval(playStep, tempo * 1000);
    return () => clearInterval(interval);
  },

  /* ════════════════════════════════════════════════
     4 — ONDES: pure tones (Chladni frequencies)
  ════════════════════════════════════════════════ */
  _playPureTone(ac, out, profile, palette, nodes) {
    const base = profile.baseFreq;
    // Chladni eigenfrequencies: f ∝ m² + n²
    const chladniFreqs = [1, 2, 4, 5, 8, 9, 10].map(n => base * Math.sqrt(n) * 0.5);

    for (let i = 0; i < Math.min(3, chladniFreqs.length); i++) {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = 'sine';
      osc.frequency.value = chladniFreqs[i];
      g.gain.value = 0.08 / (i + 1);
      osc.connect(g);
      g.connect(out);
      osc.start();
      nodes.push(osc, g);
    }

    return () => {};
  },

  /* ════════════════════════════════════════════════
     5 — GÉOMÉTRIE: spherical harmonics music
  ════════════════════════════════════════════════ */
  _playSpherical(ac, out, profile, palette, nodes) {
    const phi = (1 + Math.sqrt(5)) / 2;
    const reverb = this._createReverb(ac, 4, 2);
    reverb.connect(out);
    nodes.push(reverb);

    const oscs = [1, phi, phi*phi, 2, phi*3].map((ratio, i) => {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = 'sine';
      osc.frequency.value = profile.baseFreq * ratio * 0.5;
      g.gain.value = 0.06 / (i + 1);
      osc.connect(g);
      g.connect(reverb);
      osc.start();
      nodes.push(osc, g);
      return osc;
    });

    return () => { for (const o of oscs) { try { o.stop(); } catch(e){} } };
  },

  /* ════════════════════════════════════════════════
     6 — FLUIDES: filtered noise
  ════════════════════════════════════════════════ */
  _playFiltered(ac, out, profile, palette, nodes) {
    const bufferSize = ac.sampleRate * 2;
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const source = ac.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = profile.baseFreq * 3;
    filter.Q.value = 2;

    // LFO on filter cutoff
    const lfo = ac.createOscillator();
    const lfoGain = ac.createGain();
    lfo.frequency.value = 0.1;
    lfoGain.gain.value = profile.baseFreq * 2;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    const g = ac.createGain();
    g.gain.value = 0.15;
    source.connect(filter);
    filter.connect(g);
    g.connect(out);
    source.start();
    nodes.push(source, filter, lfo, lfoGain, g);

    return () => { try { source.stop(); lfo.stop(); } catch(e){} };
  },

  /* ════════════════════════════════════════════════
     7 — ORGANIQUE: nature synthesis
  ════════════════════════════════════════════════ */
  _playNature(ac, out, profile, palette, nodes) {
    // Wind: filtered noise
    const windBuf = ac.createBuffer(1, ac.sampleRate * 3, ac.sampleRate);
    const wd = windBuf.getChannelData(0);
    for (let i = 0; i < wd.length; i++) wd[i] = Math.random() * 2 - 1;
    const wind = ac.createBufferSource();
    wind.buffer = windBuf; wind.loop = true;
    const windFilter = ac.createBiquadFilter();
    windFilter.type = 'bandpass'; windFilter.frequency.value = 400; windFilter.Q.value = 0.5;
    const windGain = ac.createGain(); windGain.gain.value = 0.05;
    wind.connect(windFilter); windFilter.connect(windGain); windGain.connect(out);
    wind.start();
    nodes.push(wind, windFilter, windGain);

    // Water drops
    const drop = () => {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = 'sine';
      osc.frequency.value = 1200 + Math.random() * 800;
      osc.frequency.exponentialRampToValueAtTime(400, ac.currentTime + 0.2);
      g.gain.setValueAtTime(0.1, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25);
      osc.connect(g); g.connect(out);
      osc.start(); osc.stop(ac.currentTime + 0.3);
      nodes.push(osc, g);
    };

    drop();
    const interval = setInterval(drop, 400 + Math.random() * 800);
    return () => { clearInterval(interval); try { wind.stop(); } catch(e){} };
  },

  /* ════════════════════════════════════════════════
     8 — COSMIQUE: infinite pads
  ════════════════════════════════════════════════ */
  _playPad(ac, out, profile, palette, nodes) {
    const reverb = this._createReverb(ac, 12, 4);
    reverb.connect(out);
    nodes.push(reverb);

    const delay = ac.createDelay(5);
    delay.delayTime.value = 0.75;
    const delayGain = ac.createGain();
    delayGain.gain.value = 0.4;
    delay.connect(delayGain);
    delayGain.connect(reverb);
    nodes.push(delay, delayGain);

    const base = profile.baseFreq;
    const ratios = [1, 1.5, 2, 3, 4];
    const oscs = ratios.map((r, i) => {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = base * r;
      osc.detune.value = (Math.random() - 0.5) * 20;
      g.gain.value = 0.04 / (i + 1);
      const lfo = ac.createOscillator();
      const lfoG = ac.createGain();
      lfo.frequency.value = 0.02 + i * 0.01;
      lfoG.gain.value = 5;
      lfo.connect(lfoG); lfoG.connect(osc.detune);
      lfo.start();
      osc.connect(g); g.connect(reverb); g.connect(delay);
      osc.start();
      nodes.push(osc, g, lfo, lfoG);
      return osc;
    });

    return () => { for (const o of oscs) { try { o.stop(); } catch(e){} } };
  },

  /* ════════════════════════════════════════════════
     9 — NEURAL: glitch electronic
  ════════════════════════════════════════════════ */
  _playGlitch(ac, out, profile, palette, nodes) {
    const playGlitch = () => {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      // Bit-crushing effect via wave shaper
      const waveshaper = ac.createWaveShaper();
      const curve = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        const x = (i * 2) / 256 - 1;
        curve[i] = Math.sign(x) * Math.pow(Math.abs(x), 0.5);
      }
      waveshaper.curve = curve;

      osc.type = 'square';
      osc.frequency.value = profile.baseFreq * (0.25 + Math.random() * 4);
      const dur = 0.05 + Math.random() * 0.15;
      g.gain.setValueAtTime(0.15, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
      osc.connect(waveshaper); waveshaper.connect(g); g.connect(out);
      osc.start(); osc.stop(ac.currentTime + dur);
      nodes.push(osc, g, waveshaper);
    };

    glitchPlay();
    function glitchPlay() { playGlitch(); }
    const interval = setInterval(glitchPlay, 100 + Math.random() * 300);
    return () => clearInterval(interval);
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioEngine;
} else {
  window.AudioEngine = AudioEngine;
}
