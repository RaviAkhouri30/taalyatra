import { type DocumentFields } from '@core/interfaces/i-document-store';
import { VISIT_DEVICES, VISIT_PAGES } from '@shared/constants/visit.constants';
import { fieldOf } from '../forms/json-node';
import { siteDay } from './site-days';
import { reportTime } from './speed-report.model';

/** Where visitors add single visits (`firestore.rules`: create only; the admin reads, deletes). */
export const VISITS_COLLECTION = 'visits';
/** One document per finished day, added up by the admin area (create only, never changed). */
export const VISIT_DAYS_COLLECTION = 'visitDays';

/** Counts by name, e.g. by page or by device. */
export type Counts = Readonly<Record<string, number>>;

/** One day's visits, added up. */
export interface IVisitDay {
  /** `YYYY-MM-DD`, in India. */
  readonly day: string;
  readonly total: number;
  readonly pages: Counts;
  readonly devices: Counts;
}

/** What tidying the single visits comes to. */
export interface IVisitTidy {
  /** Finished days not yet added up: each becomes a `visitDays` document. */
  readonly newDays: readonly IVisitDay[];
  /** Single visits of finished days, by id, to remove once their day is stored. */
  readonly removals: ReadonlyMap<string, readonly string[]>;
  /** Every day known: those stored, those just added up, and today so far. */
  readonly days: readonly IVisitDay[];
}

function countBy(visits: readonly DocumentFields[], key: string, known: readonly string[]): Counts {
  const counts = new Map<string, number>();
  for (const visit of visits) {
    const value = fieldOf(visit, key);
    if (typeof value === 'string' && known.includes(value)) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return Object.fromEntries(counts);
}

/**
 * @param day The day.
 * @param visits That day's single visits.
 * @returns The day added up: in total, by page arrived on, and by kind of device.
 */
export function addUp(day: string, visits: readonly DocumentFields[]): IVisitDay {
  return {
    day,
    total: visits.length,
    pages: countBy(visits, 'page', VISIT_PAGES),
    devices: countBy(visits, 'device', VISIT_DEVICES),
  };
}

function counts(value: unknown): Counts {
  if (typeof value !== 'object' || value === null) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, number] => typeof entry[1] === 'number',
    ),
  );
}

/**
 * @param day The document's id.
 * @param fields A stored `visitDays` document.
 * @returns The day as stored; a damaged one reads as no visits rather than breaking the page.
 */
export function storedDay(day: string, fields: DocumentFields): IVisitDay {
  const total = fieldOf(fields, 'total');
  return {
    day,
    total: typeof total === 'number' ? total : 0,
    pages: counts(fieldOf(fields, 'pages')),
    devices: counts(fieldOf(fields, 'devices')),
  };
}

/** Single visits grouped by their day in India; one without a time (never stored so) is today's. */
function byDay(visits: ReadonlyMap<string, DocumentFields>, today: string): Map<string, string[]> {
  const days = new Map<string, string[]>();
  for (const [id, visit] of visits) {
    const time = reportTime(visit);
    const day = time === null ? today : siteDay(time);
    days.set(day, [...(days.get(day) ?? []), id]);
  }
  return days;
}

/**
 * Works out how to fold single visits into one document per finished day (0018 decision 5). Today
 * isn't finished, so its visits are counted as they are and left for later.
 * @param visits Single visits, by id.
 * @param stored Days already added up, by day.
 * @param today Today, in India.
 * @returns What to store, what to remove, and every day's visits.
 */
export function planTidy(
  visits: ReadonlyMap<string, DocumentFields>,
  stored: ReadonlyMap<string, DocumentFields>,
  today: string,
): IVisitTidy {
  const newDays: IVisitDay[] = [];
  const removals = new Map<string, readonly string[]>();
  const days = new Map([...stored].map(([day, fields]) => [day, storedDay(day, fields)]));
  for (const [day, ids] of byDay(visits, today)) {
    const added = addUp(
      day,
      ids.map((id) => visits.get(id) ?? {}),
    );
    // Not finished yet; "after today" only when this device's clock is behind the server's.
    if (day >= today) {
      days.set(day, added);
    } else {
      // Already added up on another device: its single visits only need removing.
      if (!days.has(day)) {
        newDays.push(added);
        days.set(day, added);
      }
      removals.set(day, ids);
    }
  }
  return {
    newDays,
    removals,
    days: [...days.values()].sort((first, second) => first.day.localeCompare(second.day)),
  };
}
