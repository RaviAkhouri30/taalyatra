import { EditorTab } from './editor-tab.enum';
import { Permissions } from './permissions.model';
import { PageAccess } from './role.model';
import { TourTarget, firstTabUrl, tourSeenKey, tourSteps } from './tour.model';

describe('tour model', () => {
  const owner = Permissions.owner({ uid: 'owner', email: 'o@b.co' });
  const manager = (pages: [EditorTab, PageAccess][]) =>
    Permissions.manager(
      { uid: 'manager', email: 'm@b.co' },
      { email: 'm@b.co', pages: new Map(pages), uploads: true, addedAt: 'x' },
    );

  it('should give the owner every step, the editor ones on the Hero page', () => {
    const steps = tourSteps(owner);

    expect(steps.map((step) => step.id)).toEqual([
      'welcome',
      'menu',
      'find',
      'cards',
      'preview',
      'publish-bar',
      'review',
      'owner-pages',
      'help',
    ]);
    expect(steps.find((step) => step.target === TourTarget.Cards)?.url).toBe('/admin/hero');
    expect(steps.find((step) => step.id === 'menu')?.inMenu).toBe(true);
  });

  it('should leave the owner’s areas out of a manager’s tour, with their own words', () => {
    const steps = tourSteps(manager([[EditorTab.Hero, PageAccess.Hidden]]));

    expect(steps).toHaveLength(8);
    expect(steps.map((step) => step.id)).not.toContain('owner-pages');
    expect(steps.find((step) => step.id === 'cards')?.url).toBe('/admin/offer');
    expect(steps.find((step) => step.id === 'review')?.text).toContain('Send yours for approval');
  });

  it('should leave the editor steps out when a manager sees no page', () => {
    const hidden = Object.values(EditorTab).map((tab): [EditorTab, PageAccess] => [
      tab,
      PageAccess.Hidden,
    ]);

    expect(firstTabUrl(manager(hidden))).toBeNull();
    expect(tourSteps(manager(hidden)).map((step) => step.id)).toEqual([
      'welcome',
      'menu',
      'find',
      'review',
      'help',
    ]);
  });

  it('should remember the offer per account', () => {
    expect(tourSeenKey('abc')).toBe('taal-yatra.tour.seen.abc');
  });
});
