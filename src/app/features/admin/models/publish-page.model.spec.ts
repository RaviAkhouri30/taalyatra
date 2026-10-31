import { type IDraft } from '@core/interfaces/i-draft';
import { ALL_SECTIONS } from '../schemas/editor-tabs';
import { PublishPageModel } from './publish-page.model';

describe('PublishPageModel', () => {
  const now = new Date('2026-10-31T10:00:00Z');
  const draft = (path: string): IDraft => ({
    path,
    content: {},
    savedAt: '2026-10-31T10:00:00.000Z',
  });

  it('should name each changed document by the cards that edit it', () => {
    const page = new PublishPageModel(
      new Map([
        ['site/config', draft('site/config')],
        ['home/unknown', draft('home/unknown')],
      ]),
      [],
      ALL_SECTIONS,
      now,
    );

    expect(page.changes.map((change) => change.title)).toEqual([
      'Offer switch and dates, Site details, Contact details',
      'home/unknown',
    ]);
    expect(page.changes[0]?.savedAt).toBe('31 Oct 2026, 3:30 pm');
    expect(page.confirmText).toBe(
      'Publish 2 changed documents? Visitors see the changes on their next visit.',
    );
  });

  it('should run the checks and describe the history', () => {
    const page = new PublishPageModel(
      new Map([['home/hero', draft('home/hero')]]),
      [
        {
          id: 'r',
          publishedAt: '2026-10-30T10:00:00.000Z',
          changed: ['home/hero', 'home/team'],
          before: {},
        },
      ],
      ALL_SECTIONS,
      now,
    );

    expect(page.report.canPublish).toBe(false);
    expect(page.history[0]?.title).toBe('Hero; Team');
    expect(page.confirmText).toContain('Publish 1 changed document?');
  });
});
