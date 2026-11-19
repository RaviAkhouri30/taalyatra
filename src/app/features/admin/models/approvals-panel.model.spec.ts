import fakeDb from '@core/backends/fake/fake-db.json';
import { ApprovalStatus, type IApproval } from './approval.model';
import { approvalsPanel } from './approvals-panel.model';
import { Permissions } from './permissions.model';

describe('approvalsPanel', () => {
  const OWNER = { uid: 'owner', email: 'o@b.co' };
  const MANAGER = { uid: 'manager', email: 'm@b.co' };
  const role = { email: MANAGER.email, pages: new Map(), uploads: true, addedAt: 'x' };
  const request = (id: string, by: string, status: ApprovalStatus): IApproval => ({
    id,
    by,
    email: `${by}@b.co`,
    paths: ['home/hero'],
    note: '',
    sentAt: '2026-10-31T09:00:00.000Z',
    status,
    answer: '',
    answeredAt: status === ApprovalStatus.Waiting ? '' : '2026-10-31T10:00:00.000Z',
  });
  const requests = [
    request('a', 'manager', ApprovalStatus.Waiting),
    request('b', 'manager', ApprovalStatus.SentBack),
    request('c', 'other', ApprovalStatus.Waiting),
  ];
  const input = (permissions: Permissions, content = fakeDb.home.hero) => ({
    permissions,
    requests,
    drafts: new Map([['home/hero', { path: 'home/hero', content, savedAt: 'x' }]]),
    libraryIds: null,
    now: new Date('2026-10-31T10:00:00.000Z'),
  });

  it('should show the owner every waiting request, with its problems', () => {
    const panel = approvalsPanel(
      input(Permissions.owner(OWNER), { ...fakeDb.home.hero, title: '' }),
    );

    expect(panel.owner).toBe(true);
    expect(panel.requests.map((view) => view.approval.id)).toEqual(['a', 'c']);
    expect(panel.requests[0]).toMatchObject({ title: 'Hero', sentAt: '31 Oct 2026, 2:30 pm' });
    expect(panel.requests[0]?.problems).toBeGreaterThan(0);
  });

  it('should count no problems for a request whose drafts are fine or gone', () => {
    const panel = approvalsPanel({ ...input(Permissions.owner(OWNER)), drafts: new Map() });

    expect(panel.requests[0]?.problems).toBe(0);
  });

  it('should show a manager their own requests, answered ones included', () => {
    const panel = approvalsPanel(input(Permissions.manager(MANAGER, role)));

    expect(panel.owner).toBe(false);
    expect(panel.requests.map((view) => view.approval.id)).toEqual(['a', 'b']);
    expect(panel.requests[1]?.answeredAt).toBe('31 Oct 2026, 3:30 pm');
    expect(panel.requests[0]?.answeredAt).toBe('');
  });
});
