import { EMPTY, type Observable } from 'rxjs';
import { type IVitalsReporter } from '@core/interfaces/i-vitals-reporter';

/** Reports nothing (development, e2e and specs). */
export class FakeVitalsReporter implements IVitalsReporter {
  public markReady(): void {
    // Nothing is measured here.
  }

  public report(): Observable<void> {
    return EMPTY;
  }
}
