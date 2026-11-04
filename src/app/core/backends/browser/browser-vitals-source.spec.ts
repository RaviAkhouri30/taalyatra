import { Subject } from 'rxjs';
import { type IVitalsMeasurement } from '@core/interfaces/i-vitals-reporter';
import { BrowserVitalsSource } from './browser-vitals-source';

describe('BrowserVitalsSource', () => {
  type Callback = (list: { getEntries: () => object[] }) => void;
  let observers: Map<string, Callback>;
  const disconnect = vi.fn();

  function fakeWindow(
    options: { width?: number; connection?: object; path?: string; navigator?: object } = {},
  ) {
    const document = new EventTarget() as EventTarget & { visibilityState: string };
    document.visibilityState = 'visible';
    return {
      document,
      innerWidth: options.width ?? 390,
      location: { pathname: options.path ?? '/shows' },
      navigator: {
        ...options.navigator,
        ...(options.connection ? { connection: options.connection } : {}),
      },
      performance: {
        getEntriesByType: () => [{ responseStart: 120.4 }],
        getEntriesByName: (name: string) =>
          name === 'first-contentful-paint' ? [{ startTime: 800.2 }] : [{ startTime: 950.6 }],
      },
    };
  }

  function stubObserver(supported: readonly string[]) {
    vi.stubGlobal(
      'PerformanceObserver',
      Object.assign(
        class {
          public constructor(private readonly callback: Callback) {}

          public observe({ type }: { type: string }): void {
            observers.set(type, this.callback);
          }

          public disconnect(): void {
            disconnect();
          }
        },
        { supportedEntryTypes: supported },
      ),
    );
  }

  function start(view = fakeWindow()) {
    const results: IVitalsMeasurement[] = [];
    const done = new Subject<void>();
    new BrowserVitalsSource(view as unknown as Window).measure().subscribe({
      next: (result) => results.push(result),
      complete: () => {
        done.next();
      },
    });
    return { results, view };
  }

  const lcp = (startTime: number) => {
    observers.get('largest-contentful-paint')?.({ getEntries: () => [{ startTime }] });
  };
  const shift = (value: number, hadRecentInput = false) => {
    observers.get('layout-shift')?.({ getEntries: () => [{ value, hadRecentInput }] });
  };

  beforeEach(() => {
    observers = new Map();
    disconnect.mockClear();
    stubObserver(['largest-contentful-paint', 'layout-shift']);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('should report five seconds after the main content settles', () => {
    const { results } = start();

    lcp(1000);
    vi.advanceTimersByTime(4000);
    lcp(1500);
    vi.advanceTimersByTime(4999);
    expect(results).toEqual([]);

    vi.advanceTimersByTime(1);

    expect(results).toEqual([
      {
        page: '/shows',
        device: 'phone',
        connection: '',
        lcp: 1500,
        fcp: 800,
        ttfb: 120,
        ready: 951,
        cls: 0,
      },
    ]);
  });

  it('should report at once when the page is hidden, and only once', () => {
    const { results, view } = start();
    lcp(1000);

    view.document.dispatchEvent(new Event('visibilitychange'));
    expect(results).toEqual([]);

    view.document.visibilityState = 'hidden';
    view.document.dispatchEvent(new Event('visibilitychange'));
    vi.advanceTimersByTime(5000);

    expect(results).toHaveLength(1);
    expect(results[0]?.lcp).toBe(1000);
  });

  it('should stop observing once it has reported', () => {
    start();
    lcp(1000);

    vi.advanceTimersByTime(5000);

    expect(disconnect).toHaveBeenCalledTimes(2);
  });

  it('should add up layout shifts, leaving out those after a tap', () => {
    const { results } = start();

    shift(0.1);
    shift(0.5, true);
    shift(0.0525);
    lcp(1000);
    vi.advanceTimersByTime(5000);

    expect(results[0]?.cls).toBeCloseTo(0.153);
  });

  it('should cap extreme values, so the rules accept them', () => {
    const { results } = start();

    shift(50);
    lcp(999_999);
    vi.advanceTimersByTime(5000);

    expect(results[0]).toMatchObject({ lcp: 120_000, cls: 10 });
  });

  it('should still report where the browser has no LCP, such as older iPhones', () => {
    stubObserver([]);
    const { results } = start();

    vi.advanceTimersByTime(5000);

    expect(results[0]).toMatchObject({ lcp: null, fcp: 800, ready: 951, cls: 0 });
    expect(observers.size).toBe(0);
  });

  it.each([
    [390, 'phone'],
    [620, 'phone'],
    [621, 'tablet'],
    [1000, 'tablet'],
    [1001, 'desktop'],
  ])('should call a %i px wide screen a %s', (width, device) => {
    const { results } = start(fakeWindow({ width }));
    lcp(1000);

    vi.advanceTimersByTime(5000);

    expect(results[0]?.device).toBe(device);
  });

  it('should pass on the connection class when the browser gives one', () => {
    const { results } = start(fakeWindow({ connection: { effectiveType: '3g' } }));
    lcp(1000);

    vi.advanceTimersByTime(5000);

    expect(results[0]?.connection).toBe('3g');
  });

  it('should give null for what was not measured', () => {
    const view = fakeWindow();
    view.performance.getEntriesByType = () => [];
    view.performance.getEntriesByName = () => [];
    const { results } = start(view);
    observers.get('largest-contentful-paint')?.({ getEntries: () => [] });

    vi.advanceTimersByTime(5000);

    expect(results[0]).toMatchObject({ lcp: null, fcp: null, ttfb: null, ready: null });
  });

  it.each([
    ['the admin area', { path: '/admin' }],
    ['a page not on the list', { path: '/somewhere' }],
    ['Global Privacy Control', { navigator: { globalPrivacyControl: true } }],
    ['Do Not Track', { navigator: { doNotTrack: '1' } }],
  ])('should report nothing, and observe nothing, for %s', (_case, options) => {
    const { results } = start(fakeWindow(options));

    vi.advanceTimersByTime(5000);

    expect(results).toEqual([]);
    expect(observers.size).toBe(0);
  });
});
