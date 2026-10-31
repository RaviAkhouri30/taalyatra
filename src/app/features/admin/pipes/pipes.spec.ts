import { FieldErrorPipe } from './field-error.pipe';
import { TextLengthPipe } from './text-length.pipe';

describe('editor pipes', () => {
  it('should turn errors into a sentence, and nothing into an empty string', () => {
    const pipe = new FieldErrorPipe();

    expect(pipe.transform({ required: true })).toBe('Fill this in.');
    expect(pipe.transform(null)).toBe('');
  });

  it('should count the characters of text only', () => {
    const pipe = new TextLengthPipe();

    expect(pipe.transform('Diwali')).toBe(6);
    expect(pipe.transform(2026)).toBe(0);
  });
});
