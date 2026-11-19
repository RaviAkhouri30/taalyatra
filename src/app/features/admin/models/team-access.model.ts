import { EDITOR_TABS } from '../schemas/editor-tabs';
import { type EditorTab } from './editor-tab.enum';
import { type IRole, PAGE_ACCESS_CHOICES, PageAccess, pageAccess } from './role.model';

/** A manager on Team access (0019): their account id and what the owner allowed them. */
export interface IManager {
  readonly uid: string;
  readonly role: IRole;
}

/** Whether Team access's manager form is shown, and for what. */
export enum RoleFormMode {
  Closed = 'closed',
  Adding = 'adding',
  Editing = 'editing',
}

/** One editor page on the Team access form, in the side panel's order. */
export interface IPageRow {
  readonly tab: EditorTab;
  readonly label: string;
}

/** The pages a manager has one setting on, for their card. */
export interface IAccessGroup {
  readonly access: PageAccess;
  readonly label: string;
  /** The pages' names, in the side panel's order, e.g. "Hero, Videos". */
  readonly pages: string;
}

/** Every editor page, as the form lists them. */
export const PAGE_ROWS: readonly IPageRow[] = EDITOR_TABS.map(({ tab, label }) => ({ tab, label }));

/** How each setting reads on the form and the cards (the design's table). */
export const PAGE_ACCESS_LABELS: ReadonlyMap<PageAccess, string> = new Map([
  [PageAccess.Hidden, 'Hidden'],
  [PageAccess.Approval, 'Needs approval'],
  [PageAccess.Publish, 'Can publish'],
]);

/**
 * @param access A setting.
 * @returns How it reads.
 */
export function accessLabel(access: PageAccess): string {
  return PAGE_ACCESS_LABELS.get(access) ?? access;
}

/**
 * @param role A manager's permissions.
 * @returns Their pages grouped by setting, most allowed first; empty groups are left out.
 */
export function accessGroups(role: IRole): IAccessGroup[] {
  return [...PAGE_ACCESS_CHOICES].reverse().flatMap((access) => {
    const pages = PAGE_ROWS.filter((row) => pageAccess(role, row.tab) === access).map(
      (row) => row.label,
    );
    return pages.length > 0
      ? [{ access, label: accessLabel(access), pages: pages.join(', ') }]
      : [];
  });
}

/**
 * @param managers Managers in any order.
 * @returns Them by email, so the list reads the same on every visit.
 */
export function byEmail(managers: readonly IManager[]): IManager[] {
  return [...managers].sort((first, second) => first.role.email.localeCompare(second.role.email));
}
