import { ApprovalStatus, type IApproval } from './approval.model';
import { Permissions } from './permissions.model';
import { waitingNotice } from './waiting-notice.model';

describe('waitingNotice', () => {
  const OWNER = Permissions.owner({ uid: 'owner', email: 'o@b.co' });
  const role = { email: 'm@b.co', pages: new Map(), uploads: true, addedAt: 'x' };
  const MANAGER = Permissions.manager({ uid: 'manager', email: 'm@b.co' }, role, new Date(0));
  const OTHER = Permissions.manager({ uid: 'other', email: 'x@b.co' }, role, new Date(0));
  const request = (
    id: string,
    sentAt: string,
    status = ApprovalStatus.Waiting,
    paths = ['home/hero'],
  ): IApproval => ({
    id,
    by: 'manager',
    email: 'm@b.co',
    paths,
    note: `note ${id}`,
    sentAt,
    status,
    answer: '',
    answeredAt: '',
  });
  const requests = [
    request('old', '2026-10-30T09:00:00.000Z'),
    request('new', '2026-10-31T09:00:00.000Z'),
    request('answered', '2026-11-01T09:00:00.000Z', ApprovalStatus.SentBack),
    request('elsewhere', '2026-11-02T09:00:00.000Z', ApprovalStatus.Waiting, ['home/team']),
  ];

  it('should say nothing when no waiting request covers the page', () => {
    expect(waitingNotice(requests, ['home/offer'], MANAGER)).toBeNull();
  });

  it('should tell the owner, without locking, about the newest waiting request', () => {
    expect(waitingNotice(requests, ['home/hero'], OWNER)).toEqual({
      locked: false,
      text: 'm@b.co sent changes on this page for your approval, 31 Oct 2026, 2:30 pm. Anything you change here becomes part of what you approve.',
      note: 'note new',
    });
  });

  it('should lock the page for the manager who sent it, with their note', () => {
    const notice = waitingNotice(requests, ['home/hero', 'site/config'], MANAGER);

    expect(notice?.locked).toBe(true);
    expect(notice?.text).toContain('You sent changes on this page for approval');
    expect(notice?.note).toBe('note new');
  });

  it('should lock it for another manager too, without the note', () => {
    const notice = waitingNotice(requests, ['home/hero'], OTHER);

    expect(notice).toEqual({
      locked: true,
      text: 'Another change on this page is waiting for the owner’s approval. You can change it again once they answer.',
      note: '',
    });
  });
});
