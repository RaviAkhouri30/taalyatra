/** Challenge (copy the pattern) or free jam (play and record). */
export enum GameMode {
  Challenge = 'challenge',
  Jam = 'jam',
}

/** Challenge tempo; faster speeds shorten every step. */
export enum GameSpeed {
  Chill = 'chill',
  Groove = 'groove',
  Pro = 'pro',
}

/** Where a challenge round is. */
export enum GamePhase {
  /** No round running. */
  Idle = 'idle',
  /** The pattern is being played to the player; taps are ignored. */
  Show = 'show',
  /** The player repeats the pattern. */
  Input = 'input',
  /** Out of lives. */
  Over = 'over',
}

/** Status line keys; their copy lives in the backend (`messages`). */
export enum GameMessage {
  Idle = 'idle',
  JamIdle = 'jamIdle',
  Listen = 'listen',
  YourTurn = 'yourTurn',
  RoundWon = 'roundWon',
  Miss = 'miss',
  GreatGame = 'greatGame',
  TryAgain = 'tryAgain',
  Recording = 'recording',
  Saved = 'saved',
  NothingRecorded = 'nothingRecorded',
  Playing = 'playing',
  LoopFinished = 'loopFinished',
  Cleared = 'cleared',
}
