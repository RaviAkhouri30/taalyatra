import { type Observable, map, merge } from 'rxjs';
import { type IAfterLoadReport, type IAfterLoadSource } from '@core/interfaces/i-vitals-reporter';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { BrowserVisitSource } from './browser-visit-source';
import { BrowserVitalsSource } from './browser-vitals-source';

/**
 * The after-load chunk's entry: the visit, sent at once (0018), and the speed report, sent once
 * the page has settled (0012). Each decides for itself whether it's sent.
 */
export class BrowserAfterLoad implements IAfterLoadSource {
  private readonly visits: BrowserVisitSource;
  private readonly vitals: BrowserVitalsSource;

  /** @param view The browser window. */
  public constructor(view: Window) {
    this.visits = new BrowserVisitSource(view);
    this.vitals = new BrowserVitalsSource(view);
  }

  public reports(): Observable<IAfterLoadReport> {
    // merge: independent, and the visit mustn't wait the seconds the speed report does.
    return merge(
      this.visits.count().pipe(map((body) => ({ endpoint: ApiEndpoint.Visits, body }))),
      this.vitals.measure().pipe(map((body) => ({ endpoint: ApiEndpoint.Vitals, body }))),
    );
  }
}
