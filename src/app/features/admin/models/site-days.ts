import { SITE_TIME_ZONE } from '@shared/constants/time.constants';

/** `en-CA` formats a date as YYYY-MM-DD, so days compare and sort as strings. */
const SITE_DAY = new Intl.DateTimeFormat('en-CA', {
  timeZone: SITE_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Day keys are calendar days: read at noon UTC, they mean the same day in every time zone. */
const CALENDAR = 'UTC';
const SHORT_DAY = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  timeZone: CALENDAR,
});
const SHORT_MONTH = new Intl.DateTimeFormat('en-IN', { month: 'short', timeZone: CALENDAR });
const LONG_MONTH = new Intl.DateTimeFormat('en-IN', {
  month: 'long',
  year: 'numeric',
  timeZone: CALENDAR,
});

const MS_PER_DAY = 86_400_000;
const DAYS_PER_WEEK = 7;
/** `getUTCDay()` numbers Sunday 0; weeks here start on Monday, as Indian calendars do. */
const MONDAY = 1;
/** `YYYY-MM-DD`. */
const DAY_LENGTH = 'YYYY-MM-DD'.length;
/** `YYYY-MM`. */
const MONTH_LENGTH = 7;
/** `YYYY`. */
const YEAR_LENGTH = 4;

function noon(day: string): Date {
  return new Date(`${day}T12:00:00Z`);
}

/**
 * @param ms A moment, in milliseconds.
 * @returns Its day in India (0018 decision 4), e.g. `2026-11-18`.
 */
export function siteDay(ms: number): string {
  return SITE_DAY.format(new Date(ms));
}

/**
 * @param day A day, `YYYY-MM-DD`.
 * @param count Days to add; negative goes back.
 * @returns The day that many days away.
 */
export function addDays(day: string, count: number): string {
  return new Date(noon(day).getTime() + count * MS_PER_DAY).toISOString().slice(0, DAY_LENGTH);
}

/**
 * @param day A day, `YYYY-MM-DD`.
 * @returns The Monday that starts its week.
 */
export function weekOf(day: string): string {
  const weekday = noon(day).getUTCDay();
  return addDays(day, -((weekday - MONDAY + DAYS_PER_WEEK) % DAYS_PER_WEEK));
}

/** @returns The day's month, `YYYY-MM`. */
export function monthOf(day: string): string {
  return day.slice(0, MONTH_LENGTH);
}

/** @returns The day's year, `YYYY`. */
export function yearOf(day: string): string {
  return day.slice(0, YEAR_LENGTH);
}

/**
 * @param month A month, `YYYY-MM`.
 * @param count Months to add; negative goes back.
 * @returns The month that many months away.
 */
export function addMonths(month: string, count: number): string {
  const date = noon(`${month}-01`);
  date.setUTCMonth(date.getUTCMonth() + count);
  return monthOf(date.toISOString());
}

/** @returns A day as a bar's label, e.g. "18 Nov". */
export function shortDay(day: string): string {
  return SHORT_DAY.format(noon(day));
}

/** @returns A month as a bar's label, e.g. "Nov". */
export function shortMonth(month: string): string {
  return SHORT_MONTH.format(noon(`${month}-01`));
}

/** @returns A month in full, e.g. "November 2026". */
export function longMonth(month: string): string {
  return LONG_MONTH.format(noon(`${month}-01`));
}
