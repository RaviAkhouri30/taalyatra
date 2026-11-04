import { MIN_PHONE_VISITS, SpeedReportModel, isExpired, reportTime } from './speed-report.model';

describe('SpeedReportModel', () => {
  const visit = (device: string, lcp: number | null, extra: object = {}) => ({
    device,
    lcp,
    fcp: 800,
    ttfb: 100,
    ready: 900,
    cls: 0.01,
    ...extra,
  });
  const phones = (count: number, lcp: number) =>
    Array.from({ length: count }, () => visit('phone', lcp));

  it('should say so when there are no visits', () => {
    const report = new SpeedReportModel([]);

    expect(report.verdict).toBe('No visits reported yet.');
    expect(report.rows).toEqual([]);
  });

  it('should take the 75th percentile, per device, in a fixed order', () => {
    const report = new SpeedReportModel([
      visit('desktop', 900),
      ...[1000, 2000, 3000, 4000].map((lcp) => visit('phone', lcp)),
    ]);

    expect(report.rows.map((row) => row.device)).toEqual(['Phone', 'Desktop']);
    expect(report.rows[0]).toEqual({
      device: 'Phone',
      visits: 4,
      lcp: '3.0 s',
      ready: '0.9 s',
      fcp: '0.8 s',
      ttfb: '0.1 s',
      cls: '0.01',
    });
  });

  it('should leave out what a browser could not measure, but still count the visit', () => {
    const report = new SpeedReportModel([visit('phone', null), visit('phone', 2000)]);

    expect(report.rows[0]).toMatchObject({ visits: 2, lcp: '2.0 s' });
  });

  it('should show a dash when nothing was measured', () => {
    const report = new SpeedReportModel([{ device: 'phone', lcp: null }]);

    expect(report.rows[0]).toMatchObject({ lcp: '—', cls: '—' });
  });

  it('should ignore a report from an unknown device', () => {
    expect(new SpeedReportModel([visit('fridge', 1000)]).rows).toEqual([]);
  });

  it('should not answer until there are enough phone visits with a measurement', () => {
    const report = new SpeedReportModel([
      ...phones(MIN_PHONE_VISITS - 1, 1000),
      visit('phone', null),
      visit('desktop', 1000),
    ]);

    expect(report.verdict).toContain(`${String(MIN_PHONE_VISITS - 1)} phone visits measured`);
  });

  it('should say phones meet the target at exactly the target', () => {
    const report = new SpeedReportModel(phones(MIN_PHONE_VISITS, 2500));

    expect(report.verdict).toContain('Phones meet the 2.5 s target');
    expect(report.verdict).toContain('2.5 s.');
  });

  it('should say phones are over the target just past it', () => {
    expect(new SpeedReportModel(phones(MIN_PHONE_VISITS, 3800)).verdict).toContain(
      'Phones are over the 2.5 s target',
    );
  });

  describe('age', () => {
    const now = new Date('2026-11-05T00:00:00Z');
    const daysAgo = (days: number) => ({
      createdAt: { seconds: now.getTime() / 1000 - days * 86_400 },
    });

    it('should read the stored time', () => {
      expect(reportTime({ createdAt: { seconds: 10 } })).toBe(10_000);
    });

    it.each([{}, { createdAt: 'x' }, { createdAt: { seconds: 'x' } }])(
      'should not guess a time from %j',
      (report) => {
        expect(reportTime(report)).toBeNull();
      },
    );

    it('should expire a report past 30 days, and not one at 30 days', () => {
      expect(isExpired(daysAgo(31), now)).toBe(true);
      expect(isExpired(daysAgo(30), now)).toBe(false);
    });

    it('should keep a report whose age can not be told', () => {
      expect(isExpired({}, now)).toBe(false);
    });
  });
});
