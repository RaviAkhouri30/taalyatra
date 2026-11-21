import { Injectable, inject, signal } from '@angular/core';
import { EMPTY, type Observable, Subject, catchError, exhaustMap, finalize, tap } from 'rxjs';
import { AiError, IAiService, type IAiStatus } from '@core/interfaces/i-ai-service';
import { CLOCK } from '@core/tokens/clock.token';
import { ViewModel } from '@shared/base/view-model';
import { formatMoment } from '../models/editor-dates';
import { type Lead } from '../models/lead.model';
import { leadsSummary } from '../models/leads-summary';

/** An analysis, with when it was made and from how many leads. */
export interface ILeadsAnalysis {
  readonly text: string;
  readonly when: string;
  readonly count: number;
}

/**
 * Leads' AI analysis (0025 V12): sends the shown leads as counts only, and shows the answer. Not
 * stored: Analyse again for a fresh one.
 */
@Injectable()
export class LeadsAnalysisViewModel extends ViewModel<IAiStatus> {
  public readonly busy = signal(false);
  public readonly result = signal<ILeadsAnalysis | null>(null);
  /** What went wrong, in the owner's words; empty when nothing did. */
  public readonly error = signal('');

  private readonly ai = inject(IAiService);
  private readonly clock = inject(CLOCK);
  private readonly requests = new Subject<readonly Lead[]>();

  /** @param leads The leads to analyse. */
  public analyse(leads: readonly Lead[]): void {
    this.requests.next(leads);
  }

  protected override attachViewHandler(): Observable<unknown> {
    return this.ai.status().pipe(
      tap((status) => {
        this.setData(status);
      }),
    );
  }

  protected override attachCommandHandler(): Observable<unknown> {
    return this.requests.pipe(
      // exhaustMap: a second click while it analyses is ignored, never a second request.
      exhaustMap((leads) => {
        this.busy.set(true);
        this.error.set('');
        return this.ai.analyseLeads(leadsSummary(leads)).pipe(
          tap((text) => {
            const when = formatMoment(this.clock.now().toISOString());
            this.result.set({ text, when, count: leads.length });
          }),
          // Inside the exhaustMap, so one failure can't end the stream.
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
