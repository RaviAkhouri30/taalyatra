import { ManagerArea } from './manager-area.enum';
import { EditorTab } from './editor-tab.enum';
import { PageAccess, pageAccess, roleFields, toRole } from './role.model';

describe('role model', () => {
  const stored = {
    email: 'content-manager@taalyatra.in',
    pages: { hero: 'publish', team: 'hidden' },
    uploads: true,
    areas: { leads: true, visits: false, backups: true, goingBack: false },
    addedAt: '2026-11-19T10:00:00.000Z',
  };

  it('should read a stored role', () => {
    const role = toRole(stored);

    expect(role?.email).toBe('content-manager@taalyatra.in');
    expect(role?.pages.get(EditorTab.Hero)).toBe(PageAccess.Publish);
    expect(role?.uploads).toBe(true);
  });

  it('should drop unknown pages and settings, so they need approval', () => {
    const role = toRole({ ...stored, pages: { secret: 'publish', offer: 'admin' } });

    expect(role?.pages.size).toBe(0);
  });

  it.each([
    ['nothing stored', null],
    ['no email', { ...stored, email: 1 }],
    ['no date', { ...stored, addedAt: undefined }],
  ])('should give no role when there is %s', (_case, fields) => {
    expect(toRole(fields)).toBeNull();
  });

  it('should allow uploads only for an explicit yes', () => {
    expect(toRole({ ...stored, uploads: 'true' })?.uploads).toBe(false);
  });

  it('should treat a page without a setting as needing approval', () => {
    const role = toRole(stored);

    expect(role && pageAccess(role, EditorTab.Offer)).toBe(PageAccess.Approval);
    expect(role && pageAccess(role, EditorTab.Team)).toBe(PageAccess.Hidden);
  });

  it('should store a role in the shape it was read from', () => {
    const role = toRole(stored);

    expect(role && roleFields(role)).toEqual(stored);
  });

  it('should read the areas switched on when a role has them', () => {
    expect([...(toRole(stored)?.areas ?? [])]).toEqual([ManagerArea.Leads, ManagerArea.Backups]);
  });

  it.each([
    ['no areas', undefined],
    ['a malformed map', 'all'],
    ['a switch that isn’t true', { leads: 'yes' }],
  ])('should give no areas when a role has %s', (_case, areas) => {
    expect(toRole({ ...stored, areas })?.areas?.size).toBe(0);
  });
});
