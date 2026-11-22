import { FormControl } from '@angular/forms';
import { nameNotTakenValidator } from './saved-theme.validators';

describe('nameNotTakenValidator', () => {
  const validate = (value: string, taken: readonly string[]) =>
    nameNotTakenValidator(() => taken)(new FormControl(value));

  it('should refuse a name in use when it differs only in case and spaces', () => {
    expect(validate(' spring  SHOW', ['Spring show'])).toEqual({ nameTaken: true });
  });

  it('should pass a new name', () => {
    expect(validate('Summer show', ['Spring show'])).toBeNull();
  });

  it('should pass an empty name, which required reports', () => {
    expect(validate('  ', ['Spring show'])).toBeNull();
  });
});
