import { ChartPeriod, type IChartSource, buildChart, bucketOf, comparison, startOf } from './chart';

describe('chart', () => {
  const source = (
    daily: Record<string, number>,
    change: Partial<IChartSource> = {},
  ): IChartSource => ({
    daily: new Map(Object.entries(daily)),
    today: '2026-11-18',
    since: null,
    noun: { one: 'visit', many: 'visits' },
    ...change,
  });

  it('should show the last 30 days, oldest first, ending today', () => {
    const chart = buildChart(ChartPeriod.Day, source({ '2026-11-18': 4, '2026-10-20': 1 }));

    expect(chart.bars).toHaveLength(30);
    expect(chart.bars[0]).toMatchObject({ key: '2026-10-20', label: '20 Oct', value: 1 });
    expect(chart.bars.at(-1)).toMatchObject({ key: '2026-11-18', title: '18 Nov 2026', value: 4 });
    expect(chart.max).toBe(4);
  });

  it('should compare with the period before when it was counted in full', () => {
    const chart = buildChart(
      ChartPeriod.Week,
      source({ '2026-11-18': 3, '2026-08-01': 2 }, { since: '2026-01-01' }),
    );

    expect(chart.bars).toHaveLength(12);
    expect(chart.summary).toBe('3 visits in the last 12 weeks, up from 2 the 12 weeks before.');
  });

  it('should not compare with a period before counting began', () => {
    const chart = buildChart(ChartPeriod.Day, source({ '2026-11-18': 1 }, { since: '2026-11-10' }));

    expect(chart.summary).toBe('1 visit in the last 30 days.');
  });

  it('should show days before counting began as not counted, not as zero', () => {
    const chart = buildChart(ChartPeriod.Day, source({}, { since: '2026-11-17' }));

    expect(chart.bars.at(-3)?.value).toBeNull();
    expect(chart.bars.at(-2)?.value).toBe(0);
    expect(chart.max).toBe(1);
  });

  it('should group months, and sum up a year since counting began', () => {
    const months = buildChart(ChartPeriod.Month, source({ '2026-11-01': 2, '2026-11-18': 3 }));
    const years = buildChart(
      ChartPeriod.Year,
      source({ '2025-06-01': 4, '2026-11-18': 1 }, { since: '2025-06-01' }),
    );

    expect(months.bars.at(-1)).toMatchObject({ key: '2026-11', label: 'Nov', value: 5 });
    expect(years.bars.map((bar) => [bar.label, bar.value])).toEqual([
      ['2025', 4],
      ['2026', 1],
    ]);
    expect(years.summary).toBe('5 visits since counting began.');
  });

  it('should count every year with proposals when there is no counting start', () => {
    const years = buildChart(
      ChartPeriod.Year,
      source({ '2025-06-01': 1 }, { noun: { one: 'proposal', many: 'proposals' } }),
    );

    expect(years.bars).toHaveLength(2);
    expect(years.summary).toBe('1 proposal in all.');
  });

  it.each([
    [5, 5, 'the same as'],
    [6, 5, 'up from'],
    [4, 5, 'down from'],
  ])('should compare %i with %i as "%s"', (total, previous, words) => {
    expect(comparison(total, previous)).toBe(words);
  });

  it('should find a period’s bucket and first day', () => {
    expect(bucketOf(ChartPeriod.Week, '2026-11-18')).toBe('2026-11-16');
    expect(startOf(ChartPeriod.Month, '2026-11')).toBe('2026-11-01');
    expect(startOf(ChartPeriod.Year, '2026')).toBe('2026-01-01');
    expect(startOf(ChartPeriod.Day, '2026-11-18')).toBe('2026-11-18');
  });
});
