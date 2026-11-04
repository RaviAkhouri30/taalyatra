import { inject } from '@angular/core';
import { BrowserVitalsReporter } from '@core/backends/browser/browser-vitals-reporter';
import { FakeVitalsReporter } from '@core/backends/fake/fake-vitals-reporter';
import { type IVitalsReporter } from '@core/interfaces/i-vitals-reporter';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';

/**
 * Picks the reporter: real for builds that report, otherwise one that does nothing.
 * @returns The active reporter.
 */
export function vitalsReporterFactory(): IVitalsReporter {
  return inject(APP_ENVIRONMENT).reportVitals
    ? new BrowserVitalsReporter()
    : new FakeVitalsReporter();
}
