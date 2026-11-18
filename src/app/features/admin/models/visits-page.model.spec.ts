import { ChartPeriod } from './chart';
import { type IVisitDay } from './visit-days';
import { VisitsPageModel, recentVisitsText } from './visits-page.model';

describe('VisitsPageModel', () => {
  const day = (date: string, total: number, extra: Partial<IVisitDay> = {}): IVisitDay => ({
    day: date,
    total,
    pages: {},
    devices: {},
    ...extra,
  });

  it('should say when counting began, and draw both graphs', () => {
    const page = new VisitsPageModel(
      [day('2026-11-17', 2), day('2026-11-18', 3)],
      new Map([['2026-11-18', 1]]),
      '2026-11-18',
    );

    expect(page.countedSince).toBe('17 Nov 2026');
    expect(page.visitsChart(ChartPeriod.Day).total).toBe(5);
    expect(page.proposalsChart(ChartPeriod.Day).summary).toBe(
      '1 proposal in the last 30 days, up from 0 the 30 days before.',
    );
  });

  it('should show nothing counted yet before the first visit', () => {
    const page = new VisitsPageModel([], new Map(), '2026-11-18');

    expect(page.countedSince).toBeNull();
    expect(page.visitsChart(ChartPeriod.Day).bars.at(-2)?.value).toBeNull();
    expect(page.pages(ChartPeriod.Day)).toEqual([]);
  });

  it('should break visits down by page and device in the period, most first', () => {
    const page = new VisitsPageModel(
      [
        day('2026-01-01', 9, { pages: { '/team': 9 } }),
        day('2026-11-18', 4, { pages: { '/': 3, '/shows': 1 }, devices: { phone: 1, desktop: 3 } }),
      ],
      new Map(),
      '2026-11-18',
    );

    expect(page.pages(ChartPeriod.Day)).toEqual([
      { name: 'Home page', count: 3, share: 75 },
      { name: 'Shows', count: 1, share: 25 },
    ]);
    expect(page.devices(ChartPeriod.Day).map((row) => row.name)).toEqual(['Computer', 'Phone']);
    expect(page.pages(ChartPeriod.Year)[0]?.name).toBe('Team');
  });
});

describe('recentVisitsText', () => {
  const day = (date: string, total: number): IVisitDay => ({
    day: date,
    total,
    pages: {},
    devices: {},
  });

  it('should say when nothing is counted yet', () => {
    expect(recentVisitsText([], '2026-11-18')).toMatch(/^No visits counted yet/);
  });

  it('should compare the last week with the one before, once both were counted', () => {
    const days = [day('2026-11-01', 1), day('2026-11-08', 4), day('2026-11-18', 6)];

    expect(recentVisitsText(days, '2026-11-18')).toBe(
      '6 visits in the last 7 days, up from 4 the week before.',
    );
  });

  it('should not compare with a week before counting began', () => {
    expect(recentVisitsText([day('2026-11-18', 1)], '2026-11-18')).toBe(
      '1 visit in the last 7 days.',
    );
  });
});
