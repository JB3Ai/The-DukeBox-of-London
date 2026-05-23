// JukeBox Audio Engine — Web Audio API Synthesizer
// Generates phase-aware electronic music: kicks, hats, bass, pads, FX

const PHASE_PRESETS = {
  1: { // PEAK-BASS: Warehouse techno, neurofunk, hard kicks
    kick:    { freq: 55, decay: 0.3, punch: 1.0, dist: 0.6 },
    hat:     { freq: 8000, decay: 0.05, volume: 0.35, openDecay: 0.15 },
    bass:    { type: 'sawtooth', filterFreq: 400, resonance: 8, decay: 0.15, oct: -1 },
    pad:     { type: 'sawtooth', filterFreq: 1200, detune: 15, volume: 0.08 },
    pattern: 'hard',
  },
  2: { // MAIN-FLOOR: Deep house, tech house, groove
    kick:    { freq: 50, decay: 0.35, punch: 0.7, dist: 0.3 },
    hat:     { freq: 7000, decay: 0.06, volume: 0.25, openDecay: 0.18 },
    bass:    { type: 'square', filterFreq: 300, resonance: 5, decay: 0.2, oct: -1 },
    pad:     { type: 'triangle', filterFreq: 2000, detune: 8, volume: 0.12 },
    pattern: 'groove',
  },
  3: { // SUNRISE: Organic, breakbeat, balearic
    kick:    { freq: 48, decay: 0.4, punch: 0.4, dist: 0.1 },
    hat:     { freq: 6000, decay: 0.08, volume: 0.18, openDecay: 0.25 },
    bass:    { type: 'sine', filterFreq: 250, resonance: 3, decay: 0.3, oct: 0 },
    pad:     { type: 'sine', filterFreq: 3000, detune: 5, volume: 0.18 },
    pattern: 'organic',
  },
  4: { // ZONED-OUT: Ambient, trip-hop, lo-fi
    kick:    { freq: 42, decay: 0.5, punch: 0.2, dist: 0.0 },
    hat:     { freq: 5000, decay: 0.12, volume: 0.10, openDecay: 0.3 },
    bass:    { type: 'sine', filterFreq: 200, resonance: 2, decay: 0.5, oct: 0 },
    pad:     { type: 'sine', filterFreq: 4000, detune: 3, volume: 0.25 },
    pattern: 'ambient',
  },
};

// Scale notes (minor pentatonic) per phase
const SCALES = {
  dark:      [0, 3, 5, 7, 10],        // A minor pentatonic
  balanced:  [0, 2, 4, 7, 9],          // A major pentatonic
  uplifting: [0, 2, 4, 5, 7, 9, 11],   // A major scale
};

