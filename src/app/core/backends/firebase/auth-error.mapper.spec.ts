import { AuthErrorKind } from '@core/enums/auth-error-kind.enum';
import { toAuthError } from './auth-error.mapper';

describe('toAuthError', () => {
  it.each([
    ['auth/invalid-credential', AuthErrorKind.InvalidCredentials],
    ['auth/invalid-login-credentials', AuthErrorKind.InvalidCredentials],
    ['auth/wrong-password', AuthErrorKind.InvalidCredentials],
    ['auth/user-not-found', AuthErrorKind.InvalidCredentials],
    ['auth/invalid-email', AuthErrorKind.InvalidCredentials],
    ['auth/user-disabled', AuthErrorKind.InvalidCredentials],
    ['auth/too-many-requests', AuthErrorKind.TooManyAttempts],
    ['auth/network-request-failed', AuthErrorKind.Network],
  ])('should report %s as %s', (code, kind) => {
    expect(toAuthError({ code }).kind).toBe(kind);
  });

  it.each([
    ['an unknown code', { code: 'auth/internal-error' }],
    ['a non-string code', { code: 3 }],
    ['an error without a code', new Error('boom')],
    ['null', null],
  ])('should report Unknown for %s', (_case, error) => {
    expect(toAuthError(error).kind).toBe(AuthErrorKind.Unknown);
  });
});
