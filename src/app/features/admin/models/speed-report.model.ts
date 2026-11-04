import { type DocumentFields } from '@core/interfaces/i-document-store';
import { fieldOf } from '../forms/json-node';

/** Where reports are stored (`firestore.rules`: visitors create, the admin reads and deletes). */
export const VITALS_COLLECTION = 'vitals';
/** How long reports are kept and counted. */
export const VITALS_KEEP_DAYS = 30;
/** Fewer phone visits than this isn't a reliable answer. */
export const MIN_PHONE_VISITS = 200;
/** The main content's target on phones (CLAUDE.md §10). */
export const LCP_TARGET_MS = 2500;

const PERCENTILE = 0.75;
const MS_PER_SECOND = 1000;
const MS_PER_DAY = 86_400_000;
const CLS_DIGITS = 2;
const DEVICES: readonly { readonly id: string; readonly label: string }[] = [
  { id: 'phone', label: 'Phone' },
  { id: 'tablet', label: 'Tablet' },
  { id: 'desktop', label: 'Desktop' },
];

/** One device's row in the report. */
export interface ISpeedRow {
  readonly device: string;
  readonly visits: number;
  readonly lcp: string;
  readonly ready: string;
  readonly fcp: string;
  readonly ttfb: string;
  readonly cls: string;
}

/** @returns The 75th percentile, ignoring what a browser couldn't measure. */
function percentile(values: readonly unknown[]): number | null {
  const numbers = values
    .filter((value): value is number => typeof value === 'number')
    .sort((first, second) => first - second);
  return numbers.at(Math.ceil(numbers.length * PERCENTILE) - 1) ?? null;
}

function seconds(ms: number | null): string {
  return ms === null ? '—' : `${(ms / MS_PER_SECOND).toFixed(1)} s`;
}

/**
 * @param report A stored report.
 * @returns When it was stored, in milliseconds, or `null` when it can't be told. Firestore gives a
 *   timestamp object with `seconds`; a report without one is kept, not thrown away.
 */
export function reportTime(report: DocumentFields): number | null {
  const stamp = fieldOf(fieldOf(report, 'createdAt'), 'seconds');
  return typeof stamp === 'number' ? stamp * MS_PER_SECOND : null;
}

/**
 * @param report A stored report.
 * @param now The current time.
 * @returns Whether it's past the time reports are kept.
 */
export function isExpired(report: DocumentFields, now: Date): boolean {
  const time = reportTime(report);
  return time !== null && now.getTime() - time > VITALS_KEEP_DAYS * MS_PER_DAY;
}

/** What the owner's real visitors got: the 75th percentile per device, the measure Google uses. */
export class SpeedReportModel {
  /** One row per device with visits. */
  public readonly rows: readonly ISpeedRow[];
  /** The answer the report exists for, or how far off it still is. */
  public readonly verdict: string;

  /** @param reports The stored reports to count. */
  public constructor(reports: readonly DocumentFields[]) {
    this.rows = DEVICES.flatMap(({ id, label }) => {
      const visits = reports.filter((report) => fieldOf(report, 'device') === id);
      return visits.length === 0 ? [] : [this.row(label, visits)];
    });
    this.verdict = this.verdictFor(reports);
  }

  private row(device: string, visits: readonly DocumentFields[]): ISpeedRow {
    const values = (key: string): unknown[] => visits.map((visit) => fieldOf(visit, key));
    return {
      device,
      visits: visits.length,
      lcp: seconds(percentile(values('lcp'))),
      ready: seconds(percentile(values('ready'))),
      fcp: seconds(percentile(values('fcp'))),
      ttfb: seconds(percentile(values('ttfb'))),
      cls: percentile(values('cls'))?.toFixed(CLS_DIGITS) ?? '—',
    };
  }

  private verdictFor(reports: readonly DocumentFields[]): string {
    if (reports.length === 0) {
      return 'No visits reported yet.';
    }
    const phones = reports
      .filter((report) => fieldOf(report, 'device') === 'phone')
      .map((report) => fieldOf(report, 'lcp'))
      .filter((lcp) => typeof lcp === 'number');
    if (phones.length < MIN_PHONE_VISITS) {
      return `${String(phones.length)} phone visits measured so far. It needs at least ${String(MIN_PHONE_VISITS)} for a reliable answer.`;
    }
    const lcp = percentile(phones) ?? 0;
    return lcp <= LCP_TARGET_MS
      ? `Phones meet the 2.5 s target: 3 in 4 visits show the main content within ${seconds(lcp)}.`
      : `Phones are over the 2.5 s target: 3 in 4 visits show the main content within ${seconds(lcp)}.`;
  }
}
