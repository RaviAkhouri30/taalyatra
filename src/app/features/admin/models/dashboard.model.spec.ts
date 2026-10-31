import fakeDb from '@core/backends/fake/fake-db.json';
import { PromotionStatus } from '@shared/enums/promotion-status.enum';
import { DashboardModel, type IDashboardSource } from './dashboard.model';
import { IssueSeverity } from './issue-severity.enum';

describe('DashboardModel', () => {
  const now = new Date('2026-11-05T06:00:00Z');
  const config = fakeDb.site.config;
  const source = (change: Partial<IDashboardSource> = {}): IDashboardSource => ({
    changeCount: 0,
    lastPublish: null,
    siteConfig: config,
    visibility: fakeDb.site.visibility,
    warnings: [],
    now,
    ...change,
  });
  const withPromotion = (promotion: object) => ({
    ...config,
    promotion: { ...config.promotion, ...promotion },
  });

  it('should sum up a fresh site', () => {
    const dashboard = new DashboardModel(source());

    expect(dashboard.changes).toBe('Everything is published.');
    expect(dashboard.offerStatus).toBe(PromotionStatus.Live);
    expect(dashboard.offer).toBe('Live, with no end date.');
    expect(dashboard.hidden).toBe('Every section, page and widget is on.');
    expect(dashboard.lastPublished).toBe('Nothing published from the editor yet.');
  });

  it('should count drafts and name the last publish', () => {
    const dashboard = new DashboardModel(
      source({
        changeCount: 2,
        lastPublish: { id: 'x', publishedAt: '2026-10-31T10:00:00.000Z', changed: [], before: {} },
      }),
    );

    expect(dashboard.changes).toBe('2 documents have unpublished changes.');
    expect(new DashboardModel(source({ changeCount: 1 })).changes).toBe(
      '1 document has unpublished changes.',
    );
    expect(dashboard.lastPublished).toBe('Last published 31 Oct 2026, 3:30 pm.');
  });

  it.each([
    [{ endsOn: '2026-11-10' }, 'Live until 10 Nov 2026.'],
    [{ startsOn: '2026-12-01' }, 'Scheduled to start on 1 Dec 2026.'],
    [{ endsOn: '2026-11-01' }, 'Ended on 1 Nov 2026.'],
    [{ live: false }, 'Switched off.'],
  ])('should describe an offer with %j', (promotion, text) => {
    expect(new DashboardModel(source({ siteConfig: withPromotion(promotion) })).offer).toBe(text);
  });

  it('should treat a site without a promotion as switched off', () => {
    const dashboard = new DashboardModel(source({ siteConfig: null }));

    expect(dashboard.offerStatus).toBe(PromotionStatus.Off);
  });

  it('should count what is hidden', () => {
    const dashboard = new DashboardModel(
      source({ visibility: { sections: { gallery: false, faq: false }, pages: { team: false } } }),
    );

    expect(dashboard.hidden).toBe('Hidden: 2 sections, 1 page, 0 widgets.');
    expect(new DashboardModel(source({ visibility: null })).hidden).toContain('Every section');
  });

  it('should keep the placeholder warnings it was given', () => {
    const warning = {
      severity: IssueSeverity.Warning,
      section: 'Hero',
      field: 'Title',
      message: 'x',
    };

    expect(new DashboardModel(source({ warnings: [warning] })).warnings).toEqual([warning]);
  });
});
