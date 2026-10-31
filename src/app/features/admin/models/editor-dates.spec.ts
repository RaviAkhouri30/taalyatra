import { formatDay, formatMoment } from './editor-dates';

describe('editor dates', () => {
  it('should show a stored day as a readable date', () => {
    expect(formatDay('2026-11-01')).toBe('1 Nov 2026');
  });

  it('should show a stored moment in Pune time', () => {
    expect(formatMoment('2026-10-31T10:00:00.000Z')).toBe('31 Oct 2026, 3:30 pm');
  });

  it('should show an unreadable stored date as it is instead of failing', () => {
    expect(formatDay('soon')).toBe('soon');
    expect(formatMoment('x')).toBe('x');
  });
});
