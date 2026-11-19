import { type IDraft } from '@core/interfaces/i-draft';
import { SECTIONS_WITH_TABS } from '../schemas/editor-tabs';
import { Permissions } from './permissions.model';
import { PublishPageModel } from './publish-page.model';
import { Review, documentTitles } from './review.model';

describe('PublishPageModel', () => {
  const now = new Date('2026-10-31T10:00:00Z');
  const owner = { uid: 'owner', email: 'o@b.co' };
  const draft = (path: string): IDraft => ({
    path,
    content: {},
    savedAt: '2026-10-31T10:00:00.000Z',
  });

  function page(
    drafts: ReadonlyMap<string, IDraft>,
    history: ConstructorParameters<typeof PublishPageModel>[1] = [],
  ) {
    const review = new Review(
      {
        permissions: Permissions.owner(owner),
        drafts,
        requests: [],
        live: new Map(),
        emails: new Map(),
        ownerUid: owner.uid,
      },
      documentTitles(SECTIONS_WITH_TABS),
    );
    return new PublishPageModel(review, history, SECTIONS_WITH_TABS, null);
  }

  it('should list the review’s changes', () => {
    const model = page(new Map([['home/unknown', draft('home/unknown')]]));

    expect(model.changes.map((change) => change.title)).toEqual(['home/unknown']);
  });

  it('should run the checks on the ticked changes only', () => {
    const model = page(new Map([['home/hero', draft('home/hero')]]));

    expect(model.reportFor(new Set(['home/hero']), now).canPublish).toBe(false);
    expect(model.reportFor(new Set(), now).canPublish).toBe(true);
  });

  it('should describe the history, with who published', () => {
    const record = {
      id: 'r',
      publishedAt: '2026-10-30T10:00:00.000Z',
      changed: ['home/hero', 'home/team'],
      before: {},
    };
    const model = page(new Map(), [
      { ...record, id: 'c', by: 'manager', byEmail: 'm@b.co' },
      { ...record, id: 'b', by: owner.uid, approvedFrom: 'm@b.co' },
      { ...record, id: 'a', by: 'owner-before' },
      record,
    ]);

    // Named by tab and card: the Team tab's heading card is called "Section heading".
    expect(model.history[0]?.title).toBe('Hero; Team · Section heading');
    expect(model.history.map((entry) => entry.who)).toEqual([
      'by m@b.co',
      'by you, approved from m@b.co',
      'by the owner',
      'by you',
    ]);
    expect(model.history.map((entry) => entry.newest)).toEqual([true, false, false, false]);
  });
});
