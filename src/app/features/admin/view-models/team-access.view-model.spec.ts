import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AccountErrorKind } from '@core/enums/account-error-kind.enum';
import {
  ACCOUNT_ERROR_MESSAGES,
  AccountError,
  IAccountService,
} from '@core/interfaces/i-account-service';
import { IAuthService } from '@core/interfaces/i-auth-service';
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
  function setUp(
    seed: Record<string, Record<string, unknown>> = {},
    create: (email: string) => ReturnType<IAccountService['create']> = () => of('made-uid'),
    reset: () => ReturnType<IAuthService['sendPasswordReset']> = () => of(undefined),
  ) {
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
    const accounts = { create: vi.fn(create) };
    const sendPasswordReset = vi.fn(reset);
    TestBed.configureTestingModule({
      providers: [
        ...testing.providers,
        { provide: ToastService, useValue: { show } },
        { provide: IAccountService, useValue: accounts },
        { provide: IAuthService, useValue: { user$: of(null), sendPasswordReset } },
        TeamAccessViewModel,
      ],
    });
    const model = TestBed.inject(TeamAccessViewModel);
    model.init().subscribe();
    const manager = () => model.data()![0]!;
    return { model, show, manager, accounts, sendPasswordReset, ...testing };
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

  it('should add a manager by a pasted id, with the date they were added', () => {
    const { model, store, show } = setUp();
    model.add();
    model.usePastedUid(true);
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

    expect(model.form.controls.email.touched).toBe(true);
    expect(store.commits).toHaveLength(0);
    expect(model.formHeading()).toBe('Add a manager');
  });

  it('should refuse adding the owner, who is never on the list', () => {
    const { model, store } = setUp();
    model.add();
    model.usePastedUid(true);
    model.form.patchValue({ uid: EDITOR_ADMIN.uid, email: EDITOR_ADMIN.email });

    model.save();

    expect(model.form.controls.uid.errors).toEqual({ ownerAccount: true });
    expect(store.commits).toHaveLength(0);
  });

  describe('adding with an email alone (0030)', () => {
    it('should make the account, save its role, then email them to set a password', () => {
      const { model, store, show, accounts, sendPasswordReset } = setUp();
      model.add();
      model.form.patchValue({ email: 'new@b.co' });

      model.save();

      expect(accounts.create).toHaveBeenCalledWith('new@b.co');
      expect(store.documents.get('roles/made-uid')).toMatchObject({ email: 'new@b.co' });
      expect(sendPasswordReset).toHaveBeenCalledWith('new@b.co', '/admin/sign-in');
      expect(show).toHaveBeenCalledWith(TEAM_MESSAGES.invited('new@b.co'));
      expect(model.mode()).toBe(RoleFormMode.Closed);
    });

    it.each([AccountErrorKind.EmailTaken, AccountErrorKind.NotAllowed])(
      'should say why and open the id’s box when the account %s',
      (kind) => {
        const { model, store } = setUp({}, () => throwError(() => new AccountError(kind)));
        model.add();
        model.form.patchValue({ email: 'm@b.co' });

        model.save();

        expect(model.inviteProblem()).toBe(ACCOUNT_ERROR_MESSAGES[kind]);
        expect(model.pasteUid()).toBe(true);
        expect(model.form.controls.uid.enabled).toBe(true);
        expect(model.form.controls.email.value).toBe('m@b.co');
        expect(store.commits).toHaveLength(0);
      },
    );

    it('should say why, keeping the email way, when there were too many tries', () => {
      const { model } = setUp({}, () =>
        throwError(() => new AccountError(AccountErrorKind.TooMany)),
      );
      model.add();
      model.form.patchValue({ email: 'x@b.co' });

      model.save();

      expect(model.inviteProblem()).toBe(ACCOUNT_ERROR_MESSAGES[AccountErrorKind.TooMany]);
      expect(model.pasteUid()).toBe(false);
    });

    it('should keep the manager and say so when the email doesn’t send', () => {
      const { model, store, show } = setUp(
        {},
        () => of('made-uid'),
        () => throwError(() => new Error('no')),
      );
      model.add();
      model.form.patchValue({ email: 'new@b.co' });

      model.save();

      expect(store.documents.get('roles/made-uid')).toBeDefined();
      expect(show).toHaveBeenCalledWith(
        TEAM_MESSAGES.inviteEmailFailed('new@b.co'),
        ToastTone.Error,
      );
    });

    it('should send no email when the role couldn’t be saved', () => {
      const { model, sendPasswordReset, store } = setUp();
      vi.spyOn(TestBed.inject(RolesService), 'save').mockReturnValue(
        throwError(() => new Error('x')),
      );
      model.add();
      model.form.patchValue({ email: 'new@b.co' });

      model.save();

      expect(sendPasswordReset).not.toHaveBeenCalled();
      expect(store.commits).toHaveLength(0);
    });
  });

  it('should set every page at once', () => {
    const { model } = setUp();
    model.add();

    model.setAll(PageAccess.Publish);

    expect(
      Object.values(model.form.controls.pages.getRawValue()).every(
        (access) => access === PageAccess.Publish,
      ),
    ).toBe(true);
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
