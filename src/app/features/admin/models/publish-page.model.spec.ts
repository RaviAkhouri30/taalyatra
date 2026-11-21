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

  it('should show a self-approval with its title and note, or "Self-approved" (0023)', () => {
    const record = { publishedAt: '2026-11-21T10:00:00.000Z', changed: ['home/offer'], before: {} };
    const model = page(new Map(), [
      {
        ...record,
        id: 'b',
        by: 'manager',
        byEmail: 'm@b.co',
        selfApproval: { title: 'Diwali', note: 'Dates' },
      },
      {
        ...record,
        id: 'a',
        by: 'manager',
        byEmail: 'm@b.co',
        selfApproval: { title: '', note: '' },
      },
    ]);

    expect(model.history[0]?.who).toBe('self-approved by m@b.co');
    expect(model.history.map((entry) => entry.approval)).toEqual([
      { title: 'Diwali', note: 'Dates' },
      { title: 'Self-approved', note: '' },
    ]);
  });

  it('should name a super manager’s approval as given for the owner (0024)', () => {
    const model = page(new Map(), [
      {
        id: 'a',
        publishedAt: '2026-11-21T10:00:00.000Z',
        changed: ['home/offer'],
        before: {},
        by: 'super',
        byEmail: 's@b.co',
        approvedFrom: 'm@b.co',
        forOwner: true,
      },
    ]);

    expect(model.history[0]?.who).toBe('approved by s@b.co for the owner, sent by m@b.co');
  });
});
