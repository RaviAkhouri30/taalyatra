import { type IAuthUser } from '@core/interfaces/i-auth-service';
import { type DocumentFields } from '@core/interfaces/i-document-store';
import { type EditorTab } from './editor-tab.enum';
import { type ManagerArea } from './manager-area.enum';
import { TABS_BY_PATH, changedPages } from './page-paths';
import { type IRole, PageAccess, pageAccess } from './role.model';
import { isSuperActive } from './super-manager';

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
/** A manager's role, and whether it made them a running super manager when it was judged. */
interface IGrant {
  readonly role: IRole;
  readonly isSuper: boolean;
}

export class Permissions {
  private constructor(
    public readonly kind: AccountKind,
    /** The account's id, or empty when signed out. */
    public readonly uid: string,
    /** The account's email, or empty. */
    public readonly email: string,
    private readonly grant: IGrant | null,
  ) {}

  /** A super manager whose time hadn't ended when these were worked out (0024). */
  public get isSuper(): boolean {
    return this.grant?.isSuper === true;
  }

  public get isOwner(): boolean {
    return this.kind === AccountKind.Owner;
  }

  public get isManager(): boolean {
    return this.kind === AccountKind.Manager;
  }

  /**
   * The owner, or a super manager standing in for them (0024): every page, every area and the
   * approval queue. Team access, the owner's account and trimming the history stay `isOwner` (D1).
   */
  public get actsAsOwner(): boolean {
    return this.isOwner || this.isSuper;
  }

  /** When a running super manager's time ends, or `null`: for good, or not one (0024). */
  public get superEndsAt(): Date | null {
    const untilMs = this.isSuper ? (this.role?.superManager?.untilMs ?? null) : null;
    return untilMs === null ? null : new Date(untilMs);
  }

  /** May open the editor at all. */
  public get canEdit(): boolean {
    return this.kind !== AccountKind.None;
  }

  /** May add photos to the library. Deleting them is the owner's only. */
  public get canUpload(): boolean {
    return this.actsAsOwner || this.role?.uploads === true;
  }

  /**
   * A manager who approves their own changes on pages that need approval (0023): they go live with
   * a self-approval in the history instead of waiting. The owner, and a super manager, need no
   * approval at all.
   */
  public get canApproveOwn(): boolean {
    return this.isManager && !this.isSuper && this.role?.canApprove === true;
  }

  private get role(): IRole | null {
    return this.grant?.role ?? null;
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
   * @param now The time to judge a super manager's end at (`CLOCK`), as the rules judge it by the
   *   request's.
   * @returns Their permissions.
   */
  public static manager(user: IAuthUser, role: IRole, now: Date): Permissions {
    const isSuper = isSuperActive(role.superManager, now);
    return new Permissions(AccountKind.Manager, user.uid, user.email, { role, isSuper });
  }

  /**
   * @param area One of the owner's areas (0022).
   * @returns Whether the account may use it: the owner and a super manager always, a manager when
   *   given it.
   */
  public canUse(area: ManagerArea): boolean {
    return this.actsAsOwner || this.role?.areas?.has(area) === true;
  }

  /**
   * @param path A stored document or collection.
   * @returns Whether the account publishes it without approval: every page that edits it is one
   *   they may publish. A path no page edits is the owner's.
   */
  public canPublishPath(path: string): boolean {
    const tabs = TABS_BY_PATH.get(path) ?? [];
    return this.actsAsOwner || (tabs.length > 0 && tabs.every((tab) => this.canPublish(tab)));
  }

  /** @param tab An editor page. @returns The account's setting for it. */
  public access(tab: EditorTab): PageAccess {
    if (this.actsAsOwner) {
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
    return this.actsAsOwner || (TABS_BY_PATH.get(path) ?? []).some((tab) => this.canSee(tab));
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
    if (this.actsAsOwner) {
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
