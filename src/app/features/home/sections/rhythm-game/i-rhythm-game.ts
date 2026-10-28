import { type GameMessage, type GameMode, type GameSpeed } from './rhythm-game.enums';

/** A drum pad's visible label and sound hint. */
export interface IPadDto {
  readonly label: string;
  readonly sub: string;
}

/** A rank earned from `minScore` points upward. */
export interface IRankDto {
  readonly minScore: number;
  readonly name: string;
  /** Hint towards the next rank. */
  readonly next: string;
}

/** Rhythm game copy as stored in the backend (`home/rhythmGame`). All text is editable. */
export interface IRhythmGameDto {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly modeLabel: string;
  readonly modes: Readonly<Record<GameMode, string>>;
  readonly speedLabel: string;
  readonly speeds: Readonly<Record<GameSpeed, string>>;
  readonly stats: {
    readonly level: string;
    readonly score: string;
    readonly best: string;
    readonly streak: string;
  };
  readonly livesLabel: string;
  readonly rankLabel: string;
  /** Prefix of each pad's accessible name, e.g. "Drum pad" → "Drum pad Boom bass". */
  readonly padLabelPrefix: string;
  /** Exactly four pads, in sound order: bass, tone, snap, hands. */
  readonly pads: readonly IPadDto[];
  /** Ranks from highest to lowest. */
  readonly ranks: readonly IRankDto[];
  readonly core: Readonly<
    Record<'ready' | 'tap' | 'jam' | 'free' | 'rec' | 'listen' | 'yourTurn' | 'gameOver', string>
  >;
  readonly buttons: Readonly<
    Record<
      'start' | 'restart' | 'share' | 'book' | 'record' | 'stopRecording' | 'playBack' | 'clear',
      string
    >
  >;
  /** Status lines; may contain `{lives}`, `{livesWord}`, `{level}` or `{count}`. */
  readonly messages: Readonly<Record<GameMessage, string>>;
  readonly lifeWord: { readonly one: string; readonly other: string };
  /** Final score from which the game-over line congratulates instead of encourages. */
  readonly greatGameMinScore: number;
  /** WhatsApp share text with `{score}` and `{rank}`. */
  readonly shareText: string;
}
