import { type IAuthUser } from '@core/interfaces/i-auth-service';
import { type DocumentFields } from '@core/interfaces/i-document-store';
import { type EditorTab } from './editor-tab.enum';
import { TABS_BY_PATH, changedPages } from './page-paths';
import { type IRole, PageAccess, pageAccess } from './role.model';

/** Who the signed-in account is to the admin area (0019). */
export enum AccountKind {
  /** Fixed in `firestore.rules` and the environment (decision 1). */
  Owner = 'owner',
  /** Added on Team access. */
  Manager = 'manager',
  /** Signed out, or never added. */
  None = 'none',
}

/** What a change goes through when it's published. */
export enum DraftAction {
  /** Straight to the site. */
  Publish = 'publish',
  /** To the owner, for approval. */
  Approval = 'approval',
}

/**
 * What the signed-in account may do in the admin area. Every screen asks this instead of checking
 * ids. It mirrors `firestore.rules`, which enforce the same; the screens only follow them.
 */
export class Permissions {
  private constructor(
    public readonly kind: AccountKind,
    /** The account's id, or empty when signed out. */
    public readonly uid: string,
    /** The account's email, or empty. */
    public readonly email: string,
    private readonly role: IRole | null,
  ) {}

  public get isOwner(): boolean {
    return this.kind === AccountKind.Owner;
  }

  public get isManager(): boolean {
    return this.kind === AccountKind.Manager;
  }

  /** May open the editor at all. */
  public get canEdit(): boolean {
    return this.kind !== AccountKind.None;
  }

  /** May add photos to the library. Deleting them is the owner's only. */
  public get canUpload(): boolean {
    return this.isOwner || this.role?.uploads === true;
  }

  /**
   * @param user The signed-in account, or `null`.
   * @returns Permissions for no access.
   */
  public static none(user: IAuthUser | null = null): Permissions {
    return new Permissions(AccountKind.None, user?.uid ?? '', user?.email ?? '', null);
  }

  /** @param user The owner's account. @returns The owner's permissions: everything. */
  public static owner(user: IAuthUser): Permissions {
    return new Permissions(AccountKind.Owner, user.uid, user.email, null);
  }

  /**
   * @param user A manager's account.
   * @param role What the owner allowed them.
   * @returns Their permissions.
   */
  public static manager(user: IAuthUser, role: IRole): Permissions {
    return new Permissions(AccountKind.Manager, user.uid, user.email, role);
  }

  /** @param tab An editor page. @returns The account's setting for it. */
  public access(tab: EditorTab): PageAccess {
    if (this.isOwner) {
      return PageAccess.Publish;
    }
    return this.role ? pageAccess(this.role, tab) : PageAccess.Hidden;
  }

  /** @param tab An editor page. @returns Whether it's in the account's menu. */
  public canSee(tab: EditorTab): boolean {
    return this.access(tab) !== PageAccess.Hidden;
  }

  /** @param tab An editor page. @returns Whether the account publishes it without approval. */
  public canPublish(tab: EditorTab): boolean {
    return this.access(tab) === PageAccess.Publish;
  }

  /** @param path A stored document. @returns Whether a page the account sees edits it. */
  public canSeePath(path: string): boolean {
    return this.isOwner || (TABS_BY_PATH.get(path) ?? []).some((tab) => this.canSee(tab));
  }

  /**
   * @param path The document a draft changes.
   * @param content The draft's content.
   * @param live What's published there now (for a shared document, which parts changed).
   * @returns Whether the account may publish the change or must send it for approval.
   */
  public draftAction(
    path: string,
    content: DocumentFields,
    live: DocumentFields | null,
  ): DraftAction {
    if (this.isOwner) {
      return DraftAction.Publish;
    }
    const { tabs, ownerOnly } = changedPages(path, content, live);
    // Nothing changed: publishing it needs the right to publish one of the document's pages.
    const pages = tabs.length > 0 ? tabs : (TABS_BY_PATH.get(path) ?? []);
    const allowed =
      tabs.length > 0
        ? pages.every((tab) => this.canPublish(tab))
        : pages.some((tab) => this.canPublish(tab));
    return !ownerOnly && allowed ? DraftAction.Publish : DraftAction.Approval;
  }
}
