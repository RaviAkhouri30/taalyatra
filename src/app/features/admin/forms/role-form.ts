import { FormControl, FormGroup, FormRecord } from '@angular/forms';
import { type EditorTab } from '../models/editor-tab.enum';
import { type IRole, PageAccess, pageAccess } from '../models/role.model';
import { type IManager, PAGE_ROWS } from '../models/team-access.model';
import { emailAddressValidator, requiredTrimmedValidator } from './auth.validators';
import { accountIdValidator, notListedValidator, notOwnerValidator } from './role.validators';

/** Typed controls of Team access's manager form (0019). */
export interface IRoleControls {
  readonly uid: FormControl<string>;
  readonly email: FormControl<string>;
  /** One setting per editor page, by tab. */
  readonly pages: FormRecord<FormControl<PageAccess>>;
  readonly uploads: FormControl<boolean>;
}

/** What the form holds once it's valid. */
export interface IRoleFormValue {
  readonly uid: string;
  readonly email: string;
  readonly pages: ReadonlyMap<EditorTab, PageAccess>;
  readonly uploads: boolean;
}

function pageControls(): Record<string, FormControl<PageAccess>> {
  // Needs approval everywhere for a new manager (D4).
  return Object.fromEntries(
    PAGE_ROWS.map((row) => [row.tab, new FormControl(PageAccess.Approval, { nonNullable: true })]),
  );
}

/**
 * @param ownerUid The owner's account id, which can't be added.
 * @param listed The ids already on Team access.
 * @returns A new form for adding a manager, with the defaults (D4).
 */
export function createRoleForm(
  ownerUid: string,
  listed: () => ReadonlySet<string>,
): FormGroup<IRoleControls> {
  return new FormGroup<IRoleControls>({
    uid: new FormControl('', {
      nonNullable: true,
      validators: [
        requiredTrimmedValidator,
        accountIdValidator,
        notOwnerValidator(ownerUid),
        notListedValidator(listed),
      ],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [requiredTrimmedValidator, emailAddressValidator],
    }),
    pages: new FormRecord(pageControls()),
    // On by default (D4); deleting photos stays with the owner whatever this says.
    uploads: new FormControl(true, { nonNullable: true }),
  });
}

/**
 * Empties the form for a new manager. Their id can be typed.
 * @param form The manager form.
 */
export function resetRoleForm(form: FormGroup<IRoleControls>): void {
  form.reset();
  form.controls.uid.enable();
}

/**
 * Fills the form with a manager's settings. Their id is fixed: a different account is a new
 * manager.
 * @param form The manager form.
 * @param manager The manager to change.
 */
export function fillRoleForm(form: FormGroup<IRoleControls>, manager: IManager): void {
  form.reset({
    uid: manager.uid,
    email: manager.role.email,
    pages: Object.fromEntries(PAGE_ROWS.map((row) => [row.tab, pageAccess(manager.role, row.tab)])),
    uploads: manager.role.uploads,
  });
  form.controls.uid.disable();
}

/**
 * @param form The manager form.
 * @returns What it holds, trimmed, with every page's setting.
 */
export function roleFormValue(form: FormGroup<IRoleControls>): IRoleFormValue {
  const { uid, email, pages, uploads } = form.getRawValue();
  const settings = new Map(Object.entries(pages));
  return {
    uid: uid.trim(),
    email: email.trim(),
    pages: new Map(
      PAGE_ROWS.map((row) => [row.tab, settings.get(row.tab) ?? PageAccess.Approval] as const),
    ),
    uploads,
  };
}

/**
 * @param value What the form holds.
 * @param addedAt When the manager was first added (ISO 8601).
 * @returns The role to store.
 */
export function roleOf(value: IRoleFormValue, addedAt: string): IRole {
  return { email: value.email, pages: value.pages, uploads: value.uploads, addedAt };
}
