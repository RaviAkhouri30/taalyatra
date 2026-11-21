import { FormControl, FormGroup, FormRecord } from '@angular/forms';
import { type EditorTab } from '../models/editor-tab.enum';
import { type ManagerArea } from '../models/manager-area.enum';
import { type IRole, PageAccess, pageAccess } from '../models/role.model';
import { superUntil, untilDay } from '../models/super-manager';
import { AREA_ROWS, type IManager, PAGE_ROWS } from '../models/team-access.model';
import { emailAddressValidator, requiredTrimmedValidator } from './auth.validators';
import {
  accountIdValidator,
  notListedValidator,
  notOwnerValidator,
  superUntilValidator,
} from './role.validators';

/** Typed controls of Team access's manager form (0019). */
export interface IRoleControls {
  readonly uid: FormControl<string>;
  readonly email: FormControl<string>;
  /** One setting per editor page, by tab. */
  readonly pages: FormRecord<FormControl<PageAccess>>;
  readonly uploads: FormControl<boolean>;
  /** Approves their own changes on pages that need approval (0023). */
  readonly canApprove: FormControl<boolean>;
  /** One switch per owner's area, by area (0022). */
  readonly areas: FormRecord<FormControl<boolean>>;
  /** Stands in for the owner (0024). */
  readonly superManager: FormControl<boolean>;
  /** Until a date (`true`), or for good. */
  readonly superEnds: FormControl<boolean>;
  /** The last day it lasts, `YYYY-MM-DD`, when it ends. */
  readonly superUntil: FormControl<string>;
}

/** What the form holds once it's valid. */
export interface IRoleFormValue {
  readonly uid: string;
  readonly email: string;
  readonly pages: ReadonlyMap<EditorTab, PageAccess>;
  readonly uploads: boolean;
  readonly canApprove: boolean;
  readonly areas: ReadonlySet<ManagerArea>;
  /** A super manager's last day (`YYYY-MM-DD`), `null` for good; `undefined` when not one. */
  readonly superUntilDay: string | null | undefined;
}

function areaControls(): Record<string, FormControl<boolean>> {
  // All off: the owner's areas stay the owner's until they turn one on (0022 D6).
  return Object.fromEntries(
    AREA_ROWS.map((row) => [row.area, new FormControl(false, { nonNullable: true })]),
  );
}

/** Off by default (0024): nothing a manager does changes until the owner turns it on. */
function superManagerControls(): Pick<IRoleControls, 'superManager' | 'superEnds' | 'superUntil'> {
  return {
    superManager: new FormControl(false, { nonNullable: true }),
    superEnds: new FormControl(true, { nonNullable: true }),
    superUntil: new FormControl('', { nonNullable: true }),
  };
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
 * @param today Today in India, `YYYY-MM-DD`: a super manager's last day can't be earlier.
 * @returns A new form for adding a manager, with the defaults (D4).
 */
export function createRoleForm(
  ownerUid: string,
  listed: () => ReadonlySet<string>,
  today: () => string,
): FormGroup<IRoleControls> {
  return new FormGroup<IRoleControls>(
    {
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
      // Off by default (0023 D1): their changes wait for the owner until the owner says otherwise.
      canApprove: new FormControl(false, { nonNullable: true }),
      areas: new FormRecord(areaControls()),
      ...superManagerControls(),
    },
    // On the group: the date matters only with the switch on and an end chosen.
    { validators: superUntilValidator(today) },
  );
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
    canApprove: manager.role.canApprove === true,
    areas: Object.fromEntries(
      AREA_ROWS.map((row) => [row.area, manager.role.areas?.has(row.area) === true]),
    ),
    ...superControls(manager.role),
  });
  form.controls.uid.disable();
}

/**
 * @param form The manager form.
 * @returns What it holds, trimmed, with every page's setting.
 */
export function roleFormValue(form: FormGroup<IRoleControls>): IRoleFormValue {
  const { uid, email, pages, uploads, canApprove, areas, ...superValue } = form.getRawValue();
  const settings = new Map(Object.entries(pages));
  const switches = new Map(Object.entries(areas));
  return {
    uid: uid.trim(),
    email: email.trim(),
    pages: new Map(
      PAGE_ROWS.map((row) => [row.tab, settings.get(row.tab) ?? PageAccess.Approval] as const),
    ),
    uploads,
    canApprove,
    areas: new Set(
      AREA_ROWS.filter((row) => switches.get(row.area) === true).map((row) => row.area),
    ),
    superUntilDay: superDayOf(superValue),
  };
}

/** The form's super manager fields for a stored role: off, for good, or until its last day. */
function superControls(
  role: IRole,
): Pick<
  ReturnType<FormGroup<IRoleControls>['getRawValue']>,
  'superManager' | 'superEnds' | 'superUntil'
> {
  const untilMs = role.superManager?.untilMs ?? null;
  return {
    superManager: role.superManager !== undefined,
    superEnds: role.superManager === undefined || untilMs !== null,
    superUntil: untilMs === null ? '' : untilDay(untilMs),
  };
}

function superDayOf(value: {
  readonly superManager: boolean;
  readonly superEnds: boolean;
  readonly superUntil: string;
}): string | null | undefined {
  if (!value.superManager) {
    return undefined;
  }
  return value.superEnds ? value.superUntil : null;
}

/**
 * @param value What the form holds.
 * @param addedAt When the manager was first added (ISO 8601).
 * @param superSince When they became a super manager: kept from before, or now (ISO 8601).
 * @returns The role to store.
 */
export function roleOf(value: IRoleFormValue, addedAt: string, superSince: string): IRole {
  const day = value.superUntilDay;
  return {
    email: value.email,
    pages: value.pages,
    uploads: value.uploads,
    canApprove: value.canApprove,
    areas: value.areas,
    addedAt,
    ...(day === undefined
      ? {}
      : { superManager: { since: superSince, untilMs: day === null ? null : superUntil(day) } }),
  };
}
