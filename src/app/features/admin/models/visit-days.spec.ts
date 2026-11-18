import { addUp, planTidy, storedDay } from './visit-days';

describe('visit days', () => {
  /** A stored visit at noon India time on the day. */
  const visit = (day: string, page = '/', device = 'phone') => ({
    page,
    device,
    createdAt: { seconds: Date.parse(`${day}T06:30:00Z`) / 1000 },
  });

  it('should add a day up in total, by page and by device, ignoring unknown values', () => {
    const day = addUp('2026-11-17', [
      visit('2026-11-17', '/', 'phone'),
      visit('2026-11-17', '/shows', 'desktop'),
      visit('2026-11-17', '/admin', 'fridge'),
    ]);

    expect(day).toEqual({
      day: '2026-11-17',
      total: 3,
      pages: { '/': 1, '/shows': 1 },
      devices: { phone: 1, desktop: 1 },
    });
  });

  it('should read a damaged stored day as no visits', () => {
    expect(storedDay('2026-11-17', { total: 'x', pages: null, devices: { phone: 'x' } })).toEqual({
      day: '2026-11-17',
      total: 0,
      pages: {},
      devices: {},
    });
  });

  it('should add finished days up and plan to remove their visits, leaving today', () => {
    const visits = new Map([
      ['a', visit('2026-11-17')],
      ['b', visit('2026-11-17')],
      ['c', visit('2026-11-18')],
    ]);

    const tidy = planTidy(visits, new Map(), '2026-11-18');

    expect(tidy.newDays.map((day) => [day.day, day.total])).toEqual([['2026-11-17', 2]]);
    expect([...tidy.removals]).toEqual([['2026-11-17', ['a', 'b']]]);
    expect(tidy.days.map((day) => [day.day, day.total])).toEqual([
      ['2026-11-17', 2],
      ['2026-11-18', 1],
    ]);
  });

  it('should only remove the visits of a day another device already added up', () => {
    const stored = new Map([['2026-11-17', { total: 5, pages: {}, devices: {} }]]);

    const tidy = planTidy(new Map([['a', visit('2026-11-17')]]), stored, '2026-11-18');

    expect(tidy.newDays).toEqual([]);
    expect([...tidy.removals]).toEqual([['2026-11-17', ['a']]]);
    expect(tidy.days[0]?.total).toBe(5);
  });

  it('should leave a day after today alone, when this device’s clock is behind', () => {
    const tidy = planTidy(new Map([['a', visit('2026-11-19')]]), new Map(), '2026-11-18');

    expect(tidy.removals.size).toBe(0);
    expect(tidy.days.map((day) => day.day)).toEqual(['2026-11-19']);
  });

  it('should count a visit without a time as today’s', () => {
    const tidy = planTidy(
      new Map([['a', { page: '/', device: 'phone' }]]),
      new Map(),
      '2026-11-18',
    );

    expect(tidy.days).toEqual([
      { day: '2026-11-18', total: 1, pages: { '/': 1 }, devices: { phone: 1 } },
    ]);
  });
});
