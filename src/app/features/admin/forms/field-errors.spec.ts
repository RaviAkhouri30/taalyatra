import { fieldErrorMessage } from './field-errors';

describe('fieldErrorMessage', () => {
  it.each([
    [{ required: true }, 'Fill this in.'],
    [{ maxlength: { requiredLength: 40, actualLength: 41 } }, 'Use at most 40 characters.'],
    [{ url: true }, 'Use a full link, starting with https://.'],
    [{ phone: true }, 'Use the international format, for example +919284276168.'],
    [{ email: true }, 'Use a valid email address.'],
    [{ date: true }, 'Use a valid date.'],
    [{ min: { min: 2020, actual: 1999 } }, 'Use a number of at least 2020.'],
    [{ max: { max: 2100, actual: 3000 } }, 'Use a number of at most 2100.'],
    [{ somethingElse: true }, 'Check this value.'],
  ])('should explain %j', (errors, message) => {
    expect(fieldErrorMessage(errors)).toBe(message);
  });

  it('should say nothing when the value is valid', () => {
    expect(fieldErrorMessage(null)).toBeNull();
  });

  it('should still explain a length error without its details', () => {
    expect(fieldErrorMessage({ maxlength: true })).toBe('Use at most 0 characters.');
  });
});
