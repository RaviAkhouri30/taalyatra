import { type IDraft } from '@core/interfaces/i-draft';
import { ALL_SECTIONS } from '../schemas/editor-tabs';
import { ApprovalStatus, type IApproval } from './approval.model';
import { EditorTab } from './editor-tab.enum';
import { DraftAction, Permissions } from './permissions.model';
import {
  A_MANAGER,
  type IReviewInput,
  Review,
  THE_OWNER,
  YOU,
  changesWord,
  documentTitles,
  planButtonText,
  planConfirmText,
} from './review.model';
import { PageAccess } from './role.model';

describe('Review', () => {
  const OWNER = { uid: 'owner', email: 'o@b.co' };
  const MANAGER = { uid: 'manager', email: 'm@b.co' };
  const role = {
    email: MANAGER.email,
    pages: new Map([
      [EditorTab.Hero, PageAccess.Publish],
      [EditorTab.Team, PageAccess.Hidden],
    ]),
    uploads: true,
    addedAt: '2026-11-19T10:00:00.000Z',
  };
  const draft = (path: string, savedBy?: string): IDraft => ({
    path,
    content: { title: path },
    savedAt: '2026-10-31T10:00:00.000Z',
    ...(savedBy === undefined ? {} : { savedBy }),
  });
  const waiting: IApproval = {
    id: 'r1',
    by: MANAGER.uid,
    email: MANAGER.email,
    paths: ['home/offer'],
    note: '',
    sentAt: '2026-10-31T10:00:00.000Z',
    status: ApprovalStatus.Waiting,
    answer: '',
    answeredAt: '',
  };
  const drafts = new Map([
    ['home/hero', draft('home/hero', MANAGER.uid)],
    ['home/shows', draft('home/shows')],
    ['home/videos', draft('home/videos', 'other-manager')],
    ['home/team', draft('home/team', OWNER.uid)],
    ['home/offer', draft('home/offer', MANAGER.uid)],
  ]);

  function review(input: Partial<IReviewInput> = {}): Review {
    return new Review(
      {
        permissions: Permissions.owner(OWNER),
        drafts,
        requests: [waiting],
        live: new Map(),
        emails: new Map([[MANAGER.uid, MANAGER.email]]),
        ownerUid: OWNER.uid,
        ...input,
      },
      (path) => `Title of ${path}`,
    );
  }

  it('should name who made each change, leaving out waiting ones, for the owner', () => {
    const changes = review().changes;

    expect(changes.map((change) => [change.path, change.author])).toEqual([
      ['home/hero', MANAGER.email],
      ['home/shows', YOU],
      ['home/videos', A_MANAGER],
      ['home/team', YOU],
    ]);
    expect(changes[0]).toMatchObject({ title: 'Title of home/hero', action: DraftAction.Publish });
    expect(review().waiting).toEqual(new Set(['home/offer']));
  });

  it('should tick the owner’s own changes, including unsigned ones from before 2.0.0', () => {
    expect(review().mine()).toEqual(new Set(['home/shows', 'home/team']));
  });

  it('should show a manager only the pages they see, with what publishing each does', () => {
    const manager = review({ permissions: Permissions.manager(MANAGER, role) });

    expect(manager.changes.map((change) => [change.path, change.author, change.action])).toEqual([
      ['home/hero', YOU, DraftAction.Publish],
      ['home/shows', THE_OWNER, DraftAction.Approval],
      ['home/videos', A_MANAGER, DraftAction.Approval],
    ]);
    expect(manager.mine()).toEqual(new Set(['home/hero']));
  });

  it('should split the ticked changes into published and sent for approval', () => {
    const manager = review({ permissions: Permissions.manager(MANAGER, role) });

    expect(manager.planFor(new Set(['home/hero', 'home/shows', 'home/offer']))).toEqual({
      publish: ['home/hero'],
      send: ['home/shows'],
      approve: [],
    });
  });

  it('should hand over the drafts of the documents asked for, skipping unknown ones', () => {
    expect([...review().draftsOf(['home/hero', 'home/none']).keys()]).toEqual(['home/hero']);
  });

  it('should keep the permissions and requests it was given', () => {
    expect(review().permissions.isOwner).toBe(true);
    expect(review().requests).toEqual([waiting]);
  });

  // A manager who can approve (0023).
  it('should approve the changes that need approval instead of sending them', () => {
    const manager = review({
      permissions: Permissions.manager(MANAGER, { ...role, canApprove: true }),
    });

    expect(manager.planFor(new Set(['home/hero', 'home/shows']))).toEqual({
      publish: ['home/hero'],
      send: [],
      approve: ['home/shows'],
    });
  });
});

describe('review wording', () => {
  it('should name a document by the cards that edit it, or by its path', () => {
    const titleOf = documentTitles(ALL_SECTIONS);

    expect(titleOf('site/config')).toBe('Offer switch and dates, Site details, Contact details');
    expect(titleOf('home/x')).toBe('home/x');
  });

  it.each([
    [{ publish: ['a'], send: [], approve: [] }, 'Publish changes'],
    [{ publish: [], send: ['a'], approve: [] }, 'Send for approval'],
    [
      { publish: ['a'], send: ['b', 'c'], approve: [] },
      'Publish 1 change, send 2 changes for approval',
    ],
  ])('should label the button for %j', (plan, label) => {
    expect(planButtonText(plan)).toBe(label);
  });

  it('should say which changes are published and which are sent', () => {
    expect(planConfirmText({ publish: ['a', 'b'], send: [], approve: [] })).toBe(
      'Publish 2 changes? Visitors see them on their next visit.',
    );
    expect(planConfirmText({ publish: ['a'], send: ['b'], approve: [] })).toMatch(
      /^Publish 1 change\?.* Send 1 change to the owner for approval\?/u,
    );
    expect(changesWord(3)).toBe('3 changes');
  });

  // A manager who can approve (0023).
  it.each([
    [{ publish: [], send: [], approve: ['a', 'b'] }, 'Approve and publish 2 changes'],
    [{ publish: ['a'], send: [], approve: ['b', 'c'] }, 'Publish 1 change, approve and publish 2'],
  ])('should name the button for %o', (plan, text) => {
    expect(planButtonText(plan)).toBe(text);
  });

  it('should say the owner sees the title and note when confirming', () => {
    expect(planConfirmText({ publish: [], send: [], approve: ['a'] })).toBe(
      'Approve 1 change yourself and publish it? The owner sees your title and note in the history.',
    );
  });
});
