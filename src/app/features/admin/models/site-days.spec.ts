import {
  addDays,
  addMonths,
  longMonth,
  monthOf,
  shortDay,
  shortMonth,
  siteDay,
  weekOf,
  yearOf,
} from './site-days';

describe('site days', () => {
  it('should put a moment on its day in India, not in UTC', () => {
    // 19:30 UTC on 17 Nov is 1 am on 18 Nov in Pune.
    expect(siteDay(Date.parse('2026-11-17T19:30:00Z'))).toBe('2026-11-18');
  });

  it('should add and take away days across a month end', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it.each([
    ['2026-11-16', '2026-11-16'],
    ['2026-11-18', '2026-11-16'],
    ['2026-11-22', '2026-11-16'],
  ])('should start the week of %s on Monday %s', (day, monday) => {
    expect(weekOf(day)).toBe(monday);
  });

  it('should find a day’s month and year, and step months across a year end', () => {
    expect(monthOf('2026-11-18')).toBe('2026-11');
    expect(yearOf('2026-11-18')).toBe('2026');
    expect(addMonths('2026-11', 2)).toBe('2027-01');
    expect(addMonths('2026-01', -1)).toBe('2025-12');
  });

  it('should label days and months for the owner', () => {
    expect(shortDay('2026-11-18')).toBe('18 Nov');
    expect(shortMonth('2026-11')).toBe('Nov');
    expect(longMonth('2026-11')).toBe('November 2026');
  });
});
