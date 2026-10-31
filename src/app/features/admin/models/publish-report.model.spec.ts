import fakeDb from '@core/backends/fake/fake-db.json';
import { type DocumentFields } from '@core/interfaces/i-document-store';
import { ALL_SECTIONS } from '../schemas/editor-tabs';
import { type IDraft } from '@core/interfaces/i-draft';
import { PublishReport } from './publish-report.model';

describe('PublishReport', () => {
  const now = new Date('2026-11-20T06:00:00Z');
  const config = fakeDb.site.config as unknown as DocumentFields;
  const hero = fakeDb.home.hero as unknown as DocumentFields;

  function report(path: string, content: DocumentFields): PublishReport {
    const draft: IDraft = { path, content, savedAt: 'x' };
    return PublishReport.check(new Map([[path, draft]]), ALL_SECTIONS, now);
  }

  it('should find nothing in the stored hero', () => {
    const result = report('home/hero', hero);

    expect(result.canPublish).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  it('should block an empty required field, naming its section and field', () => {
    const result = report('home/hero', { ...hero, title: ' ' });

    expect(result.canPublish).toBe(false);
    expect(result.errors).toEqual([
      expect.objectContaining({
        section: 'Hero',
        field: 'Headline, first line',
        message: 'Fill this in.',
      }),
    ]);
  });

  it('should warn about leftover placeholders without blocking', () => {
    const result = report('home/offer', fakeDb.home.offer);

    expect(result.canPublish).toBe(true);
    expect(result.warnings.map((issue) => issue.field)).toContain(
      'Offer card 1 · Duration and price',
    );
  });

  it('should block an offer that ends before it starts', () => {
    const promotion = {
      ...(config['promotion'] as object),
      startsOn: '2026-12-10',
      endsOn: '2026-12-01',
    };

    const result = report('site/config', { ...config, promotion });

    expect(result.errors.map((issue) => issue.message)).toContain(
      'The offer ends before it starts.',
    );
  });

  it('should warn when a live offer has already ended, but not when it is switched off', () => {
    const ended = {
      ...(config['promotion'] as object),
      live: true,
      startsOn: null,
      endsOn: '2026-11-10',
    };

    expect(report('site/config', { ...config, promotion: ended }).warnings[0]?.message).toBe(
      'This offer has ended, so visitors won’t see it.',
    );
    expect(
      report('site/config', { ...config, promotion: { ...ended, live: false } }).warnings,
    ).toEqual([]);
  });

  it('should accept an offer with no end date', () => {
    expect(report('site/config', config).canPublish).toBe(true);
  });

  it('should check nothing when there are no drafts', () => {
    const result = PublishReport.check(new Map(), ALL_SECTIONS, now);

    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });
});
