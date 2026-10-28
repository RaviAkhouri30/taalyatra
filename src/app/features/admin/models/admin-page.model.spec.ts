import { AuthErrorKind } from '@core/enums/auth-error-kind.enum';
import { PAGES, SITE } from '@shared/testing/fixtures';
import { AdminPageModel } from './admin-page.model';

describe('AdminPageModel', () => {
  const page = () => new AdminPageModel(PAGES.admin, SITE.brand);

  it.each([
    [AuthErrorKind.InvalidCredentials, 'Email or password is incorrect.'],
    [AuthErrorKind.TooManyAttempts, 'Too many attempts. Please wait a few minutes and try again.'],
    [AuthErrorKind.Network, 'Couldn’t reach the server. Check your connection and try again.'],
    [AuthErrorKind.Unavailable, 'Something went wrong. Please try again.'],
    [AuthErrorKind.Unknown, 'Something went wrong. Please try again.'],
  ])('should explain %s', (kind, message) => {
    expect(page().messageFor(kind)).toBe(message);
  });

  it('should pick the email and password field messages from their errors', () => {
    expect(page().emailError({ required: true })).toBe('Enter your email.');
    expect(page().emailError({ email: true })).toContain('valid email');
    expect(page().passwordError({ required: true })).toBe('Enter your password.');
    expect(page().passwordError({ passwordLength: true })).toContain('6 to 128');
  });

  it('should keep the brand for the card', () => {
    expect(page().brand).toBe(SITE.brand);
  });
});
