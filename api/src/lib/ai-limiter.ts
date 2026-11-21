import { ApiError } from './api-error.js';
import { HttpStatus } from './api-constants.js';

/** India's offset from UTC, in minutes: a day's allowance starts at midnight there. */
const INDIA_OFFSET_MINUTES = 330;
const MS_PER_MINUTE = 60_000;
const INDIA_OFFSET_MS = INDIA_OFFSET_MINUTES * MS_PER_MINUTE;
const DAY_LENGTH = 'YYYY-MM-DD'.length;

/** Each signed-in account's AI requests a day (0025 D4). */
export const AI_REQUESTS_PER_DAY = 50;

/** What an account past its allowance is told. */
export const AI_LIMIT_REACHED = 'You’ve used today’s AI help. It’s back tomorrow.';

/**
 * @param now A moment in milliseconds.
 * @returns Its day in India, `YYYY-MM-DD`: allowances start at midnight there.
 */
export function indiaDay(now: number): string {
  return new Date(now + INDIA_OFFSET_MS).toISOString().slice(0, DAY_LENGTH);
}

/**
 * Counts AI requests per account per India day, in this instance's memory. Approximate across
 * instances, as approved (D4): the provider's own free limits are the hard ceiling.
 */
export class AiLimiter {
  private readonly used = new Map<string, { readonly day: string; readonly count: number }>();

  /**
   * Counts one request.
   * @param key Whose request, e.g. an account's id.
   * @param now The current time in milliseconds.
   * @param perDay The allowance.
   * @throws {ApiError} 429 when the allowance for today is used up; nothing is counted then.
   */
  public take(key: string, now: number, perDay = AI_REQUESTS_PER_DAY): void {
    const day = indiaDay(now);
    const entry = this.used.get(key);
    const count = entry?.day === day ? entry.count : 0;
    if (count >= perDay) {
      throw new ApiError(HttpStatus.TooManyRequests, AI_LIMIT_REACHED);
    }
    this.used.set(key, { day, count: count + 1 });
  }
}
