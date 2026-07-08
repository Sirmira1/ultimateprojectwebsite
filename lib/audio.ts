/**
 * A tiny generative audio engine — no assets, everything synthesized.
 * Ambient drone (two detuned oscillators through a low-pass) plus
 * short hover/click blips. Off by default; enabled by the header toggle.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambient: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private freqData: Uint8Array<ArrayBuffer> | null = null;
  private lastBlip = 0;
  enabled = false;

  private ensure() {
    if (this.ctx) return;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);

    // analyser tap — lets the particle field breathe with the sound
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 128;
    this.analyser.smoothingTimeConstant = 0.85;
    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.master.connect(this.analyser);

    // ambient bed
    const amb = this.ctx.createGain();
    amb.gain.value = 0.05;
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 240;
    lp.connect(amb);
    amb.connect(this.master);

    for (const [freq, type] of [
      [55, "triangle"],
      [55.6, "sine"],
      [110.3, "sine"],
    ] as const) {
      const osc = this.ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      const g = this.ctx.createGain();
      g.gain.value = freq > 100 ? 0.25 : 0.6;
      osc.connect(g);
      g.connect(lp);
      osc.start();
    }

    // slow breathing on the ambient level
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain);
    lfoGain.connect(amb.gain);
    lfo.start();

    this.ambient = amb;
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    this.ensure();
    if (!this.ctx || !this.master) return this.enabled;
    if (this.ctx.state === "suspended") void this.ctx.resume();
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(this.enabled ? 0.8 : 0, t, 0.4);
    return this.enabled;
  }

  /** Current output level 0..1 — 0 when sound is off. */
  level(): number {
    if (!this.enabled || !this.analyser || !this.freqData) return 0;
    this.analyser.getByteFrequencyData(this.freqData);
    // the drone lives in the low bins; blips reach higher — weigh both
    let sum = 0;
    const n = Math.min(24, this.freqData.length);
    for (let i = 0; i < n; i++) sum += this.freqData[i];
    return Math.min((sum / n / 255) * 2.2, 1);
  }

  /** A soft, felt "tup" — low, quiet, almost subliminal. */
  hover() {
    if (!this.enabled || !this.ctx || !this.master) return;
    const now = performance.now();
    if (now - this.lastBlip < 140) return;
    this.lastBlip = now;
    const t = this.ctx.currentTime;
    const f = 175 + Math.random() * 30;
    for (const [freq, gain] of [
      [f, 0.026],
      [f * 1.5, 0.009],
    ] as const) {
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.82, t + 0.07);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
      osc.connect(g);
      g.connect(this.master);
      osc.start(t);
      osc.stop(t + 0.09);
    }
  }

  /** A muted thump, like a key on a felted piano. */
  click() {
    if (!this.enabled || !this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(135, t);
    osc.frequency.exponentialRampToValueAtTime(85, t + 0.12);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.05, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t);
    osc.stop(t + 0.18);
  }
}

export const audio = new AudioEngine();
