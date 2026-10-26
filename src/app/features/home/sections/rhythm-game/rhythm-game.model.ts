import { formatTemplate } from '@shared/utils/format-template.util';
import { type IPadDto, type IRankDto, type IRhythmGameDto } from './i-rhythm-game';
import { GameMessage, GameMode, GamePhase, GameSpeed } from './rhythm-game.enums';
import { type IGameState, type IStatus } from './rhythm-game.state';
import { rankFor } from './rhythm-rules';

/** WhatsApp share endpoint (recipient chosen in WhatsApp). */
const WHATSAPP_SHARE_URL = 'https://wa.me/?text=';

/** A labelled choice for a segmented control. */
export interface IOption<T> {
  readonly value: T;
  readonly label: string;
}

/** A drum pad with its accessible name. */
export interface IPad extends IPadDto {
  readonly ariaLabel: string;
}

/** Text in the centre of the pad board. */
export interface ICoreDisplay {
  readonly top: string;
  readonly big: string;
  /** Pulses while the pattern is being shown. */
  readonly pulse: boolean;
}

/** Rhythm game copy plus the rules for turning game state into display text. */
export class RhythmGameModel {
  public readonly eyebrow: string;
  public readonly title: string;
  public readonly lead: string;
  public readonly modeLabel: string;
  public readonly speedLabel: string;
  public readonly modes: readonly IOption<GameMode>[];
  public readonly speeds: readonly IOption<GameSpeed>[];
  public readonly stats: IRhythmGameDto['stats'];
  public readonly livesLabel: string;
  public readonly rankLabel: string;
  public readonly pads: readonly IPad[];
  public readonly buttons: IRhythmGameDto['buttons'];

  public constructor(private readonly dto: IRhythmGameDto) {
    this.eyebrow = dto.eyebrow;
    this.title = dto.title;
    this.lead = dto.lead;
    this.modeLabel = dto.modeLabel;
    this.speedLabel = dto.speedLabel;
    this.modes = [
      { value: GameMode.Challenge, label: dto.modes.challenge },
      { value: GameMode.Jam, label: dto.modes.jam },
    ];
    this.speeds = [
      { value: GameSpeed.Chill, label: dto.speeds.chill },
      { value: GameSpeed.Groove, label: dto.speeds.groove },
      { value: GameSpeed.Pro, label: dto.speeds.pro },
    ];
    this.stats = dto.stats;
    this.livesLabel = dto.livesLabel;
    this.rankLabel = dto.rankLabel;
    this.pads = dto.pads.map((pad) => ({
      ...pad,
      ariaLabel: `${dto.padLabelPrefix} ${pad.label}`,
    }));
    this.buttons = dto.buttons;
  }

  /** @returns The status line for `status`, placeholders filled in. */
  public message(status: IStatus): string {
    const params = { ...status.params };
    if (typeof params['lives'] === 'number') {
      params['livesWord'] = params['lives'] === 1 ? this.dto.lifeWord.one : this.dto.lifeWord.other;
    }
    return formatTemplate(this.dto.messages[status.key], params);
  }

  /** @returns Whether a final score earns the congratulating game-over line. */
  public gameOverMessage(score: number): GameMessage {
    return score >= this.dto.greatGameMinScore ? GameMessage.GreatGame : GameMessage.TryAgain;
  }

  /** @returns The rank for `score`. */
  public rank(score: number): IRankDto | undefined {
    return rankFor(score, this.dto.ranks);
  }

  /** @returns A WhatsApp link that shares the score and rank. */
  public shareUrl(score: number): string {
    const text = formatTemplate(this.dto.shareText, { score, rank: this.rank(score)?.name ?? '' });
    return `${WHATSAPP_SHARE_URL}${encodeURIComponent(text)}`;
  }

  /** @returns What the centre of the board shows for `state`. */
  public core(state: IGameState): ICoreDisplay {
    const core = this.dto.core;
    if (state.mode === GameMode.Jam) {
      return { top: core.jam, big: state.recording ? core.rec : core.free, pulse: false };
    }
    switch (state.phase) {
      case GamePhase.Show:
        return { top: core.listen, big: String(state.sequence.length), pulse: true };
      case GamePhase.Input:
        return {
          top: core.yourTurn,
          big: `${String(state.position)}/${String(state.sequence.length)}`,
          pulse: false,
        };
      case GamePhase.Over:
        return { top: core.gameOver, big: String(state.score), pulse: false };
      case GamePhase.Idle:
        return { top: core.ready, big: core.tap, pulse: false };
    }
  }
}
