import { GameMessage, GameMode, GamePhase, GameSpeed } from './rhythm-game.enums';

/** No pad lit. */
export const NO_PAD = -1;
/** Lives at the start of a challenge. */
export const MAX_LIVES = 3;

/** A status line: which message, with its placeholder values. */
export interface IStatus {
  readonly key: GameMessage;
  readonly params?: Readonly<Record<string, string | number>>;
}

/** A floating "+points" label above a pad. */
export interface IScorePop {
  readonly id: number;
  readonly pad: number;
  readonly text: string;
}

/** A recorded jam hit, `at` milliseconds after recording started. */
export interface IRecordedBeat {
  readonly pad: number;
  readonly at: number;
}

/** Everything the rhythm game remembers. */
export interface IGameState {
  readonly mode: GameMode;
  readonly speed: GameSpeed;
  readonly phase: GamePhase;
  /** Pad indexes to repeat, in order. */
  readonly sequence: readonly number[];
  /** How many beats of the sequence the player has repeated this round. */
  readonly position: number;
  readonly score: number;
  readonly best: number;
  readonly streak: number;
  readonly lives: number;
  /** Pad currently lit, or `NO_PAD`. */
  readonly lit: number;
  readonly pops: readonly IScorePop[];
  readonly recording: boolean;
  readonly recordStart: number;
  readonly beats: readonly IRecordedBeat[];
  readonly status: IStatus;
}

/** @returns The state before any play, keeping the stored best score. */
export function initialGameState(best: number): IGameState {
  return {
    mode: GameMode.Challenge,
    speed: GameSpeed.Groove,
    phase: GamePhase.Idle,
    sequence: [],
    position: 0,
    score: 0,
    best,
    streak: 0,
    lives: MAX_LIVES,
    lit: NO_PAD,
    pops: [],
    recording: false,
    recordStart: 0,
    beats: [],
    status: { key: GameMessage.Idle },
  };
}
