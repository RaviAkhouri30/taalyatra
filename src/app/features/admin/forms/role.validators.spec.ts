import { FormControl } from '@angular/forms';
import { accountIdValidator, notListedValidator, notOwnerValidator } from './role.validators';

describe('role validators', () => {
  const check = (validator: Parameters<FormControl['addValidators']>[0], value: string) =>
    new FormControl(value, validator).errors;

  it.each(['5zsz2DlUaja2Ss7wbFTrpiMMROk2', 'manager-uid', ''])(
    'should accept the account id %j',
    (value) => {
      expect(check(accountIdValidator, value)).toBeNull();
    },
  );

  it.each(['abc', 'has space in it', 'roles/other-uid', 'a'.repeat(129)])(
    'should refuse the account id %j',
    (value) => {
      expect(check(accountIdValidator, value)).toEqual({ accountId: true });
    },
  );

  it('should refuse the owner’s own account, even with spaces around it', () => {
    expect(check(notOwnerValidator('owner-uid'), ' owner-uid ')).toEqual({ ownerAccount: true });
    expect(check(notOwnerValidator('owner-uid'), 'manager-uid')).toBeNull();
  });

  it('should refuse an account that is already a manager', () => {
    const validator = notListedValidator(() => new Set(['manager-uid']));

    expect(check(validator, 'manager-uid')).toEqual({ listedAccount: true });
    expect(check(validator, 'new-manager')).toBeNull();
  });
});
