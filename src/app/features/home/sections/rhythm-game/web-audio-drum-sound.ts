import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { RANDOM } from '@shared/tokens/random.token';
import { DrumSoundPlayer } from './drum-sound';
import { DRUM_VOICES, type INoiseLayer, type IToneLayer } from './drum-voices';

/** Small scheduling lead so the first samples are never cut off (s). */
const START_LEAD_S = 0.005;
/** Master volume of every hit. */
const MASTER_GAIN = 0.9;
/** Fraction of a tone's duration spent sweeping its pitch. */
const SWEEP_FRACTION = 0.8;
/** Exponential ramps cannot reach zero; fade to this instead. */
const SILENCE = 0.001;
/** Extra time before stopping an oscillator, so its fade completes (s). */
const STOP_TAIL_S = 0.02;
/** Band-pass filter resonance for noise layers. */
const NOISE_Q = 0.8;

/** Browsers that predate the standard name expose `webkitAudioContext`. */
type AudioWindow = typeof globalThis & { readonly webkitAudioContext?: typeof AudioContext };
/** Noise samples span [-1, 1): a [0, 1) random value times this, minus 1. */
const NOISE_SPAN = 2;
/** Exponent of the noise burst's decay curve (2 = quadratic). */
const DECAY_EXPONENT = 2;

/**
 * Synthesises the drum sounds with the Web Audio API — no audio files to download. The context
 * is created on the first hit (browsers only allow audio after a user gesture). Fails silently
 * where audio is unavailable: sound is an enhancement, not a requirement.
 */
export class WebAudioDrumSound extends DrumSoundPlayer {
  private readonly window = inject(DOCUMENT).defaultView as AudioWindow | null;
  private readonly random = inject(RANDOM);
  private context: AudioContext | null = null;

  public play(pad: number): void {
    const context = this.ensureContext();
    const layers = DRUM_VOICES.at(pad);
    if (!context || !layers) {
      return;
    }
    const start = context.currentTime + START_LEAD_S;
    const out = context.createGain();
    out.gain.value = MASTER_GAIN;
    out.connect(context.destination);
    for (const layer of layers) {
      if (layer.kind === 'tone') {
        this.tone(context, out, start, layer);
      } else {
        this.noise(context, out, start, layer);
      }
    }
  }

  private ensureContext(): AudioContext | null {
    if (!this.context) {
      const Context = this.window?.AudioContext ?? this.window?.webkitAudioContext;
      this.context = Context ? new Context() : null;
    }
    if (this.context?.state === 'suspended') {
      void this.context.resume(); // fire-and-forget: later hits play once resumed
    }
    return this.context;
  }

  private tone(context: AudioContext, out: AudioNode, start: number, layer: IToneLayer): void {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = layer.wave;
    oscillator.frequency.setValueAtTime(layer.from, start);
    oscillator.frequency.exponentialRampToValueAtTime(
      layer.to,
      start + layer.duration * SWEEP_FRACTION,
    );
    gain.gain.setValueAtTime(layer.volume, start);
    gain.gain.exponentialRampToValueAtTime(SILENCE, start + layer.duration);
    oscillator.connect(gain).connect(out);
    oscillator.start(start);
    oscillator.stop(start + layer.duration + STOP_TAIL_S);
  }

  private noise(context: AudioContext, out: AudioNode, start: number, layer: INoiseLayer): void {
    const length = Math.max(1, Math.floor(context.sampleRate * layer.duration));
    const buffer = context.createBuffer(1, length, context.sampleRate);
    // White noise shaped by a quadratic decay, so the burst fades naturally.
    buffer
      .getChannelData(0)
      .set(
        Array.from(
          { length },
          (_, index) => (this.random() * NOISE_SPAN - 1) * (1 - index / length) ** DECAY_EXPONENT,
        ),
      );
    const source = context.createBufferSource();
    source.buffer = buffer;
    const filter = context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = layer.frequency;
    filter.Q.value = NOISE_Q;
    const gain = context.createGain();
    gain.gain.value = layer.volume;
    source.connect(filter).connect(gain).connect(out);
    source.start(start + layer.offset);
  }
}
