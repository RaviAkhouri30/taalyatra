import { HttpStatusCode } from '@angular/common/http';

/** Firestore error codes and the HTTP status each one reports (ADR-0009). */
const STATUS_BY_CODE: ReadonlyMap<string, HttpStatusCode> = new Map([
  ['unauthenticated', HttpStatusCode.Unauthorized],
  ['permission-denied', HttpStatusCode.Forbidden],
  ['not-found', HttpStatusCode.NotFound],
  ['already-exists', HttpStatusCode.Conflict],
  ['invalid-argument', HttpStatusCode.BadRequest],
  ['failed-precondition', HttpStatusCode.BadRequest],
  ['resource-exhausted', HttpStatusCode.TooManyRequests],
  ['unavailable', HttpStatusCode.ServiceUnavailable],
  ['deadline-exceeded', HttpStatusCode.GatewayTimeout],
]);

/**
 * Translates a Firestore failure into the status the `IHttpBackend` contract reports. Read
 * structurally, so this file needs no SDK import.
 * @param error Whatever the SDK rejected with.
 * @returns The matching status, or 500 for an unknown code or a non-Firebase error.
 */
export function toHttpStatus(error: unknown): HttpStatusCode {
  const code: unknown =
    typeof error === 'object' && error !== null ? Reflect.get(error, 'code') : undefined;
  return (
    (typeof code === 'string' ? STATUS_BY_CODE.get(code) : undefined) ??
    HttpStatusCode.InternalServerError
  );
}
