import { FormControl } from '@angular/forms';
import {
  optionalEmailValidator,
  phoneValidator,
  requiredTextValidator,
} from './contact.validators';

describe('contact validators', () => {
  const check = (validator: typeof phoneValidator, value: unknown) =>
    validator(new FormControl(value));

  it.each(['9876543210', '98765 43210', '+91 98765-43210', '919876543210'])(
    'should accept the phone number %s',
    (phone) => {
      expect(check(phoneValidator, phone)).toBeNull();
    },
  );

  it.each(['', '12345', '98765432101', null])('should reject the phone number %s', (phone) => {
    expect(check(phoneValidator, phone)).toEqual({ phone: true });
  });

  it('should require text that is not only spaces', () => {
    expect(check(requiredTextValidator, 'Asha')).toBeNull();
    expect(check(requiredTextValidator, '   ')).toEqual({ required: true });
    expect(check(requiredTextValidator, null)).toEqual({ required: true });
  });

  it('should accept an empty or valid email and reject an invalid one', () => {
    expect(check(optionalEmailValidator, '')).toBeNull();
    expect(check(optionalEmailValidator, null)).toBeNull();
    expect(check(optionalEmailValidator, 'asha@example.com')).toBeNull();
    expect(check(optionalEmailValidator, 'asha@')).toEqual({ email: true });
  });
});
