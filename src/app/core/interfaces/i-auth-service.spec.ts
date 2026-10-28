import { AuthErrorKind } from '@core/enums/auth-error-kind.enum';
import { AuthError } from './i-auth-service';

describe('AuthError', () => {
  it('should carry its kind', () => {
    const error = new AuthError(AuthErrorKind.Network);

    expect(error.kind).toBe(AuthErrorKind.Network);
    expect(error.name).toBe('AuthError');
  });

  it('should report the kind of an AuthError, and Unknown for anything else', () => {
    expect(AuthError.kindOf(new AuthError(AuthErrorKind.TooManyAttempts))).toBe(
      AuthErrorKind.TooManyAttempts,
    );
    expect(AuthError.kindOf(new Error('boom'))).toBe(AuthErrorKind.Unknown);
  });
});
