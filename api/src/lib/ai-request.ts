import { type Observable, catchError, defer, throwError } from 'rxjs';
import { HttpStatus } from './api-constants.js';
import { ApiError } from './api-error.js';
import { type IApiRequest } from './api-handler.js';

/** What a malformed request is told. */
export const BAD_AI_REQUEST = 'That request can’t be sent to the AI.';

/** @returns A 400 with the message above. */
export function badRequest(): ApiError {
  return new ApiError(HttpStatus.BadRequest, BAD_AI_REQUEST);
}

/** @returns The request's JSON body, once; 400 when it isn't JSON. */
export function bodyOf(request: IApiRequest): Observable<unknown> {
  // defer: the body is read when the stream is subscribed.
  return defer(() => request.json()).pipe(catchError(() => throwError(badRequest)));
}

/** @returns The value's own entries, or none when it isn't a plain object. */
export function entriesOf(value: unknown): ReadonlyMap<string, unknown> {
  return new Map(
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? Object.entries(value)
      : [],
  );
}

/**
 * @param value A field of the request.
 * @param max The most characters allowed.
 * @returns It as text, or empty when missing.
 * @throws {ApiError} 400 when it isn't text or is too long.
 */
export function textField(value: unknown, max: number): string {
  if (value === undefined || value === null) {
    return '';
  }
  if (typeof value !== 'string' || value.length > max) {
    throw badRequest();
  }
  return value.trim();
}
