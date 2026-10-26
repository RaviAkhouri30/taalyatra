import { Injectable, computed, inject, signal } from '@angular/core';
import { type Observable, defer, merge, switchMap, tap, timer } from 'rxjs';
import { LocalStoreService } from '@core/services/local-store.service';
import { ViewModel } from '@shared/base/view-model';
import { NOW } from '@shared/tokens/now.token';
import { RANDOM } from '@shared/tokens/random.token';
import { DrumSoundPlayer } from './drum-sound';
import { GameEffects } from './game-effects';
import { HomeRhythmGameService } from './home-rhythm-game.service';
import { GameMessage, GameMode, GamePhase, type GameSpeed } from './rhythm-game.enums';
import { RhythmGameModel } from './rhythm-game.model';
import { type IGameState, MAX_LIVES, NO_PAD, initialGameState } from './rhythm-game.state';
import { type TapOutcome, evaluateTap, padFrom, stepMs } from './rhythm-rules';

/** Storage key of the best score (kept from the design for continuity). */
const BEST_SCORE_KEY = 'ty_best';
/** Timings from the design (ms). */
const TIMING = {
  leadIn: 650,
  flashMax: 320,
  flashGap: 120,
  tapFlash: 180,
  roundPause: 1000,
  missPause: 1100,
  playbackLeadIn: 200,
  playbackFlash: 160,
  playbackTail: 400,
} as const;

/**
 * Runs the rhythm game: state in a signal, rules from `rhythm-rules`, timing through
 * `GameEffects` (RxJS). Public methods are the user's commands.
 */
@Injectable()
export class HomeRhythmGameViewModel extends ViewModel<RhythmGameModel> {
  /** Read-only game state for the view. */
  public readonly game = computed(() => this.gameState());
  public readonly isChallenge = computed(() => this.game().mode === GameMode.Challenge);
  public readonly message = computed(() => this.data()?.message(this.game().status) ?? '');
  public readonly core = computed(() => this.data()?.core(this.game()));
  public readonly rank = computed(() => this.data()?.rank(this.game().score));
  public readonly hearts = computed(() =>
    Array.from({ length: MAX_LIVES }, (_, index) => index < this.game().lives),
  );
  public readonly isIdle = computed(() =>
    [GamePhase.Idle, GamePhase.Over].includes(this.game().phase),
  );
  public readonly canShare = computed(
    () => this.isChallenge() && this.game().phase === GamePhase.Over && this.game().score > 0,
  );
  public readonly shareUrl = computed(() => this.data()?.shareUrl(this.game().score) ?? '');

  private readonly gameService = inject(HomeRhythmGameService);
  private readonly sound = inject(DrumSoundPlayer);
  private readonly store = inject(LocalStoreService);
  private readonly random = inject(RANDOM);
  private readonly now = inject(NOW);
  private readonly effects = new GameEffects();
  private readonly gameState = signal<IGameState>(initialGameState(this.storedBest()));

  /** Starts (or restarts) a challenge with a one-beat pattern. */
  public start(): void {
    this.patch({ sequence: [this.nextPad()], score: 0, streak: 0, lives: MAX_LIVES, lit: NO_PAD });
    this.patch({ pops: [], recording: false });
    this.effects.schedule(this.showPattern());
  }

  public setMode(mode: GameMode): void {
    this.effects.cancel();
    const key = mode === GameMode.Jam ? GameMessage.JamIdle : GameMessage.Idle;
    this.patch({ mode, phase: GamePhase.Idle, lit: NO_PAD, pops: [], recording: false });
    this.patch({ status: { key } });
  }

  public setSpeed(speed: GameSpeed): void {
    this.patch({ speed });
  }

  /** Plays a pad; during a challenge turn it also counts as an answer. */
  public tap(pad: number): void {
    const game = this.game();
    if (game.mode === GameMode.Jam) {
      this.hit(pad, TIMING.tapFlash);
      if (game.recording) {
        this.patch({ beats: [...game.beats, { pad, at: this.now() - game.recordStart }] });
      }
      return;
    }
    if (game.phase === GamePhase.Show) {
      return;
    }
    this.hit(pad, TIMING.tapFlash);
    if (game.phase === GamePhase.Input) {
      this.apply(evaluateTap(game, pad, this.nextPad()), pad);
    }
  }

  public toggleRecording(): void {
    const { recording, beats } = this.game();
    if (recording) {
      this.patch({
        recording: false,
        status: { key: GameMessage.Saved, params: { count: beats.length } },
      });
    } else {
      this.patch({ recording: true, beats: [], recordStart: this.now() });
      this.patch({ status: { key: GameMessage.Recording } });
    }
  }

