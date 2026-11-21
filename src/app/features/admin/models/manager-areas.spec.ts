import { EditorTab } from './editor-tab.enum';
import { navGroupsFor } from './editor-nav.constants';
import { featureGroups } from './features-page.model';
import { type IPublishRecord } from './i-publish-record';
import { ManagerArea } from './manager-area.enum';
import { Permissions } from './permissions.model';
import { canGoBackOver } from './publish-page.model';
import { type IRole, PageAccess } from './role.model';
import { AREA_ROWS, areasText } from './team-access.model';
import { tourSteps } from './tour.model';

const USER = { uid: 'manager', email: 'm@b.c' };
const OWNER = Permissions.owner({ uid: 'owner', email: 'o@b.c' });

function role(areas: ManagerArea[], pages: [EditorTab, PageAccess][] = []): IRole {
  return {
    email: USER.email,
    pages: new Map(pages),
    uploads: true,
    addedAt: 'x',
    areas: new Set(areas),
  };
}

const manager = (areas: ManagerArea[], pages: [EditorTab, PageAccess][] = []) =>
  Permissions.manager(USER, role(areas, pages), new Date(0));

const record = (id: string, changed: string[]): IPublishRecord => ({
  id,
  publishedAt: 'x',
  changed,
  before: {},
});

const links = (permissions: Permissions) =>
  navGroupsFor(permissions).flatMap((group) => group.links.map((link) => link.label));

/** The owner's areas for chosen managers (0022). */
describe('manager areas', () => {
  describe('Permissions.canUse', () => {
    it('should let the owner use every area', () => {
      expect(Object.values(ManagerArea).every((area) => OWNER.canUse(area))).toBe(true);
    });

    it('should let a manager use only the areas they were given', () => {
      const permissions = manager([ManagerArea.Leads]);

      expect(permissions.canUse(ManagerArea.Leads)).toBe(true);
      expect(permissions.canUse(ManagerArea.Visits)).toBe(false);
    });

    it('should give a manager without areas none', () => {
      const permissions = Permissions.manager(
        USER,
        {
          email: USER.email,
          pages: new Map(),
          uploads: true,
          addedAt: 'x',
        },
        new Date(0),
      );

      expect(permissions.canUse(ManagerArea.Backups)).toBe(false);
    });
  });

  describe('Permissions.canPublishPath', () => {
    it('should allow a page’s document when the manager may publish that page', () => {
      expect(manager([], [[EditorTab.Hero, PageAccess.Publish]]).canPublishPath('home/hero')).toBe(
        true,
      );
    });

    it('should refuse a document when one page that edits it needs approval', () => {
      expect(
        manager([], [[EditorTab.Business, PageAccess.Publish]]).canPublishPath('site/config'),
      ).toBe(false);
    });

    it('should refuse a document no page edits', () => {
      expect(manager([]).canPublishPath('media/x')).toBe(false);
    });
  });

  describe('the menu', () => {
    it('should show a manager Leads and Visits only when given them', () => {
      expect(links(manager([ManagerArea.Leads]))).toContain('Leads');
      expect(links(manager([ManagerArea.Leads]))).not.toContain('Visits');
      expect(links(manager([]))).not.toContain('Leads');
    });

    it('should keep Team access the owner’s whatever areas a manager has', () => {
      expect(links(manager(Object.values(ManagerArea)))).not.toContain('Team access');
    });
  });

  describe('canGoBackOver', () => {
    const hero = manager([ManagerArea.GoingBack], [[EditorTab.Hero, PageAccess.Publish]]);
    const history = [record('newest', ['home/hero']), record('older', ['home/team'])];

    it('should let the owner go back over any publish', () => {
      expect(canGoBackOver(OWNER, history, 1)).toBe(true);
    });

    it('should let a manager with Going back go back over a publish of their own pages', () => {
      expect(canGoBackOver(hero, history, 0)).toBe(true);
    });

    it('should refuse when that publish, or a later one, changed a page they can’t publish', () => {
      expect(canGoBackOver(hero, history, 1)).toBe(false);
    });

    it('should refuse a manager without Going back', () => {
      expect(canGoBackOver(manager([], [[EditorTab.Hero, PageAccess.Publish]]), history, 0)).toBe(
        false,
      );
    });
  });

  describe('the tour', () => {
    it('should leave the owner’s areas step out for a manager without any', () => {
      expect(tourSteps(manager([])).map((step) => step.id)).not.toContain('owner-pages');
    });

    it('should tell a manager which areas they were given, pointing at the menu', () => {
      const step = tourSteps(manager([ManagerArea.Visits])).find(
        (entry) => entry.id === 'owner-pages',
      );

      expect(step?.title).toBe('Given to you');
      expect(step?.text).toContain('Visits and speed');
      expect(step?.inMenu).toBe(true);
    });

    it('should show the step on its own when the areas have no menu link', () => {
      const step = tourSteps(manager([ManagerArea.Backups])).find(
        (entry) => entry.id === 'owner-pages',
      );

      expect(step?.target).toBeNull();
      expect(step?.inMenu).toBe(false);
    });
  });

  describe('Features', () => {
    const titles = (permissions: Permissions) =>
      featureGroups(permissions).flatMap((group) => group.cards.map((card) => card.title));

    it('should list an area for a manager given it, and keep Team access the owner’s', () => {
      expect(titles(manager([ManagerArea.Leads]))).toContain('Leads');
      expect(titles(manager([ManagerArea.Leads]))).not.toContain('Team access');
      expect(titles(manager([]))).not.toContain('Leads');
    });
  });

  describe('Team access', () => {
    it('should offer the four areas, saying what Leads shows', () => {
      expect(AREA_ROWS.map((row) => row.label)).toEqual([
        'Leads',
        'Visits and speed',
        'Backups',
        'Going back',
      ]);
      expect(AREA_ROWS[0]?.description).toContain('names, phone numbers and emails');
    });

    it('should name a manager’s areas in order, and nothing for none', () => {
      expect(areasText(role([ManagerArea.Backups, ManagerArea.Leads]))).toBe('Leads, Backups');
      expect(areasText(role([]))).toBe('');
    });
  });
});
