import { EditorTab } from './editor-tab.enum';
import { type IRole, PageAccess } from './role.model';
import { PAGE_ROWS, accessGroups, accessLabel, byEmail } from './team-access.model';

describe('team access model', () => {
  const role = (pages: [EditorTab, PageAccess][], email = 'm@b.c'): IRole => ({
    email,
    pages: new Map(pages),
    uploads: true,
    addedAt: '2026-11-19T10:00:00.000Z',
  });

  it('should list every editor page, in the side panel’s order', () => {
    expect(PAGE_ROWS).toHaveLength(15);
    expect(PAGE_ROWS[0]).toEqual({ tab: EditorTab.Hero, label: 'Hero' });
  });

  it('should group pages by setting, most allowed first, leaving out empty groups', () => {
    const groups = accessGroups(
      role([
        [EditorTab.Videos, PageAccess.Publish],
        [EditorTab.Hero, PageAccess.Publish],
        [EditorTab.Team, PageAccess.Hidden],
      ]),
    );

    expect(groups.map((group) => group.label)).toEqual(['Can publish', 'Needs approval', 'Hidden']);
    expect(groups[0]?.pages).toBe('Hero, Videos');
    expect(groups[2]?.pages).toBe('Team');
  });

  it('should show one group when every page needs approval', () => {
    expect(accessGroups(role([])).map((group) => group.access)).toEqual([PageAccess.Approval]);
  });

  it('should name each setting', () => {
    expect(accessLabel(PageAccess.Hidden)).toBe('Hidden');
  });

  it('should sort managers by email', () => {
    const managers = byEmail([
      { uid: 'b', role: role([], 'zara@b.c') },
      { uid: 'a', role: role([], 'asha@b.c') },
    ]);

    expect(managers.map((manager) => manager.uid)).toEqual(['a', 'b']);
  });
});
