import { EditorTab } from './editor-tab.enum';
import { type IRole, PageAccess } from './role.model';
import { PAGE_ROWS, accessGroups, accessLabel, byEmail, superText } from './team-access.model';

describe('team access model', () => {
  const role = (pages: [EditorTab, PageAccess][], email = 'm@b.c'): IRole => ({
    email,
    pages: new Map(pages),
    uploads: true,
    addedAt: '2026-11-19T10:00:00.000Z',
  });

  it('should list every editor page, in the side panel’s order', () => {
    expect(PAGE_ROWS).toHaveLength(24);
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

  describe('a super manager (0024)', () => {
    const END = Date.parse('2026-11-30T18:30:00Z');
    const superRole = (untilMs: number | null, email = 'm@b.c'): IRole => ({
      ...role([], email),
      superManager: { since: 'x', untilMs },
    });

    it.each([
      ['for good', null, END, 'For good'],
      ['before the end', END, END - 1, 'Until 30 Nov 2026'],
      ['after the end', END, END, 'Ended 30 Nov 2026'],
    ])('should say how long one lasts %s', (_case, untilMs, now, text) => {
      expect(superText(superRole(untilMs), new Date(now))).toBe(text);
    });

    it('should say nothing for a manager who isn’t one', () => {
      expect(superText(role([]), new Date(END))).toBe('');
    });

    it('should list super managers first, then by email', () => {
      const managers = [
        { uid: 'a', role: role([], 'a@b.c') },
        { uid: 'z', role: superRole(null, 'z@b.c') },
        { uid: 'b', role: role([], 'b@b.c') },
      ];

      expect(byEmail(managers).map((manager) => manager.uid)).toEqual(['z', 'a', 'b']);
    });
  });
});
