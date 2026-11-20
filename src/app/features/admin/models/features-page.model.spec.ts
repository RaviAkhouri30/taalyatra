import { EditorTab } from './editor-tab.enum';
import { FeatureGroup } from './features.constants';
import { MANAGED_BY_OWNER, featureGroups } from './features-page.model';
import { Permissions } from './permissions.model';
import { PageAccess } from './role.model';

describe('featureGroups', () => {
  const owner = Permissions.owner({ uid: 'owner', email: 'o@b.co' });
  const manager = Permissions.manager(
    { uid: 'manager', email: 'm@b.co' },
    {
      email: 'm@b.co',
      pages: new Map([[EditorTab.Team, PageAccess.Hidden]]),
      uploads: true,
      addedAt: 'x',
    },
  );
  const cards = (groups: ReturnType<typeof featureGroups>) =>
    groups.flatMap((group) => group.cards);

  it('should show the owner every feature, grouped in menu order, each with a way to change it', () => {
    const groups = featureGroups(owner);
    const offer = cards(groups).find((card) => card.id === 'offer');

    expect(groups.map((group) => group.label)).toEqual([
      FeatureGroup.HomePage,
      FeatureGroup.EveryPage,
      FeatureGroup.Admin,
    ]);
    expect(cards(groups)).toHaveLength(25);
    expect(offer).toMatchObject({ site: '/#diwali', changeUrl: '/admin/offer', note: '' });
    expect(cards(groups).find((card) => card.id === 'leads')?.changeUrl).toBe('/admin/leads');
  });

  it('should leave a manager the owner’s areas out, and say who manages a hidden page', () => {
    const shown = cards(featureGroups(manager));

    expect(shown.map((card) => card.id)).not.toContain('leads');
    expect(shown.map((card) => card.id)).not.toContain('team-access');
    expect(shown.find((card) => card.id === 'team')).toMatchObject({
      changeUrl: null,
      note: MANAGED_BY_OWNER,
      site: '/#team',
    });
  });

  it('should say where a feature without a page is used', () => {
    const find = cards(featureGroups(owner)).find((card) => card.id === 'find');

    expect(find).toMatchObject({ changeUrl: null, site: null });
    expect(find?.note).toContain('Find box');
  });

  it('should leave out a group with nothing in it', () => {
    expect(featureGroups(owner, [])).toEqual([]);
  });
});