  /** Replays the recorded loop with its original timing. */
  public playBack(): void {
    const beats = this.game().beats;
    const first = beats.at(0);
    const last = beats.at(-1);
    if (!first || !last) {
      this.patch({ status: { key: GameMessage.NothingRecorded } });
      return;
    }
    this.patch({ recording: false, status: { key: GameMessage.Playing } });
    const hits = beats.map((beat) =>
      timer(TIMING.playbackLeadIn + beat.at - first.at).pipe(
        tap(() => {
          this.hit(beat.pad, TIMING.playbackFlash);
        }),
      ),
    );
    const done = timer(TIMING.playbackTail + last.at - first.at).pipe(
      tap(() => {
        this.patch({ status: { key: GameMessage.LoopFinished } });
      }),
    );
    this.effects.schedule(merge(...hits, done));
  }

  public clearRecording(): void {
    this.patch({ beats: [], recording: false, status: { key: GameMessage.Cleared } });
  }

  protected override attachViewHandler(): Observable<unknown> {
    return this.gameService.attachViewDataHandler().pipe(
      tap((dto) => {
        this.setData(new RhythmGameModel(dto));
      }),
    );
  }

  protected override attachCommandHandler(): Observable<unknown> {
    return this.effects.connect({
      onLit: (lit) => {
        this.patch({ lit });
      },
      onPopAdded: (pop) => {
        this.patch({ pops: [...this.game().pops, pop] });
      },
      onPopExpired: (id) => {
        this.patch({ pops: this.game().pops.filter((pop) => pop.id !== id) });
      },
    });
  }

  /** Plays the pattern beat by beat, then hands over to the player. */
  private showPattern(): Observable<unknown> {
    return defer(() => {
      const { sequence, speed } = this.game();
      const step = stepMs(speed, sequence.length);
      const flashMs = Math.min(TIMING.flashMax, step - TIMING.flashGap);
      this.patch({ phase: GamePhase.Show, position: 0, status: { key: GameMessage.Listen } });
      const beats = sequence.map((pad, index) =>
        timer(TIMING.leadIn + index * step).pipe(
          tap(() => {
            this.hit(pad, flashMs);
          }),
        ),
      );
      const handOver = timer(TIMING.leadIn + sequence.length * step).pipe(
        tap(() => {
          this.patch({
            phase: GamePhase.Input,
            position: 0,
            status: { key: GameMessage.YourTurn },
          });
        }),
      );
      return merge(...beats, handOver);
    });
  }

  private apply(outcome: TapOutcome, pad: number): void {
    switch (outcome.kind) {
      case 'progress':
        this.effects.pop(pad, '+1');
        this.patch({ position: outcome.position });
        return;
      case 'round':
        this.winRound(outcome, pad);
        return;
      case 'miss':
        this.patch({ lives: outcome.lives, streak: 0, phase: GamePhase.Show });
        this.patch({ status: { key: GameMessage.Miss, params: { lives: outcome.lives } } });
        this.replayAfter(TIMING.missPause);
        return;
      case 'over':
        this.endGame(outcome.level);
    }
  }

  private winRound(outcome: Extract<TapOutcome, { kind: 'round' }>, pad: number): void {
    const { gain, score, streak, sequence } = outcome;
    const best = Math.max(this.game().best, score);
    this.effects.pop(pad, `+${String(gain)}`);
    this.store.set(BEST_SCORE_KEY, String(best));
    this.patch({ score, streak, sequence, best, phase: GamePhase.Show });
    this.patch({ status: { key: GameMessage.RoundWon } });
    this.replayAfter(TIMING.roundPause);
  }

  private endGame(level: number): void {
    const key = this.data()?.gameOverMessage(this.game().score) ?? GameMessage.TryAgain;
    this.patch({ lives: 0, streak: 0, phase: GamePhase.Over, status: { key, params: { level } } });
  }

  /** Plays the (possibly extended) pattern again after a short pause. */
  private replayAfter(ms: number): void {
    this.effects.schedule(timer(ms).pipe(switchMap(() => this.showPattern())));
  }

  private hit(pad: number, ms: number): void {
    this.sound.play(pad);
    this.effects.flash(pad, ms);
  }

  private nextPad(): number {
    return padFrom(this.random());
  }

  private storedBest(): number {
    const best = Number.parseInt(this.store.get(BEST_SCORE_KEY) ?? '0', 10);
    return Number.isNaN(best) ? 0 : best;
  }

  private patch(changes: Partial<IGameState>): void {
    this.gameState.update((game) => ({ ...game, ...changes }));
  }
}
