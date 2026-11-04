import { placeholderMessage } from './placeholder';

describe('placeholderMessage', () => {
  it('should quote the unfinished copy', () => {
    expect(placeholderMessage('From [Add price] per person')).toBe(
      'Still has a placeholder: “[Add price]”.',
    );
  });

  it.each(['Finished copy', '', '[]', 2026, null, undefined])('should find none in %s', (value) => {
    expect(placeholderMessage(value)).toBeNull();
  });
});
