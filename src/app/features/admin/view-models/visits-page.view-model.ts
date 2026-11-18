import { Injectable, computed, inject, signal } from '@angular/core';
import { EMPTY, type Observable, catchError, forkJoin, map, tap } from 'rxjs';
import { LoggerService } from '@core/services/logger.service';
import { ViewModel } from '@shared/base/view-model';
import { CHART_PERIOD_CHOICES, ChartPeriod } from '../models/chart';
import { type Lead } from '../models/lead.model';
import { VisitsPageModel } from '../models/visits-page.model';
import { LeadsService } from '../services/leads.service';
import { VisitsService } from '../services/visits.service';

/** The period switch's choices, in order. */
export const CHART_PERIODS = CHART_PERIOD_CHOICES;

function byDay(leads: readonly Lead[]): Map<string, number> {
  const days = new Map<string, number>();
  for (const lead of leads) {
    if (lead.day) {
      days.set(lead.day, (days.get(lead.day) ?? 0) + 1);
    }
  }
  return days;
}

/** The Visits page (0018 V11): visits and proposals by day, week, month or year. */
@Injectable()
export class VisitsPageViewModel extends ViewModel<VisitsPageModel> {
  public readonly period = signal(ChartPeriod.Day);
  public readonly failed = signal(false);
  public readonly visits = computed(() => this.data()?.visitsChart(this.period()) ?? null);
  public readonly proposals = computed(() => this.data()?.proposalsChart(this.period()) ?? null);
  public readonly pages = computed(() => this.data()?.pages(this.period()) ?? []);
  public readonly devices = computed(() => this.data()?.devices(this.period()) ?? []);

  private readonly visitsService = inject(VisitsService);
  private readonly leads = inject(LeadsService);
  private readonly logger = inject(LoggerService);

  /** @param period How the graphs group. */
  public show(period: ChartPeriod): void {
    this.period.set(period);
  }

  protected override attachViewHandler(): Observable<unknown> {
    // forkJoin: two independent reads, both needed for the page.
    return forkJoin([this.visitsService.load(), this.leads.leads()]).pipe(
      map(([history, leads]) => new VisitsPageModel(history.days, byDay(leads), history.today)),
      tap((page) => {
        this.setData(page);
      }),
      catchError((error: unknown) => {
        this.logger.error('Visits failed to load', error);
        this.failed.set(true);
        return EMPTY;
      }),
    );
  }
}
