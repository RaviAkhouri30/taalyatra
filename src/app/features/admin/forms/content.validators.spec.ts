import { FormControl } from '@angular/forms';
import { dateValidator, phoneE164Validator, urlValidator } from './content.validators';

describe('content validators', () => {
  const check = (validator: typeof urlValidator, value: string | null) =>
    validator(new FormControl(value));

  it.each(['https://maps.app.goo.gl/x', 'http://example.com', '', null])(
    'should accept %j as a link',
    (value) => {
      expect(check(urlValidator, value)).toBeNull();
    },
  );

  it.each(['maps.app.goo.gl', 'https://has space.com', 'javascript:alert(1)'])(
    'should reject %j as a link',
    (value) => {
      expect(check(urlValidator, value)).toEqual({ url: true });
    },
  );

  it('should accept an international phone number and reject a local one', () => {
    expect(check(phoneE164Validator, '+919284276168')).toBeNull();
    expect(check(phoneE164Validator, '09284276168')).toEqual({ phone: true });
  });

  it('should accept a stored date and reject another format', () => {
    expect(check(dateValidator, '2026-11-01')).toBeNull();
    expect(check(dateValidator, '01/11/2026')).toEqual({ date: true });
  });
});
