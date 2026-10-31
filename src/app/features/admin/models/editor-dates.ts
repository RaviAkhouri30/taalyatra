import { SITE_TIME_ZONE } from '@shared/constants/time.constants';

const DAY = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeZone: SITE_TIME_ZONE });
const MOMENT = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: SITE_TIME_ZONE,
});

/**
 * @param day A stored day, YYYY-MM-DD.
 * @returns It as the owner reads it, e.g. "1 Nov 2026" (as stored when unreadable).
 */
export function formatDay(day: string): string {
  // Noon UTC is the same calendar day in Pune, whatever the browser's time zone.
  return safely(DAY, new Date(`${day}T12:00:00Z`), day);
}

/**
 * @param iso A stored moment (ISO 8601).
 * @returns It in Pune time, e.g. "31 Oct 2026, 3:30 pm" (as stored when unreadable).
 */
export function formatMoment(iso: string): string {
  return safely(MOMENT, new Date(iso), iso);
}

/** Stored dates are untrusted: an unreadable one is shown as stored instead of breaking the page. */
function safely(format: Intl.DateTimeFormat, date: Date, stored: string): string {
  return Number.isNaN(date.getTime()) ? stored : format.format(date);
}
