import {
  EMPTY,
  type Observable,
  Subject,
  concat,
  map,
  merge,
  mergeMap,
  of,
  switchMap,
  tap,
  timer,
} from 'rxjs';
import { type IScorePop, NO_PAD } from './rhythm-game.state';

/** How long a score pop floats before it is removed (ms, design value). */
const POP_LIFETIME_MS = 900;

/** Where the effects report their results. */
export interface IGameEffectHandlers {
  /** A pad lights up, or `NO_PAD` when the light goes out. */
  readonly onLit: (pad: number) => void;
  readonly onPopAdded: (pop: IScorePop) => void;
  readonly onPopExpired: (id: number) => void;
}

/**
 * The rhythm game's timed side effects as RxJS streams: one cancellable sequence at a time (pattern
 * playback, pauses, loop playback), pad flashes, and fading score pops. `connect()` returns a
 * single stream for the view model's command handler, so `BaseComponent` owns the subscription.
 */
export class GameEffects {
  private readonly program$ = new Subject<Observable<unknown>>();
  private readonly flash$ = new Subject<{ readonly pad: number; readonly ms: number }>();
  private readonly pop$ = new Subject<IScorePop>();
  private popId = 0;

  /** Runs `program`, cancelling any sequence still playing. */
  public schedule(program: Observable<unknown>): void {
    this.program$.next(program);
  }

  /** Stops the sequence that is playing, if any. */
  public cancel(): void {
    this.program$.next(EMPTY);
  }

  /** Lights `pad` for `ms` milliseconds. */
  public flash(pad: number, ms: number): void {
    this.flash$.next({ pad, ms });
  }

  /** Floats `text` (e.g. "+10") above `pad`. */
  public pop(pad: number, text: string): void {
    this.popId += 1;
    this.pop$.next({ id: this.popId, pad, text });
  }

  /** @returns Every effect stream merged; subscribe once. */
  public connect(handlers: IGameEffectHandlers): Observable<unknown> {
    return merge(
      // switchMap: a new sequence (restart, mode change, next round) cancels the running one.
      this.program$.pipe(switchMap((program) => program)),
      // switchMap: the newest flash wins, so a pad never stays lit after a quicker tap.
      this.flash$.pipe(
        switchMap(({ pad, ms }) => concat(of(pad), timer(ms).pipe(map(() => NO_PAD)))),
        tap((pad) => {
          handlers.onLit(pad);
        }),
      ),
      // mergeMap: every pop fades on its own timer, independently of the others.
      this.pop$.pipe(
        tap((pop) => {
          handlers.onPopAdded(pop);
        }),
        mergeMap((pop) =>
          timer(POP_LIFETIME_MS).pipe(
            tap(() => {
              handlers.onPopExpired(pop.id);
            }),
          ),
        ),
      ),
    );
  }
}
