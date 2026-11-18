import { type DocumentFields } from '@core/interfaces/i-document-store';
import { EditorTab } from './editor-tab.enum';

/** Where Team access keeps each manager's permissions, by account id (0019). */
export const ROLES_COLLECTION = 'roles';

/** What a manager may do on one editor page. The values are what `firestore.rules` checks. */
export enum PageAccess {
  /** The page isn't in their menu, and the rules refuse its drafts. */
  Hidden = 'hidden',
  /** They edit the draft and send it for approval (the default, decision 3). */
  Approval = 'approval',
  /** They publish it themselves. */
  Publish = 'publish',
}

/** Every setting, in the order Team access offers them. */
export const PAGE_ACCESS_CHOICES: readonly PageAccess[] = [
  PageAccess.Hidden,
  PageAccess.Approval,
  PageAccess.Publish,
];

const PAGE_ACCESS_BY_VALUE: ReadonlyMap<unknown, PageAccess> = new Map(
  PAGE_ACCESS_CHOICES.map((access) => [access, access]),
);

const TABS_BY_VALUE: ReadonlyMap<unknown, EditorTab> = new Map(
  Object.values(EditorTab).map((tab) => [tab, tab]),
);

/** One manager's permissions, as stored in `roles/{uid}`. */
export interface IRole {
  /** Shown on Team access, so the owner knows who it is. */
  readonly email: string;
  /** Pages with a setting; any other page needs approval. */
  readonly pages: ReadonlyMap<EditorTab, PageAccess>;
  readonly uploads: boolean;
  /** When the owner added them (ISO 8601). */
  readonly addedAt: string;
}

/**
 * @param role A manager's permissions.
 * @param tab An editor page.
 * @returns Their setting for it; a page without one needs approval.
 */
export function pageAccess(role: IRole, tab: EditorTab): PageAccess {
  return role.pages.get(tab) ?? PageAccess.Approval;
}

function toPages(value: unknown): ReadonlyMap<EditorTab, PageAccess> {
  const entries = typeof value === 'object' && value !== null ? Object.entries(value) : [];
  return new Map(
    entries.flatMap(([key, setting]) => {
      const tab = TABS_BY_VALUE.get(key);
      const access = PAGE_ACCESS_BY_VALUE.get(setting);
      return tab && access ? [[tab, access] as const] : [];
    }),
  );
}

/**
 * @param fields A stored role.
 * @returns The role, or `null` when the stored data isn't one. Unknown pages and settings are
 *   dropped, so they need approval.
 */
export function toRole(fields: DocumentFields | null): IRole | null {
  if (fields === null) {
    return null;
  }
  const entries = new Map(Object.entries(fields));
  const email = entries.get('email');
  const addedAt = entries.get('addedAt');
  return typeof email === 'string' && typeof addedAt === 'string'
    ? {
        email,
        pages: toPages(entries.get('pages')),
        // Only an explicit yes allows uploads: the rules check for `true`.
        uploads: entries.get('uploads') === true,
        addedAt,
      }
    : null;
}

/**
 * @param role A manager's permissions.
 * @returns The document to store, in the shape `firestore.rules` accepts.
 */
export function roleFields(role: IRole): DocumentFields {
  return {
    email: role.email,
    pages: Object.fromEntries(role.pages),
    uploads: role.uploads,
    addedAt: role.addedAt,
  };
}
