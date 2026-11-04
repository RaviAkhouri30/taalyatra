import { Injectable, inject, signal } from '@angular/core';
import { EMPTY, type Observable, Subject, catchError, exhaustMap, finalize, tap } from 'rxjs';
import { LoggerService } from '@core/services/logger.service';
import { ViewModel } from '@shared/base/view-model';
import { type SpeedReportModel } from '../models/speed-report.model';
import { SpeedReportService } from '../services/speed-report.service';

/** The dashboard's speed report: read only when asked for, so it costs nothing otherwise. */
@Injectable()
export class SpeedReportViewModel extends ViewModel<SpeedReportModel> {
  public readonly loading = signal(false);
  public readonly failed = signal(false);

  private readonly reports = inject(SpeedReportService);
  private readonly logger = inject(LoggerService);
  private readonly requests = new Subject<void>();

  public load(): void {
    this.requests.next();
  }

  protected override attachCommandHandler(): Observable<unknown> {
    // exhaustMap: a second click while it's loading is ignored.
    return this.requests.pipe(exhaustMap(() => this.read()));
  }

  private read(): Observable<unknown> {
    this.loading.set(true);
    this.failed.set(false);
    return this.reports.load().pipe(
      tap((report) => {
        this.setData(report);
      }),
      // Inside the exhaustMap, so a failure can't end the stream for the next try.
      catchError((error: unknown) => {
        this.logger.error('Speed report failed to load', error);
        this.failed.set(true);
        return EMPTY;
      }),
      finalize(() => {
        this.loading.set(false);
      }),
    );
  }
}
