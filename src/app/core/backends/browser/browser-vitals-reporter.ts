import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { EMPTY, Observable, catchError, map, switchMap } from 'rxjs';
import { IHttpBackend } from '@core/interfaces/i-http-backend';
import { type IVitalsReporter } from '@core/interfaces/i-vitals-reporter';
import { APP_PREVIEW } from '@core/tokens/app-preview.token';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { VITALS_SOURCE_LOADER } from './vitals-source-loader.token';
import { SITE_READY_MARK } from './vitals.constants';

/** How long after the page loads to fetch the measuring code, well clear of the visit's busy start. */
const AFTER_LOAD_MS = 3000;

/**
 * Sends one anonymous speed report per page load (0012). It waits until after the page has loaded
 * before even fetching the measuring code, so it can't delay the visit.
 */
export class BrowserVitalsReporter implements IVitalsReporter {
  private readonly document = inject(DOCUMENT);
  private readonly backend = inject(IHttpBackend);
  private readonly preview = inject(APP_PREVIEW);
  private readonly load = inject(VITALS_SOURCE_LOADER);

  public markReady(): void {
    this.document.defaultView?.performance.mark(SITE_READY_MARK);
  }

  public report(): Observable<void> {
    const view = this.document.defaultView;
    // Previews aren't real visits. The other checks are in the measuring chunk, to keep this file small.
    if (view === null || this.preview) {
      return EMPTY;
    }
    return this.afterLoad(view).pipe(
      // switchMap: each step emits once, so this only sequences "waited, loaded, measured, sent".
      switchMap(() => this.load(view)),
      switchMap((source) => source.measure()),
      switchMap((measured) => this.backend.post(ApiEndpoint.Vitals, measured)),
      map(() => undefined),
      // Nothing here may reach the visitor: no toast, no retry, no log.
      catchError(() => EMPTY),
    );
  }

  /** Plain listeners and timers, not RxJS helpers: this file is in what every visitor downloads. */
  private afterLoad(view: Window): Observable<void> {
    return new Observable<void>((subscriber) => {
      let timer = 0;
      const start = (): void => {
        timer = view.setTimeout(() => {
          subscriber.next();
          subscriber.complete();
        }, AFTER_LOAD_MS);
      };
      if (this.document.readyState === 'complete') {
        start();
      } else {
        view.addEventListener('load', start, { once: true });
      }
      return () => {
        view.removeEventListener('load', start);
        view.clearTimeout(timer);
      };
    });
  }
}
