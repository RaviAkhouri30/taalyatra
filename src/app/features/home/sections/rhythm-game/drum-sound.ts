/**
 * Port for playing a drum pad's sound. The game depends on this abstraction, so tests can swap
 * in a silent fake and the synthesis technique can change without touching game logic.
 */
export abstract class DrumSoundPlayer {
  /** Plays pad `pad` (0 bass, 1 tone, 2 snap, 3 hands) immediately. */
  public abstract play(pad: number): void;
}
