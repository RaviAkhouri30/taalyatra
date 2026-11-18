import { type Observable } from 'rxjs';

/** How a visit was measured. A browser that can't measure something gives `null` for it. */
export interface IVitalsMeasurement {
  /** The page's path, with no query string. */
  readonly page: string;
  /** Phone, tablet or desktop, from the screen width. */
  readonly device: string;
  /** The browser's rough connection class, or empty when it doesn't say. */
  readonly connection: string;
  /** When the main content appeared (LCP), in milliseconds. */
  readonly lcp: number | null;
  /** When anything first appeared (FCP), in milliseconds. */
  readonly fcp: number | null;
  /** When the server first answered (TTFB), in milliseconds. */
  readonly ttfb: number | null;
  /** When the site's data arrived, in milliseconds. */
  readonly ready: number | null;
  /** How much the page shifted so far (CLS). */
  readonly cls: number;
}

/**
 * Measures one page load, unless it shouldn't be reported. Lives in its own chunk, so visitors load
 * it only when idle.
 */
export interface IVitalsSource {
  /** @returns Emits the measurement once, then completes; completes empty if it isn't reported. */
  measure(): Observable<IVitalsMeasurement>;
}

/** One anonymous visit (0018): where it arrived and on what kind of device, nothing more. */
export interface IVisit {
  /** The page arrived on, with no query string. */
  readonly page: string;
  /** Phone, tablet or desktop, from the screen width. */
  readonly device: string;
}

/** Decides whether this page load is a visit to count. Lives in the after-load chunk. */
export interface IVisitSource {
  /** @returns Emits the visit once, then completes; completes empty when it isn't counted. */
  count(): Observable<IVisit>;
}

/** Something to send once the page has loaded: where to, and what. */
export interface IAfterLoadReport {
  /** The collection it goes to. */
  readonly endpoint: string;
  readonly body: IVitalsMeasurement | IVisit;
}

/**
 * Everything sent after the page has loaded: the speed report (0012) and the visit (0018). Its
 * own chunk, so visitors download it only once the page is idle.
 */
export interface IAfterLoadSource {
  /** @returns Each report as it's ready; completes once all are sent or skipped. */
  reports(): Observable<IAfterLoadReport>;
}

/**
 * Port for reporting how fast the site really was (ADR-0016, 0012). Also the DI token;
 * `vitalsReporterFactory` picks the adapter. Nothing here may affect the visit: it never errors.
 */
export abstract class IVitalsReporter {
  /** Notes that the site's data has arrived. */
  public abstract markReady(): void;

  /** @returns Sends one report for this page load when it's ready; completes, and never errors. */
  public abstract report(): Observable<void>;
}
