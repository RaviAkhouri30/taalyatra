import { Injectable, inject, signal } from '@angular/core';
import { type Observable, Subject, catchError, exhaustMap, map, of, tap } from 'rxjs';
import { IClipboardService } from '@core/interfaces/i-clipboard-service';
import { ViewModel } from '@shared/base/view-model';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { ToastService } from '@shared/services/toast.service';
import { type ICopyRequest } from './i-copy-request';

/** Copies a text on request and confirms with a toast; also owns the tooltip's visibility. */
@Injectable()
export class CopyTextViewModel extends ViewModel<never> {
  /** Whether the full-text tooltip is showing. */
  public readonly tooltipVisible = signal(false);

  private readonly clipboard = inject(IClipboardService);
  private readonly toast = inject(ToastService);
  private readonly requests = new Subject<ICopyRequest>();

  /** Copies `request.text`, then shows the matching toast. */
  public copy(request: ICopyRequest): void {
    this.requests.next(request);
  }

  public showTooltip(): void {
    this.tooltipVisible.set(true);
  }

  public hideTooltip(): void {
    this.tooltipVisible.set(false);
  }

  protected override attachCommandHandler(): Observable<unknown> {
    return this.requests.pipe(
      // exhaustMap: clicks while a copy is in flight are ignored, so one click means one toast.
      exhaustMap((request) =>
        this.clipboard.copy(request.text).pipe(
          map(() => ({ text: request.copied, tone: ToastTone.Success })),
          catchError(() => of({ text: request.failed, tone: ToastTone.Error })),
        ),
      ),
      tap(({ text, tone }) => {
        this.toast.show(text, tone);
      }),
    );
  }
}
