/**
 * A tiny generative audio engine — no assets, everything synthesized.
 * Ambient drone (two detuned oscillators through a low-pass) plus
 * short hover/click blips. Off by default; enabled by the header toggle.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambient: GainNode | null = null;
  private lastBlip = 0;
  enabled = false;

  private ensure() {
    if (this.ctx) return;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);

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

  hover() {
    if (!this.enabled || !this.ctx || !this.master) return;
    const now = performance.now();
    if (now - this.lastBlip < 70) return;
    this.lastBlip = now;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    const f = 900 + Math.random() * 500;
    osc.frequency.setValueAtTime(f, t);
    osc.frequency.exponentialRampToValueAtTime(f * 0.55, t + 0.09);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.055, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  click() {
    if (!this.enabled || !this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.16);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.09, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t);
    osc.stop(t + 0.22);
  }
}

export const audio = new AudioEngine();
