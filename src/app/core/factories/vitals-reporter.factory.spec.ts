import { TestBed } from '@angular/core/testing';
import { BrowserVitalsReporter } from '@core/backends/browser/browser-vitals-reporter';
import { FakeVitalsReporter } from '@core/backends/fake/fake-vitals-reporter';
import { IHttpBackend } from '@core/interfaces/i-http-backend';
import { IVitalsReporter } from '@core/interfaces/i-vitals-reporter';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { environment } from '@env/environment';
import { vitalsReporterFactory } from './vitals-reporter.factory';

describe('vitalsReporterFactory', () => {
  it.each([
    ['the real reporter for a build that reports', true, BrowserVitalsReporter],
    ['the fake for one that does not', false, FakeVitalsReporter],
  ])('should provide %s', (_case, reportVitals, adapter) => {
    TestBed.configureTestingModule({
      providers: [
        { provide: APP_ENVIRONMENT, useValue: { ...environment, reportVitals } },
        { provide: IHttpBackend, useValue: {} },
        { provide: IVitalsReporter, useFactory: vitalsReporterFactory },
      ],
    });

    expect(TestBed.inject(IVitalsReporter)).toBeInstanceOf(adapter);
  });
});
