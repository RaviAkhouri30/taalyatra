/** A pitched layer that sweeps from `from` to `to` Hz while fading out. */
export interface IToneLayer {
  readonly kind: 'tone';
  readonly wave: OscillatorType;
  readonly from: number;
  readonly to: number;
  /** Seconds. */
  readonly duration: number;
  readonly volume: number;
}

/** A burst of decaying noise through a band-pass filter. */
export interface INoiseLayer {
  readonly kind: 'noise';
  /** Seconds. */
  readonly duration: number;
  readonly volume: number;
  /** Filter centre, Hz. */
  readonly frequency: number;
  /** Seconds after the hit. */
  readonly offset: number;
}

export type DrumLayer = IToneLayer | INoiseLayer;

/** The four pad sounds as synthesis layers, by pad index (design values). */
export const DRUM_VOICES: readonly (readonly DrumLayer[])[] = [
  // 0 · Boom (bass)
  [
    { kind: 'tone', wave: 'sine', from: 170, to: 55, duration: 0.5, volume: 1 },
    { kind: 'tone', wave: 'triangle', from: 340, to: 110, duration: 0.12, volume: 0.35 },
    { kind: 'noise', duration: 0.05, volume: 0.25, frequency: 300, offset: 0 },
  ],
  // 1 · Tom (tone)
  [
    { kind: 'tone', wave: 'sine', from: 300, to: 140, duration: 0.35, volume: 0.85 },
    { kind: 'tone', wave: 'triangle', from: 600, to: 280, duration: 0.1, volume: 0.3 },
    { kind: 'noise', duration: 0.04, volume: 0.2, frequency: 900, offset: 0 },
  ],
  // 2 · Slap (snap)
  [
    { kind: 'noise', duration: 0.16, volume: 0.9, frequency: 2600, offset: 0 },
    { kind: 'tone', wave: 'square', from: 900, to: 500, duration: 0.05, volume: 0.1 },
  ],
  // 3 · Clap (hands)
  [
    { kind: 'noise', duration: 0.06, volume: 0.6, frequency: 1500, offset: 0 },
    { kind: 'noise', duration: 0.06, volume: 0.5, frequency: 1500, offset: 0.014 },
    { kind: 'noise', duration: 0.14, volume: 0.5, frequency: 1200, offset: 0.03 },
  ],
];
