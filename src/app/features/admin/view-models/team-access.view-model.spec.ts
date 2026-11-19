import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { ToastService } from '@shared/services/toast.service';
import { EditorTab } from '../models/editor-tab.enum';
import { PageAccess } from '../models/role.model';
import { RoleFormMode } from '../models/team-access.model';
import { RolesService } from '../services/roles.service';
import { EDITOR_ADMIN, EDITOR_NOW, provideEditorTesting } from '../testing/editor-testing';
import { TEAM_MESSAGES, TeamAccessViewModel } from './team-access.view-model';

const ADDED = '2026-10-01T10:00:00.000Z';

describe('TeamAccessViewModel', () => {
  function setUp(seed: Record<string, Record<string, unknown>> = {}) {
    const testing = provideEditorTesting({
      'roles/manager-uid': {
        email: 'm@b.co',
        pages: { hero: 'publish' },
        uploads: true,
        addedAt: ADDED,
      },
      ...seed,
    });
    const show = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        ...testing.providers,
        { provide: ToastService, useValue: { show } },
        TeamAccessViewModel,
      ],
    });
    const model = TestBed.inject(TeamAccessViewModel);
    model.init().subscribe();
    const manager = () => model.data()![0]!;
    return { model, show, manager, ...testing };
  }

  it('should list the managers and count them', () => {
    const { model } = setUp();

    expect(model.data()?.map((manager) => manager.role.email)).toEqual(['m@b.co']);
    expect(model.count()).toBe('1 manager');
    expect(model.mode()).toBe(RoleFormMode.Closed);
  });

  it('should count more than one manager in the plural', () => {
    const { model } = setUp({
      'roles/other': { email: 'a@b.co', pages: {}, uploads: false, addedAt: ADDED },
    });

    expect(model.count()).toBe('2 managers');
  });

  it('should add a manager with the date they were added', () => {
    const { model, store, show } = setUp();
    model.add();
    model.form.patchValue({ uid: 'new-manager', email: 'new@b.co' });
    model.form.controls.pages.controls[EditorTab.Team]?.setValue(PageAccess.Hidden);

    model.save();

    expect(store.documents.get('roles/new-manager')).toMatchObject({
      email: 'new@b.co',
      uploads: true,
      addedAt: EDITOR_NOW.toISOString(),
    });
    expect(store.documents.get('roles/new-manager')?.['pages']).toMatchObject({
      team: 'hidden',
      hero: 'approval',
    });
    expect(model.data()?.map((manager) => manager.uid)).toEqual(['manager-uid', 'new-manager']);
    expect(model.mode()).toBe(RoleFormMode.Closed);
    expect(show).toHaveBeenCalledWith(TEAM_MESSAGES.saved('new@b.co'));
  });

  it('should save nothing and show the errors when the form is incomplete', () => {
    const { model, store } = setUp();
    model.add();

    model.save();

    expect(model.form.controls.uid.touched).toBe(true);
    expect(store.commits).toHaveLength(0);
    expect(model.formHeading()).toBe('Add a manager');
  });

  it('should refuse adding the owner, who is never on the list', () => {
    const { model, store } = setUp();
    model.add();
    model.form.patchValue({ uid: EDITOR_ADMIN.uid, email: EDITOR_ADMIN.email });

    model.save();

    expect(model.form.controls.uid.errors).toEqual({ ownerAccount: true });
    expect(store.commits).toHaveLength(0);
  });

  it('should change a manager, keeping the date they were first added', () => {
    const { model, store, manager } = setUp();
    model.edit(manager());
    expect(model.formHeading()).toBe('Change m@b.co');
    model.form.controls.uploads.setValue(false);

    model.save();

    expect(store.documents.get('roles/manager-uid')).toMatchObject({
      uploads: false,
      addedAt: ADDED,
    });
    expect(store.documents.get('roles/manager-uid')?.['pages']).toMatchObject({ hero: 'publish' });
    expect(model.data()).toHaveLength(1);
  });

  it('should close the form without saving', () => {
    const { model, store } = setUp();
    model.add();

    model.closeForm();

    expect(model.mode()).toBe(RoleFormMode.Closed);
    expect(store.commits).toHaveLength(0);
  });

  it('should say so, and keep the form open, when a save fails', () => {
    const { model, show, manager } = setUp();
    vi.spyOn(TestBed.inject(RolesService), 'save').mockReturnValue(
      throwError(() => new Error('denied')),
    );
    model.edit(manager());

    model.save();

    expect(show).toHaveBeenCalledWith(TEAM_MESSAGES.saveFailed, ToastTone.Error);
    expect(model.mode()).toBe(RoleFormMode.Editing);
    expect(model.saving()).toBe(false);
  });

  it('should remove a manager only after the owner confirms', () => {
    const { model, store, show, manager } = setUp();

    model.askToRemove(manager());
    expect(model.confirming()).toBe('manager-uid');
    model.remove(manager());

    expect(store.documents.has('roles/manager-uid')).toBe(false);
    expect(model.data()).toEqual([]);
    expect(model.confirming()).toBeNull();
    expect(show).toHaveBeenCalledWith(TEAM_MESSAGES.removed('m@b.co'));
  });

  it('should forget a removal the owner cancelled', () => {
    const { model, manager } = setUp();
    model.askToRemove(manager());

    model.cancelRemove();

    expect(model.confirming()).toBeNull();
  });

  it('should say so when a removal fails', () => {
    const { model, show, manager } = setUp();
    vi.spyOn(TestBed.inject(RolesService), 'remove').mockReturnValue(
      throwError(() => new Error('denied')),
    );

    model.remove(manager());

    expect(show).toHaveBeenCalledWith(TEAM_MESSAGES.removeFailed, ToastTone.Error);
    expect(model.data()).toHaveLength(1);
    expect(model.removing()).toBe(false);
  });

  it('should say when the managers could not be read', () => {
    vi.spyOn(RolesService.prototype, 'managers').mockReturnValue(
      throwError(() => new Error('denied')),
    );
    const { model } = setUp();

    expect(model.failed()).toBe(true);
    expect(model.data()).toBeUndefined();
  });
});
