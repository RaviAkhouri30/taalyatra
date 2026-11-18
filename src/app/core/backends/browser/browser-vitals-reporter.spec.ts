import { DOCUMENT } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { EMPTY, Subject, of, throwError } from 'rxjs';
import { IHttpBackend } from '@core/interfaces/i-http-backend';
import { type IAfterLoadReport, type IVitalsMeasurement } from '@core/interfaces/i-vitals-reporter';
import { APP_PREVIEW } from '@core/tokens/app-preview.token';
import { BrowserVitalsReporter } from './browser-vitals-reporter';
import { AFTER_LOAD_LOADER } from './after-load-loader.token';

describe('BrowserVitalsReporter', () => {
  const measured: IVitalsMeasurement = {
    page: '/shows',
    device: 'phone',
    connection: '4g',
    lcp: 1200,
    fcp: 800,
    ttfb: 100,
    ready: 900,
    cls: 0,
  };
  const speed: IAfterLoadReport = { endpoint: 'vitals', body: measured };
  const visit: IAfterLoadReport = { endpoint: 'visits', body: { page: '/shows', device: 'phone' } };

  interface IOptions {
    readonly preview?: boolean;
    readonly readyState?: string;
  }

  function setUp(options: IOptions = {}) {
    const post = vi.fn(() => of(new HttpResponse({ status: 201 })));
    const load = vi.fn(() => of({ reports: () => of<IAfterLoadReport>(speed) }));
    const mark = vi.fn();
    const events = new EventTarget();
    const clearTimeout = vi.fn();
    const view = {
      performance: { mark },
      addEventListener: events.addEventListener.bind(events),
      removeEventListener: events.removeEventListener.bind(events),
      setTimeout: (done: () => void) => {
        done();
        return 1;
      },
      clearTimeout,
    };
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DOCUMENT,
          useValue: {
            defaultView: view,
            readyState: options.readyState ?? 'complete',
            querySelector: () => null,
            querySelectorAll: () => [],
          },
        },
        { provide: IHttpBackend, useValue: { post } },
        { provide: APP_PREVIEW, useValue: options.preview ?? false },
        { provide: AFTER_LOAD_LOADER, useValue: load },
      ],
    });
    const reporter = TestBed.runInInjectionContext(() => new BrowserVitalsReporter());
    return { reporter, post, load, mark, events, clearTimeout };
  }

  it('should send one report, with the page and no more than was measured', () => {
    const { reporter, post } = setUp();

    reporter.report().subscribe();

    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith('vitals', measured);
  });

  it('should send the visit and the speed report each to its own place', () => {
    const { reporter, post, load } = setUp();
    load.mockReturnValue(of({ reports: () => of(visit, speed) }));

    reporter.report().subscribe();

    expect(post.mock.calls).toEqual([
      ['visits', visit.body],
      ['vitals', measured],
    ]);
  });

  it('should still send the speed report when the visit fails to send', () => {
    const { reporter, post, load } = setUp();
    load.mockReturnValue(of({ reports: () => of(visit, speed) }));
    post.mockReturnValueOnce(throwError(() => new Error('offline')));
    const complete = vi.fn();

    reporter.report().subscribe({ complete });

    expect(post).toHaveBeenLastCalledWith('vitals', measured);
    expect(complete).toHaveBeenCalled();
  });

  it('should note when the site data arrives', () => {
    const { reporter, mark } = setUp();

    reporter.markReady();

    expect(mark).toHaveBeenCalledWith('site-ready');
  });

  it('should send nothing, or even load the code, for a preview', () => {
    const { reporter, post, load } = setUp({ preview: true });

    reporter.report().subscribe();

    expect(load).not.toHaveBeenCalled();
    expect(post).not.toHaveBeenCalled();
  });

  it('should send nothing when the measuring code finds it should not report', () => {
    const { reporter, post, load } = setUp();
    load.mockReturnValue(of({ reports: () => EMPTY }));

    reporter.report().subscribe();

    expect(post).not.toHaveBeenCalled();
  });

  it('should wait for the page to load before doing anything', () => {
    const { reporter, load, events } = setUp({ readyState: 'loading' });

    reporter.report().subscribe();
    expect(load).not.toHaveBeenCalled();

    events.dispatchEvent(new Event('load'));

    expect(load).toHaveBeenCalledTimes(1);
  });

  it('should release its timer when it is stopped', () => {
    const { reporter, clearTimeout } = setUp();

    reporter.report().subscribe().unsubscribe();

    expect(clearTimeout).toHaveBeenCalled();
  });

  it.each([
    ['loading the code', 'load'],
    ['sending', 'post'],
  ] as const)('should stay silent when %s fails', (_case, step) => {
    const context = setUp();
    context[step].mockReturnValue(throwError(() => new Error('offline')));
    const error = vi.fn();
    const complete = vi.fn();

    context.reporter.report().subscribe({ error, complete });

    expect(error).not.toHaveBeenCalled();
    expect(complete).toHaveBeenCalled();
  });

  it('should keep waiting while the measurement is not ready', () => {
    const context = setUp();
    const reports = new Subject<IAfterLoadReport>();
    context.load.mockReturnValue(of({ reports: () => reports }));

    context.reporter.report().subscribe();
    expect(context.post).not.toHaveBeenCalled();

    reports.next(speed);

    expect(context.post).toHaveBeenCalledTimes(1);
  });
});
