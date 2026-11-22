import { Injectable, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  EMPTY,
  type Observable,
  Subject,
  catchError,
  exhaustMap,
  finalize,
  map,
  merge,
  of,
  switchMap,
  tap,
  timer,
} from 'rxjs';
import {
  AiError,
  IAiService,
  type IAiStatus,
  type IAiWriteRequest,
} from '@core/interfaces/i-ai-service';
import { ViewModel } from '@shared/base/view-model';
import { editorPageLabel } from '../models/ai-assist';
import { AI_UNDO_MS } from '../models/ai-choices';
import { EDITOR_TAB_ROUTE_KEY } from '../models/editor-nav.constants';

/**
 * One field's AI help (0025 V8): which help is set up, the request in flight, and the suggestion
 * or the failure. Nothing changes in the field until the owner uses a suggestion, and then the
 * owner's own text is kept for `AI_UNDO_MS`, so Undo can bring it back (0029).
 */
@Injectable()
export class AiAssistViewModel extends ViewModel<IAiStatus> {
  /** A request is on its way. */
  public readonly busy = signal(false);
  /** The latest suggestion, until the owner uses or dismisses it. */
  public readonly suggestion = signal<string | null>(null);
  /** What went wrong, in the owner's words; empty when nothing did. */
  public readonly error = signal('');
  /** The owner's text before a suggestion was used, while Undo is offered; `null` otherwise. */
  public readonly undo = signal<string | null>(null);
  /** The editor page's name, for the AI's context. */
  public readonly page = editorPageLabel(
    new Map(Object.entries(inject(ActivatedRoute).snapshot.data)).get(EDITOR_TAB_ROUTE_KEY),
  );

  private readonly ai = inject(IAiService);
  private readonly requests = new Subject<IAiWriteRequest>();
  /** The owner's text before each used suggestion, or `null` when Undo is taken or dropped. */
  private readonly undoable = new Subject<string | null>();
  private last: IAiWriteRequest | null = null;

  /**
   * Asks for a suggestion, replacing any shown.
   * @param request The field and what to do with it.
   */
  public ask(request: IAiWriteRequest): void {
    this.last = request;
    this.requests.next(request);
  }

  /** Asks again, the same way. */
  public tryAgain(): void {
    if (this.last) {
      this.ask(this.last);
    }
  }

  /** Hides the suggestion: the owner used it or kept their own. */
  public dismiss(): void {
    this.suggestion.set(null);
  }

  /**
   * The owner used the suggestion: it's hidden, and Undo is offered for a while.
   * @param before The field's text before it.
   */
  public used(before: string): void {
    this.dismiss();
    this.undoable.next(before);
  }

  /** Undo was taken, or is no longer wanted: it goes. */
  public dropUndo(): void {
    this.undoable.next(null);
  }

  protected override attachViewHandler(): Observable<unknown> {
    return this.ai.status().pipe(
      tap((status) => {
        this.setData(status);
      }),
    );
  }

  protected override attachCommandHandler(): Observable<unknown> {
    return merge(this.writes(), this.undos());
  }

  private undos(): Observable<unknown> {
    // switchMap: a newer use (or Undo itself) replaces the one waiting; each lasts AI_UNDO_MS.
    return this.undoable.pipe(
      switchMap((before) =>
        before === null ? of(null) : merge(of(before), timer(AI_UNDO_MS).pipe(map(() => null))),
      ),
      tap((before) => {
        this.undo.set(before);
      }),
    );
  }

  private writes(): Observable<unknown> {
    return this.requests.pipe(
      // exhaustMap: a second click while it writes is ignored, never a second request.
      exhaustMap((request) => {
        this.busy.set(true);
        this.error.set('');
        this.suggestion.set(null);
        this.undo.set(null);
        return this.ai.write(request).pipe(
          tap((text) => {
            this.suggestion.set(text);
          }),
          // Inside the exhaustMap, so one failure can't end the stream; the field is untouched.
          catchError((error: unknown) => {
            this.error.set(AiError.messageOf(error));
            return EMPTY;
          }),
          finalize(() => {
            this.busy.set(false);
          }),
        );
      }),
    );
  }
}
