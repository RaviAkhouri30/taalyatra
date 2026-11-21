import { createHash } from 'node:crypto';
import { HttpStatus } from './api-constants.js';
import { ApiError } from './api-error.js';
import { indiaDay } from './ai-limiter.js';
import { type IApiRequest } from './api-handler.js';

/** A visitor's questions an hour, and the whole chat's a day (0025 D4). */
export const CHAT_PER_VISITOR_HOUR = 10;
export const CHAT_PER_DAY = 500;

/** What the browser hears past a limit; it answers from the script instead. */
export const CHAT_LIMIT_REACHED = 'The chat has answered enough for now.';

const MS_PER_HOUR = 3_600_000;
/** Past this many visitors, the ones from earlier hours are forgotten. */
const VISITORS_KEPT = 5000;

/**
 * @param request The incoming request.
 * @returns The visitor, as a SHA-256 hash of their address: the address itself is never kept.
 *   Azure gives it in `x-azure-clientip`, else first in `x-forwarded-for`.
 */
export function visitorOf(request: IApiRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0] ?? '';
  const address = (request.headers.get('x-azure-clientip') ?? forwarded).trim() || 'unknown';
  return createHash('sha256').update(address).digest('hex');
}

/** Counts the public chat's questions in this instance's memory: approximate across instances. */
export class ChatLimiter {
  private readonly visitors = new Map<string, { readonly hour: number; readonly count: number }>();
  private today = { day: '', count: 0 };

  /**
   * Counts one question.
   * @param visitor The visitor's hash.
   * @param now The current time in milliseconds.
   * @throws {ApiError} 429 past the visitor's hour or the chat's day; nothing is counted then.
   */
  public take(visitor: string, now: number): void {
    const day = indiaDay(now);
    const hour = Math.floor(now / MS_PER_HOUR);
    const dayCount = this.today.day === day ? this.today.count : 0;
    const entry = this.visitors.get(visitor);
    const visitorCount = entry?.hour === hour ? entry.count : 0;
    if (dayCount >= CHAT_PER_DAY || visitorCount >= CHAT_PER_VISITOR_HOUR) {
      throw new ApiError(HttpStatus.TooManyRequests, CHAT_LIMIT_REACHED);
    }
    this.forgetEarlierHours(hour);
    this.visitors.set(visitor, { hour, count: visitorCount + 1 });
    this.today = { day, count: dayCount + 1 };
  }

  private forgetEarlierHours(hour: number): void {
    if (this.visitors.size < VISITORS_KEPT) {
      return;
    }
    [...this.visitors].forEach(([visitor, entry]) => {
      if (entry.hour < hour) {
        this.visitors.delete(visitor);
      }
    });
  }
}
