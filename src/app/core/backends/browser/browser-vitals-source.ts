import { EMPTY, Observable, debounceTime, finalize, map, merge, take, timer } from 'rxjs';
import { type IVitalsMeasurement, type IVitalsSource } from '@core/interfaces/i-vitals-reporter';
import { AppRoute } from '@shared/enums/app-route.enum';
import { SITE_READY_MARK } from './vitals.constants';

/** The pages reported on, which `firestore.rules` lists too. Anything else isn't reported. */
const REPORTED_PAGES: ReadonlySet<string> = new Set<string>([
  AppRoute.Home,
  AppRoute.Shows,
  AppRoute.Videos,
  AppRoute.Team,
  AppRoute.Achievements,
]);

/** Signals a browser can send to ask not to be tracked. */
type PrivacyNavigator = Navigator & { readonly globalPrivacyControl?: boolean };

/** How long after the main content settles to send: late enough to be its final value. */
const SEND_AFTER_LCP_MS = 5000;

/** Mirrors `_breakpoints.scss`, so "phone" means what it does in the site's layout. */
const PHONE_MAX_WIDTH = 620;
const TABLET_MAX_WIDTH = 1000;

/** `firestore.rules` accepts up to these, so an extreme visit is capped rather than lost. */
const MAX_MS = 120_000;
const MAX_CLS = 10;
const CLS_PRECISION = 1000;

const LCP_ENTRY = 'largest-contentful-paint';
const SHIFT_ENTRY = 'layout-shift';

/** Layout shift entries aren't in TypeScript's DOM library yet. */
interface ILayoutShift extends PerformanceEntry {
  readonly value: number;
  readonly hadRecentInput: boolean;
}

function toMs(value: number | undefined): number | null {
  return value === undefined ? null : Math.min(MAX_MS, Math.round(value));
}

/**
 * Measures this page load with the browser's own `PerformanceObserver`. `buffered` delivers what
 * happened before this code loaded, so starting late doesn't lose anything.
 */
export class BrowserVitalsSource implements IVitalsSource {
  private lcp: number | undefined;
  private cls = 0;
  private readonly observers: PerformanceObserver[] = [];

  /** @param view The browser window. */
  public constructor(private readonly view: Window) {}

  public measure(): Observable<IVitalsMeasurement> {
    if (!this.mayReport()) {
      return EMPTY;
    }
    const supported = PerformanceObserver.supportedEntryTypes;
    this.observeShifts(supported);
    // merge and take(1): whichever comes first, because a hidden page may never be seen again.
    return merge(this.settledLcp(supported), this.hidden()).pipe(
      take(1),
      map(() => this.result()),
      finalize(() => {
        this.observers.forEach((observer) => {
          observer.disconnect();
        });
      }),
    );
  }

  private mayReport(): boolean {
    const navigator = this.view.navigator as PrivacyNavigator;
    return (
      REPORTED_PAGES.has(this.view.location.pathname) &&
      navigator.globalPrivacyControl !== true &&
      navigator.doNotTrack !== '1'
    );
  }

  /** Emits once the main content has stopped changing. Browsers without LCP just wait as long. */
  private settledLcp(supported: readonly string[]): Observable<unknown> {
    if (!supported.includes(LCP_ENTRY)) {
      return timer(SEND_AFTER_LCP_MS);
    }
    return new Observable<void>((subscriber) => {
      const observer = new PerformanceObserver((list) => {
        this.lcp = list.getEntries().at(-1)?.startTime;
        subscriber.next();
      });
      this.observers.push(observer);
      observer.observe({ type: LCP_ENTRY, buffered: true });
    }).pipe(debounceTime(SEND_AFTER_LCP_MS));
  }

  private hidden(): Observable<unknown> {
    const { document } = this.view;
    return new Observable<void>((subscriber) => {
      const check = (): void => {
        if (document.visibilityState === 'hidden') {
          subscriber.next();
        }
      };
      document.addEventListener('visibilitychange', check);
      return () => {
        document.removeEventListener('visibilitychange', check);
      };
    });
  }

  private observeShifts(supported: readonly string[]): void {
    if (!supported.includes(SHIFT_ENTRY)) {
      return;
    }
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as ILayoutShift[]) {
        // A shift right after a tap or key press is expected, and isn't counted.
        if (!entry.hadRecentInput) {
          this.cls += entry.value;
        }
      }
    });
    this.observers.push(observer);
    observer.observe({ type: SHIFT_ENTRY, buffered: true });
  }

  private result(): IVitalsMeasurement {
    const { performance, innerWidth, navigator } = this.view;
    const [navigation] = performance.getEntriesByType(
      'navigation',
    ) as PerformanceNavigationTiming[];
    const connection = (navigator as Navigator & { connection?: { effectiveType?: string } })
      .connection;
    return {
      page: this.view.location.pathname,
      device: this.deviceFor(innerWidth),
      connection: connection?.effectiveType ?? '',
      lcp: toMs(this.lcp),
      fcp: toMs(performance.getEntriesByName('first-contentful-paint').at(0)?.startTime),
      ttfb: toMs(navigation?.responseStart),
      ready: toMs(performance.getEntriesByName(SITE_READY_MARK).at(0)?.startTime),
      cls: Math.min(MAX_CLS, Math.round(this.cls * CLS_PRECISION) / CLS_PRECISION),
    };
  }

  private deviceFor(width: number): string {
    if (width <= PHONE_MAX_WIDTH) {
      return 'phone';
    }
    return width <= TABLET_MAX_WIDTH ? 'tablet' : 'desktop';
  }
}
