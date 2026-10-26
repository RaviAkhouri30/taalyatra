import { GameSpeed } from './rhythm-game.enums';
import { type IRankDto } from './i-rhythm-game';
import { type IGameState } from './rhythm-game.state';

/** Pads on the board. */
export const PAD_COUNT = 4;

/** Step length per speed before the per-beat speed-up (design values, ms). */
const CHILL_STEP_MS = 820;
const GROOVE_STEP_MS = 620;
const PRO_STEP_MS = 430;
/** Each beat in the pattern shortens the step by this much… */
const SPEED_UP_PER_BEAT_MS = 14;
/** …down to this floor. */
const MIN_STEP_MS = 280;
/** Points per beat for completing a round, plus a bonus per streak. */
const POINTS_PER_BEAT = 10;
const POINTS_PER_STREAK = 5;

/** What one challenge tap did. */
export type TapOutcome =
  | { readonly kind: 'progress'; readonly position: number }
  | {
      readonly kind: 'round';
      readonly gain: number;
      readonly score: number;
      readonly streak: number;
      readonly sequence: readonly number[];
    }
  | { readonly kind: 'miss'; readonly lives: number }
  | { readonly kind: 'over'; readonly level: number };

/**
 * @param speed Chosen speed.
 * @param length Beats in the current pattern.
 * @returns Milliseconds between beats; longer patterns play faster.
 */
export function stepMs(speed: GameSpeed, length: number): number {
  const base = baseStepMs(speed);
  return Math.max(MIN_STEP_MS, base - length * SPEED_UP_PER_BEAT_MS);
}

/** @returns The step length for `speed` before any speed-up. */
function baseStepMs(speed: GameSpeed): number {
  switch (speed) {
    case GameSpeed.Chill:
      return CHILL_STEP_MS;
    case GameSpeed.Groove:
      return GROOVE_STEP_MS;
    case GameSpeed.Pro:
      return PRO_STEP_MS;
  }
}

/**
 * @param random A value in [0, 1).
 * @returns A pad index.
 */
export function padFrom(random: number): number {
  return Math.floor(random * PAD_COUNT);
}

/**
 * Applies a challenge tap made during the input phase.
 * @param state Current state (phase must be input).
 * @param pad Tapped pad.
 * @param nextPad Pad appended to the pattern if this tap completes the round.
 * @returns The outcome; the caller applies it to the state.
 */
export function evaluateTap(state: IGameState, pad: number, nextPad: number): TapOutcome {
  if (pad !== state.sequence[state.position]) {
    const lives = state.lives - 1;
    return lives > 0 ? { kind: 'miss', lives } : { kind: 'over', level: state.sequence.length };
  }
  const position = state.position + 1;
  if (position < state.sequence.length) {
    return { kind: 'progress', position };
  }
  const gain = state.sequence.length * POINTS_PER_BEAT + state.streak * POINTS_PER_STREAK;
  return {
    kind: 'round',
    gain,
    score: state.score + gain,
    streak: state.streak + 1,
    sequence: [...state.sequence, nextPad],
  };
}

/**
 * @param score Points scored.
 * @param ranks Ranks from highest to lowest.
 * @returns The highest rank reached (the lowest rank when none is reached).
 */
export function rankFor(score: number, ranks: readonly IRankDto[]): IRankDto | undefined {
  return ranks.find((rank) => score >= rank.minScore) ?? ranks.at(-1);
}
