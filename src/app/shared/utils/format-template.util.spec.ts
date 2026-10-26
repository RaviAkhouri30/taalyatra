import { formatTemplate } from './format-template.util';

describe('formatTemplate', () => {
  it('should fill every placeholder', () => {
    expect(formatTemplate('Saved {count} beats in {mode}.', { count: 4, mode: 'jam' })).toBe(
      'Saved 4 beats in jam.',
    );
  });

  it('should leave unknown placeholders and plain copy as written', () => {
    expect(formatTemplate('Level {level}')).toBe('Level {level}');
    expect(formatTemplate('No placeholders')).toBe('No placeholders');
  });
});
