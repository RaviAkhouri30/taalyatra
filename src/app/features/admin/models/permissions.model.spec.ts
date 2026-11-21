import { ContentPath } from './content-path.enum';
import { EditorTab } from './editor-tab.enum';
import { AccountKind, DraftAction, Permissions } from './permissions.model';
import { ManagerArea } from './manager-area.enum';
import { type IRole, PageAccess } from './role.model';

const USER = { uid: 'manager', email: 'm@b.c' };

function manager(pages: [EditorTab, PageAccess][], uploads = true): Permissions {
  const role: IRole = { email: USER.email, pages: new Map(pages), uploads, addedAt: 'x' };
  return Permissions.manager(USER, role, new Date(0));
}

describe('Permissions', () => {
  it('should let the owner see, publish and upload everything', () => {
    const owner = Permissions.owner({ uid: 'owner', email: 'o@b.c' });

    expect(owner.kind).toBe(AccountKind.Owner);
    expect(owner.canPublish(EditorTab.Team)).toBe(true);
    expect(owner.canUpload).toBe(true);
    expect(owner.canSeePath('anything')).toBe(true);
    expect(owner.draftAction(ContentPath.SiteConfig, { credit: 'x' }, {})).toBe(
      DraftAction.Publish,
    );
  });

  it('should give no access to someone signed out or never added', () => {
    const nobody = Permissions.none(USER);

    expect(nobody.canEdit).toBe(false);
    expect(nobody.canSee(EditorTab.Hero)).toBe(false);
    expect(nobody.canUpload).toBe(false);
    expect(Permissions.none().uid).toBe('');
  });

  it('should follow a manager’s settings, with approval as the default', () => {
    const permissions = manager([
      [EditorTab.Hero, PageAccess.Publish],
      [EditorTab.Team, PageAccess.Hidden],
    ]);

    expect(permissions.isManager).toBe(true);
    expect(permissions.canPublish(EditorTab.Hero)).toBe(true);
    expect(permissions.access(EditorTab.Offer)).toBe(PageAccess.Approval);
    expect(permissions.canSee(EditorTab.Team)).toBe(false);
    expect(permissions.canSeePath(ContentPath.Team)).toBe(false);
    expect(permissions.canSeePath(ContentPath.HomeHero)).toBe(true);
  });

  it('should follow the manager’s upload switch', () => {
    expect(manager([], false).canUpload).toBe(false);
    expect(manager([]).canUpload).toBe(true);
  });

  it('should publish a page the manager may publish, and send the others for approval', () => {
    const permissions = manager([[EditorTab.Hero, PageAccess.Publish]]);

    expect(permissions.draftAction(ContentPath.HomeHero, { title: 'x' }, null)).toBe(
      DraftAction.Publish,
    );
    expect(permissions.draftAction(ContentPath.HomeOffer, { title: 'x' }, null)).toBe(
      DraftAction.Approval,
    );
  });

  it('should publish the site details only when every changed part is the manager’s', () => {
    const permissions = manager([[EditorTab.Business, PageAccess.Publish]]);
    const live = { brand: { name: 'A' }, contact: { email: 'a@b.c' } };

    expect(
      permissions.draftAction(ContentPath.SiteConfig, { ...live, brand: { name: 'B' } }, live),
    ).toBe(DraftAction.Publish);
    expect(
      permissions.draftAction(
        ContentPath.SiteConfig,
        { brand: { name: 'B' }, contact: { email: 'x@b.c' } },
        live,
      ),
    ).toBe(DraftAction.Approval);
    expect(permissions.draftAction(ContentPath.SiteConfig, { ...live, credit: 'x' }, live)).toBe(
      DraftAction.Approval,
    );
  });

  it('should publish an unchanged draft when the manager may publish one of its pages', () => {
    const live = { brand: { name: 'A' } };

    expect(
      manager([[EditorTab.Business, PageAccess.Publish]]).draftAction(
        ContentPath.SiteConfig,
        live,
        live,
      ),
    ).toBe(DraftAction.Publish);
    expect(manager([]).draftAction(ContentPath.SiteConfig, live, live)).toBe(DraftAction.Approval);
  });

  describe('a super manager (0024)', () => {
    const END = Date.parse('2026-11-30T18:30:00Z');
    const role: IRole = {
      email: USER.email,
      pages: new Map([[EditorTab.Team, PageAccess.Hidden]]),
      uploads: false,
      canApprove: true,
      addedAt: 'x',
      superManager: { since: 'x', untilMs: END },
    };
    const before = Permissions.manager(USER, role, new Date(END - 1));
    const after = Permissions.manager(USER, role, new Date(END));

    it('should stand in for the owner until the end, with every page and area', () => {
      expect(before.isSuper).toBe(true);
      expect(before.actsAsOwner).toBe(true);
      expect(before.isOwner).toBe(false);
      expect(before.canPublish(EditorTab.Team)).toBe(true);
      expect(before.canUse(ManagerArea.Leads)).toBe(true);
      expect(before.canUpload).toBe(true);
      expect(before.canPublishPath('anything')).toBe(true);
      expect(before.canSeePath('anything')).toBe(true);
      expect(before.draftAction(ContentPath.SiteConfig, { credit: 'x' }, {})).toBe(
        DraftAction.Publish,
      );
    });

    it('should need no self-approval while super', () => {
      expect(before.canApproveOwn).toBe(false);
      expect(after.canApproveOwn).toBe(true);
    });

    it('should give the end while it runs, and none for good or for others', () => {
      const forGood = Permissions.manager(
        USER,
        { ...role, superManager: { since: 'x', untilMs: null } },
        new Date(END),
      );

      expect(before.superEndsAt?.getTime()).toBe(END);
      expect(forGood.superEndsAt).toBeNull();
      expect(after.superEndsAt).toBeNull();
      expect(Permissions.owner(USER).superEndsAt).toBeNull();
    });

    it('should go back to the manager’s own settings when it ends', () => {
      expect(after.isSuper).toBe(false);
      expect(after.actsAsOwner).toBe(false);
      expect(after.canSee(EditorTab.Team)).toBe(false);
      expect(after.canUse(ManagerArea.Leads)).toBe(false);
      expect(after.canUpload).toBe(false);
    });
  });
});
