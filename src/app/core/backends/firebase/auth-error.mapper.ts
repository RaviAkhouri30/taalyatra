import { AuthErrorKind } from '@core/enums/auth-error-kind.enum';
import { AuthError } from '@core/interfaces/i-auth-service';

/** Firebase Auth error codes and the reason each reports (ADR-0012). */
const KIND_BY_CODE: ReadonlyMap<string, AuthErrorKind> = new Map([
  ['auth/invalid-credential', AuthErrorKind.InvalidCredentials],
  ['auth/invalid-login-credentials', AuthErrorKind.InvalidCredentials],
  ['auth/wrong-password', AuthErrorKind.InvalidCredentials],
  ['auth/user-not-found', AuthErrorKind.InvalidCredentials],
  ['auth/invalid-email', AuthErrorKind.InvalidCredentials],
  ['auth/user-disabled', AuthErrorKind.InvalidCredentials],
  ['auth/too-many-requests', AuthErrorKind.TooManyAttempts],
  ['auth/network-request-failed', AuthErrorKind.Network],
]);

/**
 * Translates a Firebase Auth failure into an `AuthError`. Read structurally, so this file needs
 * no SDK import.
 * @param error Whatever the SDK rejected with.
 * @returns The matching `AuthError` (`Unknown` for anything unmapped).
 */
export function toAuthError(error: unknown): AuthError {
  const code: unknown =
    typeof error === 'object' && error !== null ? Reflect.get(error, 'code') : undefined;
  return new AuthError(
    (typeof code === 'string' ? KIND_BY_CODE.get(code) : undefined) ?? AuthErrorKind.Unknown,
  );
}
