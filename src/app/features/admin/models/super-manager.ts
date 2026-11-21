import { type DocumentFields } from '@core/interfaces/i-document-store';
import { INDIA_UTC_OFFSET_MINUTES } from '@shared/constants/time.constants';
import { formatDay } from './editor-dates';
import { addDays, siteDay } from './site-days';

const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 86_400_000;

/** From how many days before the end the dashboard says it's ending (0024 D8). */
export const SUPER_ENDING_NOTICE_DAYS = 3;

/**
 * A manager the owner made a super manager (0024): they answer the approval queue and stand in for
 * the owner until `untilMs`. Stored in `roles/{uid}` as `superManager`; `firestore.rules` compare
 * `untilMs` with the time of every request, so it ends by itself.
 */
export interface ISuperManager {
  /** When the owner turned it on (ISO 8601). */
  readonly since: string;
  /** When it ends, in milliseconds since 1970 (UTC), or `null` for good. */
  readonly untilMs: number | null;
}

/**
 * @param day The last day it lasts, `YYYY-MM-DD`.
 * @returns The moment it ends: midnight in India at the start of the next day, so the day itself is
 *   included (0024 D3).
 */
export function superUntil(day: string): number {
  return Date.parse(`${addDays(day, 1)}T00:00:00Z`) - INDIA_UTC_OFFSET_MINUTES * MS_PER_MINUTE;
}

/**
 * @param untilMs When it ends.
 * @returns The last day it lasts, in India, `YYYY-MM-DD`: the inverse of {@link superUntil}.
 */
export function untilDay(untilMs: number): string {
  // A millisecond before the end is still the last day.
  return siteDay(untilMs - 1);
}

/**
 * @param superManager A role's super manager entry, if any.
 * @param now The time to judge at.
 * @returns Whether it is running then: on, and for good or not yet ended, as the rules check.
 */
export function isSuperActive(superManager: ISuperManager | undefined, now: Date): boolean {
  return (
    superManager !== undefined &&
    (superManager.untilMs === null || now.getTime() < superManager.untilMs)
  );
}

/**
 * @param value A stored role's `superManager`.
 * @returns It, or `undefined` when missing or malformed: a malformed one makes no one super.
 */
export function toSuperManager(value: unknown): ISuperManager | undefined {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }
  const entries = new Map(Object.entries(value as Record<string, unknown>));
  const since = entries.get('since');
  const untilMs = entries.get('untilMs');
  const validUntil = untilMs === null || (typeof untilMs === 'number' && Number.isFinite(untilMs));
  return typeof since === 'string' && validUntil ? { since, untilMs } : undefined;
}

/**
 * @param superManager The entry to store.
 * @returns It in the shape `firestore.rules` accept.
 */
export function superManagerFields(superManager: ISuperManager): DocumentFields {
  return { since: superManager.since, untilMs: superManager.untilMs };
}

/**
 * @param isSuper Whether the account is a running super manager.
 * @param endsAt When it ends, or `null` for good.
 * @param now The time to judge at.
 * @returns The super manager's dashboard notice (0024 D8), or empty for anyone else.
 */
export function superNotice(isSuper: boolean, endsAt: Date | null, now: Date): string {
  if (!isSuper) {
    return '';
  }
  if (endsAt === null) {
    return 'You’re a super manager: you approve changes for the owner.';
  }
  const day = formatDay(untilDay(endsAt.getTime()));
  return endsAt.getTime() - now.getTime() <= SUPER_ENDING_NOTICE_DAYS * MS_PER_DAY
    ? `Your super manager access ends on ${day}.`
    : `You’re a super manager until ${day}: you approve changes for the owner.`;
}
