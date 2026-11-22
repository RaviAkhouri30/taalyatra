import { ManagerArea } from '../models/manager-area.enum';
import { EditorTab } from '../models/editor-tab.enum';
import { PageAccess } from '../models/role.model';
import { createRoleForm, fillRoleForm, resetRoleForm, roleFormValue, roleOf } from './role-form';

const TODAY = '2026-11-21';

describe('role form', () => {
  const manager = {
    uid: 'manager-uid',
    role: {
      email: 'm@b.co',
      pages: new Map([[EditorTab.Hero, PageAccess.Publish]]),
      uploads: false,
      addedAt: '2026-11-18T10:00:00.000Z',
    },
  };

  function form(listed: string[] = []) {
    return createRoleForm(
      'owner-uid',
      () => new Set(listed),
      () => TODAY,
    );
  }

  it('should start with the defaults: needs approval everywhere, uploads on', () => {
    const value = roleFormValue(form());

    expect(value.pages.size).toBe(21);
    expect([...value.pages.values()].every((access) => access === PageAccess.Approval)).toBe(true);
    expect(value.uploads).toBe(true);
  });

  it('should be invalid until an account id and email are filled in', () => {
    const roleForm = form();
    expect(roleForm.valid).toBe(false);

    roleForm.patchValue({ uid: 'new-manager', email: 'new@b.co' });

    expect(roleForm.valid).toBe(true);
  });

  it('should refuse the owner and an account already listed', () => {
    const roleForm = form(['manager-uid']);

    roleForm.controls.uid.setValue('owner-uid');
    expect(roleForm.controls.uid.errors).toEqual({ ownerAccount: true });
    roleForm.controls.uid.setValue('manager-uid');
    expect(roleForm.controls.uid.errors).toEqual({ listedAccount: true });
  });

  it('should fill in a manager’s settings with their id fixed, so it stays valid', () => {
    const roleForm = form(['manager-uid']);

    fillRoleForm(roleForm, manager);
    const value = roleFormValue(roleForm);

    expect(roleForm.controls.uid.disabled).toBe(true);
    expect(roleForm.valid).toBe(true);
    expect(value.uid).toBe('manager-uid');
    expect(value.pages.get(EditorTab.Hero)).toBe(PageAccess.Publish);
    expect(value.pages.get(EditorTab.Team)).toBe(PageAccess.Approval);
    expect(value.uploads).toBe(false);
  });

  it('should empty the form again for a new manager, with the id typeable', () => {
    const roleForm = form();
    fillRoleForm(roleForm, manager);

    resetRoleForm(roleForm);

    expect(roleForm.controls.uid.enabled).toBe(true);
    expect(roleFormValue(roleForm)).toMatchObject({ uid: '', email: '', uploads: true });
  });

  it('should trim what was typed, and keep the date given', () => {
    const roleForm = form();
    roleForm.patchValue({ uid: ' new-manager ', email: ' new@b.co ' });

    const value = roleFormValue(roleForm);
    const role = roleOf(value, '2026-11-19T10:00:00.000Z', 'x');

    expect(value.uid).toBe('new-manager');
    expect(role).toMatchObject({ email: 'new@b.co', addedAt: '2026-11-19T10:00:00.000Z' });
  });

  it('should start with every owner’s area off', () => {
    expect(roleFormValue(form()).areas.size).toBe(0);
  });

  it('should fill a manager’s areas and keep the ones ticked', () => {
    const roleForm = form();
    fillRoleForm(roleForm, {
      ...manager,
      role: { ...manager.role, areas: new Set([ManagerArea.Backups]) },
    });
    roleForm.controls.areas.controls[ManagerArea.Leads]?.setValue(true);

    const role = roleOf(roleFormValue(roleForm), 'x', 'x');

    expect([...(role.areas ?? [])]).toEqual([ManagerArea.Leads, ManagerArea.Backups]);
  });

  describe('a super manager (0024)', () => {
    const SINCE = '2026-11-20T10:00:00.000Z';

    function superForm() {
      const roleForm = form();
      roleForm.patchValue({ uid: 'new-manager', email: 'new@b.co', superManager: true });
      return roleForm;
    }

    it('should start off, and store no entry when off', () => {
      const role = roleOf(roleFormValue(form()), 'x', SINCE);

      expect(role.superManager).toBeUndefined();
    });

    it('should store one for good', () => {
      const roleForm = superForm();
      roleForm.patchValue({ superEnds: false });

      expect(roleForm.valid).toBe(true);
      expect(roleOf(roleFormValue(roleForm), 'x', SINCE).superManager).toEqual({
        since: SINCE,
        untilMs: null,
      });
    });

    it('should store one until the end of the chosen day in India', () => {
      const roleForm = superForm();
      roleForm.patchValue({ superUntil: '2026-11-30' });

      expect(roleForm.valid).toBe(true);
      expect(roleOf(roleFormValue(roleForm), 'x', SINCE).superManager?.untilMs).toBe(
        Date.parse('2026-11-30T18:30:00Z'),
      );
    });

    it.each([
      ['no day', ''],
      ['a past day', '2026-11-20'],
      ['a malformed day', '30/11/2026'],
    ])('should refuse an end with %s', (_case, day) => {
      const roleForm = superForm();
      roleForm.patchValue({ superUntil: day });

      expect(roleForm.hasError('superUntil')).toBe(true);
    });

    it('should accept today as the last day', () => {
      const roleForm = superForm();
      roleForm.patchValue({ superUntil: TODAY });

      expect(roleForm.valid).toBe(true);
    });

    it.each([
      ['for good', null, false, ''],
      ['until a day', Date.parse('2026-11-30T18:30:00Z'), true, '2026-11-30'],
    ])('should fill in a super manager %s', (_case, untilMs, ends, day) => {
      const roleForm = form();
      fillRoleForm(roleForm, {
        ...manager,
        role: { ...manager.role, superManager: { since: SINCE, untilMs } },
      });

      expect(roleForm.getRawValue()).toMatchObject({
        superManager: true,
        superEnds: ends,
        superUntil: day,
      });
    });
  });
});
