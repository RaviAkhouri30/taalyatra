import { FormControl } from '@angular/forms';
import {
  emailAddressValidator,
  passwordLengthValidator,
  requiredTrimmedValidator,
} from './auth.validators';

describe('auth validators', () => {
  const check = (validator: typeof emailAddressValidator, value: string) =>
    validator(new FormControl(value));

  it.each(['', '   '])('should require a value when it is %j', (value) => {
    expect(check(requiredTrimmedValidator, value)).toEqual({ required: true });
  });

  it('should accept a filled-in value', () => {
    expect(check(requiredTrimmedValidator, 'x')).toBeNull();
  });

  it.each(['owner@example.com', ' owner@taalyatra.in ', 'a.b+c@sub.example.co'])(
    'should accept the email %j',
    (value) => {
      expect(check(emailAddressValidator, value)).toBeNull();
    },
  );

  it.each([
    'a@b',
    'owner@example',
    'owner example@x.com',
    'owner@@x.com',
    'owner@x.c',
    `${'a'.repeat(250)}@x.com`,
  ])('should reject the email %j', (value) => {
    expect(check(emailAddressValidator, value)).toEqual({ email: true });
  });

  it('should leave an empty email to the required validator', () => {
    expect(check(emailAddressValidator, '')).toBeNull();
  });

  it.each([
    ['12345', false],
    ['123456', true],
    ['a'.repeat(128), true],
    ['a'.repeat(129), false],
  ])('should check the length of %j (valid: %s)', (value, valid) => {
    expect(check(passwordLengthValidator, value)).toEqual(valid ? null : { passwordLength: true });
  });

  it('should leave an empty password to the required validator', () => {
    expect(check(passwordLengthValidator, '')).toBeNull();
  });
});
