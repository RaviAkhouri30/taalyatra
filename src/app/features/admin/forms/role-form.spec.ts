import { EditorTab } from '../models/editor-tab.enum';
import { PageAccess } from '../models/role.model';
import { createRoleForm, fillRoleForm, resetRoleForm, roleFormValue, roleOf } from './role-form';

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
    return createRoleForm('owner-uid', () => new Set(listed));
  }

  it('should start with the defaults: needs approval everywhere, uploads on', () => {
    const value = roleFormValue(form());

    expect(value.pages.size).toBe(15);
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
    const role = roleOf(value, '2026-11-19T10:00:00.000Z');

    expect(value.uid).toBe('new-manager');
    expect(role).toMatchObject({ email: 'new@b.co', addedAt: '2026-11-19T10:00:00.000Z' });
  });
});
