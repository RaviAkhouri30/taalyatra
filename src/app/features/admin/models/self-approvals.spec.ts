import { type IPublishRecord } from './i-publish-record';
import { Permissions } from './permissions.model';
import { newestSelfApproval, unseenSelfApprovals } from './self-approvals';
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
    expect(unseenSelfApprovals(HISTORY, null)).toBe(2);
  });

  it('should count only those newer than the last one seen', () => {
    expect(unseenSelfApprovals(HISTORY, 'a')).toBe(1);
  });

  it('should find the newest self-approval, or none', () => {
    expect(newestSelfApproval(HISTORY)).toBe('c');
    expect(newestSelfApproval([record('b', false)])).toBeNull();
  });

  it('should let only a manager with the switch approve their own changes', () => {
    const user = { uid: 'm', email: 'm@b.c' };

    expect(Permissions.manager(user, { ...ROLE, canApprove: true }).canApproveOwn).toBe(true);
    expect(Permissions.manager(user, ROLE).canApproveOwn).toBe(false);
    expect(Permissions.owner(user).canApproveOwn).toBe(false);
  });
});
