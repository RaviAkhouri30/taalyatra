import { type IPublishRecord } from './i-publish-record';
import { Permissions } from './permissions.model';
import { newestManagersApproval, unseenApprovals, unseenApprovalsText } from './self-approvals';
import { type IRole } from './role.model';

const record = (id: string, self: boolean): IPublishRecord => ({
  id,
  publishedAt: 'x',
  changed: ['home/offer'],
  before: {},
  ...(self ? { selfApproval: { title: '', note: '' } } : {}),
});

const HISTORY = [record('c', true), record('b', false), record('a', true)];
const ROLE: IRole = { email: 'm@b.c', pages: new Map(), uploads: true, addedAt: 'x' };

describe('self-approvals (0023)', () => {
  it('should count every self-approval when the owner has seen none', () => {
    expect(unseenApprovals(HISTORY, null)).toEqual({ self: 2, forOwner: 0 });
  });

  it('should count only those newer than the last one seen', () => {
    expect(unseenApprovals(HISTORY, 'a')).toEqual({ self: 1, forOwner: 0 });
  });

  it('should find the newest self-approval, or none', () => {
    expect(newestManagersApproval(HISTORY)).toBe('c');
    expect(newestManagersApproval([record('b', false)])).toBeNull();
  });

  it('should count and find a super manager’s approvals for the owner too (0024)', () => {
    const history = [{ ...record('d', false), forOwner: true }, ...HISTORY];

    expect(unseenApprovals(history, 'c')).toEqual({ self: 0, forOwner: 1 });
    expect(newestManagersApproval(history)).toBe('d');
  });

  it.each([
    [
      { self: 2, forOwner: 1 },
      '2 changes self-approved and 1 approved for you since you last looked.',
    ],
    [{ self: 1, forOwner: 0 }, '1 change self-approved by managers since you last looked.'],
    [
      { self: 0, forOwner: 2 },
      '2 changes approved for you by a super manager since you last looked.',
    ],
    [{ self: 0, forOwner: 0 }, ''],
  ])('should word %o for the dashboard', (unseen, text) => {
    expect(unseenApprovalsText(unseen)).toBe(text);
  });

  it('should let only a manager with the switch approve their own changes', () => {
    const user = { uid: 'm', email: 'm@b.c' };

    expect(
      Permissions.manager(user, { ...ROLE, canApprove: true }, new Date(0)).canApproveOwn,
    ).toBe(true);
    expect(Permissions.manager(user, ROLE, new Date(0)).canApproveOwn).toBe(false);
    expect(Permissions.owner(user).canApproveOwn).toBe(false);
  });
});