// Step-sequencer patterns (16 steps) — 1=hit, 0=rest
const PATTERNS = {
  hard: {
    kick: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    hat:  [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
    bass: [1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0],
    open: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
  },
  groove: {
    kick: [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,1,0],
    hat:  [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1],
    bass: [1,0,0,0, 1,0,0,0, 1,0,0,1, 0,0,0,0],
    open: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
  },
  organic: {
    kick: [1,0,0,0, 0,0,1,0, 0,0,1,0, 0,0,0,0],
    hat:  [0,0,1,0, 0,1,0,0, 0,0,1,0, 0,1,0,0],
    bass: [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,1],
    open: [0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,1],
  },
  ambient: {
    kick: [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    hat:  [0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0],
    bass: [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    open: [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
  },
};

class JukeBoxEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.bassFilter = null;
    this.trebleFilter = null;
    this.analyser = null;
    this.compressor = null;
    this.isPlaying = false;
    this.phase = 1;
    this.bpm = 128;
    this.atmosphere = 'balanced';
    this.stepIndex = 0;
    this.timerID = null;
    this.nextStepTime = 0;
    this.scheduleAheadTime = 0.1;
    this.lookahead = 25; // ms
    this.bassNoteIndex = 0;
    this.padNodes = [];
    this._initialized = false;
  }

  async init() {
    if (this._initialized) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();

    // Master chain: source -> compressor -> bass EQ -> treble EQ -> master gain -> analyser -> destination
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -24;
    this.compressor.knee.value = 12;
    this.compressor.ratio.value = 4;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.15;

    this.bassFilter = this.ctx.createBiquadFilter();
    this.bassFilter.type = 'lowshelf';
    this.bassFilter.frequency.value = 200;
    this.bassFilter.gain.value = 0;

    this.trebleFilter = this.ctx.createBiquadFilter();
    this.trebleFilter.type = 'highshelf';
    this.trebleFilter.frequency.value = 3000;
    this.trebleFilter.gain.value = 0;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.7;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;

    this.compressor.connect(this.bassFilter);
    this.bassFilter.connect(this.trebleFilter);
    this.trebleFilter.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this._initialized = true;
  }

  getAnalyserData() {
    if (!this.analyser) return new Uint8Array(128);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  setBass(value) {
    // value 0-100 -> gain -12 to +12 dB
    if (this.bassFilter) {
      this.bassFilter.gain.value = (value - 50) * 0.24;
    }
  }

  setTreble(value) {
    if (this.trebleFilter) {
      this.trebleFilter.gain.value = (value - 50) * 0.24;
    }
  }

  setVolume(value) {
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.05);
    }
  }

  setPhase(phase) {
    this.phase = phase;
    this._updatePad();
  }

  setAtmosphere(atmo) {
    this.atmosphere = atmo;
    this._updatePad();
  }

  setBpm(bpm) {
    this.bpm = Math.max(60, Math.min(180, bpm));
  }

  _midiToFreq(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  _getScale() {
    return SCALES[this.atmosphere] || SCALES.balanced;
  }

  _getPreset() {
    return PHASE_PRESETS[this.phase] || PHASE_PRESETS[1];
  }

  _getPattern() {
    const preset = this._getPreset();
    return PATTERNS[preset.pattern] || PATTERNS.hard;
  }

  // --- Kick Drum Synthesis ---
  _playKick(time) {
    const p = this._getPreset().kick;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(p.freq * 4 * p.punch, time);
    osc.frequency.exponentialRampToValueAtTime(p.freq, time + 0.04);

    gain.gain.setValueAtTime(0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + p.decay);

    // Distortion via waveshaper for heavier phases
    if (p.dist > 0.1) {
      const ws = this.ctx.createWaveShaper();
      const k = p.dist * 100;
      const curve = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        const x = (i * 2) / 256 - 1;
        curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x));
      }
      ws.curve = curve;
      osc.connect(ws);
      ws.connect(gain);
    } else {
      osc.connect(gain);
    }

    gain.connect(this.compressor);
    osc.start(time);
    osc.stop(time + p.decay + 0.05);
  }

  // --- Hi-Hat Synthesis (noise-based) ---
  _playHat(time, isOpen = false) {
    const p = this._getPreset().hat;
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const hpf = this.ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = p.freq;

    const bpf = this.ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = p.freq + 2000;
    bpf.Q.value = 1.5;

    const gain = this.ctx.createGain();
    const dec = isOpen ? p.openDecay : p.decay;
    gain.gain.setValueAtTime(p.volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dec);

    noise.connect(hpf);
    hpf.connect(bpf);
    bpf.connect(gain);
    gain.connect(this.compressor);

    noise.start(time);
    noise.stop(time + dec + 0.02);
  }

  // --- Bass Synth ---
  _playBass(time) {
    const p = this._getPreset().bass;
    const scale = this._getScale();
    const rootNote = 33 + (p.oct * 12); // A1
    const noteOffset = scale[this.bassNoteIndex % scale.length];
    const freq = this._midiToFreq(rootNote + noteOffset);

    const osc = this.ctx.createOscillator();
    osc.type = p.type;
    osc.frequency.setValueAtTime(freq, time);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(p.filterFreq * 2, time);
    filter.frequency.exponentialRampToValueAtTime(p.filterFreq * 0.5, time + p.decay);
    filter.Q.value = p.resonance;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.setValueAtTime(0.4, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + p.decay + 0.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);

    osc.start(time);
    osc.stop(time + p.decay + 0.15);

    this.bassNoteIndex++;
  }

  // --- Pad (continuous drone that changes with phase/atmosphere) ---
  _updatePad() {
    if (!this.isPlaying || !this.ctx) return;
    this._stopPad();
    this._startPad();
  }

  _startPad() {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const p = this._getPreset().pad;
    const scale = this._getScale();
    const root = 57; // A3

    // Create 3 detuned oscillators for richness
    const chordNotes = [
      root + scale[0],
      root + scale[2 % scale.length],
      root + scale[4 % scale.length],
    ];

    this.padNodes = [];
    const padGain = this.ctx.createGain();
    padGain.gain.value = 0;
    padGain.gain.linearRampToValueAtTime(p.volume, this.ctx.currentTime + 2);

    const padFilter = this.ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = p.filterFreq;
    padFilter.Q.value = 1;

    chordNotes.forEach((note, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = p.type;
      osc.frequency.value = this._midiToFreq(note);
      osc.detune.value = (i - 1) * p.detune;
      osc.connect(padFilter);
      osc.start();
      this.padNodes.push(osc);
    });

    padFilter.connect(padGain);
    padGain.connect(this.compressor);
    this.padNodes.push(padFilter, padGain);
  }

  _stopPad() {
    this.padNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        node.disconnect();
      } catch (e) { console.warn('Pad node cleanup:', e.message); }
    });
    this.padNodes = [];
  }

  // --- Sequencer ---
  _scheduler() {
    const secondsPerBeat = 60.0 / this.bpm;
    const secondsPerStep = secondsPerBeat / 4; // 16th notes

    while (this.nextStepTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this._scheduleStep(this.stepIndex, this.nextStepTime);
      this.nextStepTime += secondsPerStep;
      this.stepIndex = (this.stepIndex + 1) % 16;
    }
  }

  _scheduleStep(step, time) {
    const pat = this._getPattern();

    if (pat.kick[step]) this._playKick(time);
    if (pat.hat[step]) this._playHat(time, false);
    if (pat.open[step]) this._playHat(time, true);
    if (pat.bass[step]) this._playBass(time);
  }

  // --- Transport ---
  async play() {
    await this.init();
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.stepIndex = 0;
    this.nextStepTime = this.ctx.currentTime + 0.05;
    this.bassNoteIndex = 0;

    this._startPad();
    this.timerID = setInterval(() => this._scheduler(), this.lookahead);
  }

  stop() {
    this.isPlaying = false;
    if (this.timerID) {
      clearInterval(this.timerID);
      this.timerID = null;
    }
    this._stopPad();
  }

  // --- Cross-fade between two phases ---
  // blendFactor: 0 = fully fromPhase, 1 = fully toPhase
  setCrossfade(fromPhase, toPhase, blendFactor) {
    this.phase = blendFactor > 0.5 ? toPhase : fromPhase;
    // Blend the volume envelope aggressiveness
    if (this.masterGain && this.ctx) {
      // Slight volume dip in the middle of the crossfade for smooth transition
      const dip = 1 - (Math.sin(blendFactor * Math.PI) * 0.15);
      this.masterGain.gain.setTargetAtTime(0.7 * dip, this.ctx.currentTime, 0.1);
    }
    this._updatePad();
  }

  destroy() {
    this.stop();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this._initialized = false;
  }
}

// Singleton instance
let engineInstance = null;

export function getEngine() {
  if (!engineInstance) {
    engineInstance = new JukeBoxEngine();
  }
  return engineInstance;
}

export default JukeBoxEngine;
