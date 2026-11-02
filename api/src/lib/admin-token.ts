import { type JWTPayload, type JWTVerifyGetKey, createRemoteJWKSet, jwtVerify } from 'jose';
import { type Observable, catchError, defer, map, throwError } from 'rxjs';
import { ADMIN_UID, FIREBASE_KEYS_URL, FIREBASE_PROJECT_ID, HttpStatus } from './api-constants.js';
import { ApiError } from './api-error.js';

const MS_PER_SECOND = 1000;

/** Allows for a small difference between clocks when a token has only just been issued. */
const CLOCK_TOLERANCE_SECONDS = 5;

const INVALID_TOKEN = 'Please sign in again.';

/** Google's public keys, fetched when needed and cached by `jose`. */
export function firebaseKeys(): JWTVerifyGetKey {
  return createRemoteJWKSet(new URL(FIREBASE_KEYS_URL));
}

/** @returns Whether a time claim is a number that isn't in the future. */
function isPast(claim: unknown, nowSeconds: number): boolean {
  return typeof claim === 'number' && claim <= nowSeconds + CLOCK_TOLERANCE_SECONDS;
}

/** The claims `jwtVerify` doesn't check by itself (Firebase's list of required checks). */
function assertAdmin(payload: JWTPayload, nowSeconds: number): void {
  if (!isPast(payload.iat, nowSeconds) || !isPast(payload['auth_time'], nowSeconds)) {
    throw new ApiError(HttpStatus.Unauthorized, INVALID_TOKEN);
  }
  if (payload.sub !== ADMIN_UID) {
    throw new ApiError(HttpStatus.Forbidden, 'This account can’t change media.');
  }
}

/**
 * Checks a Firebase ID token belongs to the admin. Needs no service account: a token is
 * verified with Google's public keys, so no Google credential sits on this server.
 *
 * @param token The token from the request, if any.
 * @param keys Finds the public key for a token.
 * @param now The current time in milliseconds.
 * @returns Emits once when it's the admin.
 * @throws {ApiError} Through the stream: 401 for a missing or invalid token, 403 for anyone else.
 */
export function verifyAdmin(
  token: string | null,
  keys: JWTVerifyGetKey,
  now: number,
): Observable<void> {
  if (!token) {
    return throwError(() => new ApiError(HttpStatus.Unauthorized, INVALID_TOKEN));
  }
  const currentDate = new Date(now);
  // defer: nothing is verified until someone subscribes.
  return defer(() =>
    jwtVerify(token, keys, {
      algorithms: ['RS256'],
      audience: FIREBASE_PROJECT_ID,
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      requiredClaims: ['exp', 'iat', 'sub', 'auth_time'],
      currentDate,
    }),
  ).pipe(
    // A library error can quote the token's details, so the caller only learns it was refused.
    catchError(() => throwError(() => new ApiError(HttpStatus.Unauthorized, INVALID_TOKEN))),
    map(({ payload }) => {
      assertAdmin(payload, Math.floor(now / MS_PER_SECOND));
    }),
  );
}
