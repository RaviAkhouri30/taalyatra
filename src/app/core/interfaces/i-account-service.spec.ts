import { AccountErrorKind } from '@core/enums/account-error-kind.enum';
import { ACCOUNT_ERROR_MESSAGES, AccountError } from './i-account-service';

describe('AccountError', () => {
  it('should know its kind, and Unknown for anything else', () => {
    expect(AccountError.kindOf(new AccountError(AccountErrorKind.TooMany))).toBe(
      AccountErrorKind.TooMany,
    );
    expect(AccountError.kindOf(new Error('x'))).toBe(AccountErrorKind.Unknown);
  });

  it('should give the owner’s words for what went wrong', () => {
    expect(AccountError.messageOf(new AccountError(AccountErrorKind.EmailTaken))).toBe(
      ACCOUNT_ERROR_MESSAGES[AccountErrorKind.EmailTaken],
    );
    expect(AccountError.messageOf('x')).toBe(ACCOUNT_ERROR_MESSAGES[AccountErrorKind.Unknown]);
  });

  it('should have a message for every kind', () => {
    for (const kind of Object.values(AccountErrorKind)) {
      expect(ACCOUNT_ERROR_MESSAGES[kind].length).toBeGreaterThan(0);
    }
  });
});
