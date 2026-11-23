import fakeDb from '@core/backends/fake/fake-db.json';
import { PromotionStatus } from '@shared/enums/promotion-status.enum';
import { DashboardModel, type IDashboardSource } from './dashboard.model';
import { IssueSeverity } from './issue-severity.enum';
import { Lead } from './lead.model';
import { ApprovalStatus, type IApproval } from './approval.model';
import { EditorTab } from './editor-tab.enum';
import { Permissions } from './permissions.model';
import { PageAccess } from './role.model';

describe('DashboardModel', () => {
  const now = new Date('2026-11-05T06:00:00Z');
  const config = fakeDb.site.config;
  const source = (change: Partial<IDashboardSource> = {}): IDashboardSource => ({
    changeCount: 0,
    lastPublish: null,
    siteConfig: config,
    visibility: fakeDb.site.visibility,
    warnings: [],
    lastBackupAt: null,
    visits: null,
    leads: null,
    now,
    permissions: Permissions.owner({ uid: 'owner', email: 'o@b.co' }),
    requests: [],
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
    expect(dashboard.hidden).toBe('Everything is showing: every section, page and button.');
    expect(dashboard.lastPublished).toBe('Nothing published from the editor yet.');
    expect(dashboard.backup.due).toBe(true);
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

    expect(dashboard.hidden).toBe('Hidden: 2 sections, 1 page, 0 buttons or bars.');
    expect(new DashboardModel(source({ visibility: null })).hidden).toContain(
      'Everything is showing',
    );
  });

  it('should keep the placeholder warnings it was given', () => {
    const warning = {
      severity: IssueSeverity.Warning,
      sectionId: 'offer',
      section: 'Hero',
      field: 'Title',
      message: 'x',
    };

    expect(new DashboardModel(source({ warnings: [warning] })).warnings).toEqual([warning]);
  });

  it('should say how many leads are new, and who sent the latest', () => {
    const leads = [
      new Lead('b', { name: 'Asha', createdAt: { seconds: 1_793_000_000 } }),
      new Lead('a', { name: 'Ravi', status: 'won' }),
    ];

    const dashboard = new DashboardModel(source({ leads }));

    expect(dashboard.newLeads).toBe(1);
    expect(dashboard.leads).toMatch(/^1 lead is new\. The latest is from Asha, /);
  });

  it('should say when every lead is followed up', () => {
    const dashboard = new DashboardModel(
      source({ leads: [new Lead('a', { name: 'Ravi', status: 'lost' })] }),
    );

    expect(dashboard.leads).toMatch(/^Every lead is followed up\./);
  });

  it('should say when there are no proposals yet', () => {
    expect(new DashboardModel(source({ leads: [] })).leads).toBe('No proposals yet.');
  });

  it('should say when the leads and visits could not be read', () => {
    const dashboard = new DashboardModel(source());

    expect(dashboard.leads).toBe('Couldn’t read the leads just now.');
    expect(dashboard.visits).toBe('Couldn’t read the visits just now.');
  });

  it('should sum up the last week of visits', () => {
    const dashboard = new DashboardModel(
      source({
        visits: {
          days: [{ day: '2026-11-04', total: 5, pages: {}, devices: {} }],
          today: '2026-11-05',
        },
      }),
    );

    expect(dashboard.visits).toBe('5 visits in the last 7 days.');
  });

  describe('what needs the owner (0030)', () => {
    const recent = '2026-11-01T10:00:00.000Z';

    it('should be all caught up with nothing to publish, approve, back up or answer', () => {
      expect(new DashboardModel(source({ lastBackupAt: recent })).caughtUp).toBe(true);
    });

    it.each([
      ['changes to publish', { changeCount: 1, lastBackupAt: recent }],
      ['a backup due', {}],
    ])('should not be caught up with %s', (_case, change) => {
      expect(new DashboardModel(source(change)).caughtUp).toBe(false);
    });

    it('should mark approvals as waiting only for the owner, when one waits', () => {
      const waiting = { status: ApprovalStatus.Waiting } as IApproval;

      const dashboard = new DashboardModel(source({ requests: [waiting], lastBackupAt: recent }));

      expect(dashboard.access.approvalsWaiting).toBe(true);
      expect(dashboard.caughtUp).toBe(false);
    });

    it('should give the Visits card the last 7 days, and none when unread', () => {
      const visits = {
        days: [{ day: '2026-11-05', total: 3, pages: {}, devices: {} }],
        today: '2026-11-05',
      };

      expect(new DashboardModel(source({ visits })).visitsWeek.at(-1)).toEqual({
        day: '2026-11-05',
        total: 3,
      });
      expect(new DashboardModel(source()).visitsWeek).toEqual([]);
    });
  });

  describe('who is looking (0019)', () => {
    const request = (by: string, status: ApprovalStatus): IApproval => ({
      id: `${by}-${status}`,
      by,
      email: `${by}@b.co`,
      paths: ['home/hero'],
      note: '',
      sentAt: 'x',
      status,
      answer: '',
      answeredAt: '',
    });
    const requests = [
      request('manager', ApprovalStatus.Waiting),
      request('manager', ApprovalStatus.SentBack),
      request('manager', ApprovalStatus.SentBack),
      request('other', ApprovalStatus.Waiting),
    ];
    const manager = Permissions.manager(
      { uid: 'manager', email: 'manager@b.co' },
      {
        email: 'manager@b.co',
        pages: new Map([[EditorTab.Visibility, PageAccess.Hidden]]),
        uploads: true,
        addedAt: 'x',
      },
      new Date(0),
    );

    it('should show the owner every card, and approvals only when something waits', () => {
      expect(new DashboardModel(source()).access).toMatchObject({
        owner: true,
        canSeeOffer: true,
        canSeeVisibility: true,
        showApprovals: false,
      });
      expect(new DashboardModel(source({ requests })).access).toMatchObject({
        showApprovals: true,
        approvalsHeading: 'Waiting for approval',
        approvals: '2 changes wait for your approval.',
      });
    });

    it('should show a manager their own requests and pages only', () => {
      const access = new DashboardModel(source({ permissions: manager, requests })).access;

      expect(access).toMatchObject({
        owner: false,
        canSeeOffer: true,
        canSeeVisibility: false,
        showApprovals: true,
        approvalsHeading: 'Your requests',
        approvals: '1 change waits for the owner; 2 were sent back to you.',
      });
    });

    it('should tell a manager with no requests where they are sent from', () => {
      const access = new DashboardModel(source({ permissions: manager })).access;

      expect(access.approvals).toContain('Nothing waiting for the owner.');
    });

    it('should show a super manager the queue and their notice, as the owner sees it (0024)', () => {
      const superManager = Permissions.manager(
        { uid: 'super', email: 'super@b.co' },
        {
          email: 'super@b.co',
          pages: new Map(),
          uploads: false,
          addedAt: 'x',
          superManager: { since: 'x', untilMs: null },
        },
        new Date(0),
      );
      const dashboard = new DashboardModel(source({ permissions: superManager, requests }));

      expect(dashboard.access).toMatchObject({
        owner: true,
        approvalsHeading: 'Waiting for approval',
        approvals: '2 changes wait for your approval.',
      });
      expect(dashboard.superNotice).toBe(
        'You’re a super manager: you approve changes for the owner.',
      );
      expect(new DashboardModel(source({ permissions: manager })).superNotice).toBe('');
    });
  });
});
