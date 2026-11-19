import { type DocumentFields } from '@core/interfaces/i-document-store';
import { type IDraft } from '@core/interfaces/i-draft';
import { type IApproval, waitingPaths } from './approval.model';
import { formatMoment } from './editor-dates';
import { type IEditorSection } from './i-editor-section';
import { DraftAction, type Permissions } from './permissions.model';

/** Who a change is by, as the signed-in account reads it. */
export const YOU = 'you';
export const THE_OWNER = 'the owner';
export const A_MANAGER = 'a manager';

/** One document with unpublished changes, as Review & publish lists it (0019). */
export interface IReviewChange {
  readonly path: string;
  /** The editor cards that edit it, e.g. "Business details, Contact details". */
  readonly title: string;
  /** When it was last saved, as the owner reads it. */
  readonly savedAt: string;
  /** Who last saved it: "you", "the owner", or the manager's email. */
  readonly author: string;
  /** Saved by the signed-in account, so ticked to start with (decision 4). */
  readonly mine: boolean;
  /** Published straight away, or sent for approval. */
  readonly action: DraftAction;
}

/** What one click on Review & publish does with the ticked changes. */
export interface IPublishPlan {
  /** Documents that go live now. */
  readonly publish: readonly string[];
  /** Documents sent to the owner for approval. */
  readonly send: readonly string[];
}

/** What Review & publish and the publish bar know when they open. */
export interface IReviewInput {
  readonly permissions: Permissions;
  /** Every draft, by path. */
  readonly drafts: ReadonlyMap<string, IDraft>;
  /** Every approval request (empty when they couldn't be read). */
  readonly requests: readonly IApproval[];
  /** What's live, by path, for a manager's drafts (for shared documents' parts). */
  readonly live: ReadonlyMap<string, DocumentFields | null>;
  /** Managers' emails by account id, as far as the account may read them. */
  readonly emails: ReadonlyMap<string, string>;
  /** The owner's account id. */
  readonly ownerUid: string;
}

/**
 * @param sections Every editor section.
 * @returns A function naming a document by the cards that edit it, or by its path.
 */
export function documentTitles(sections: readonly IEditorSection[]): (path: string) => string {
  const titles = new Map<string, string[]>();
  for (const section of sections) {
    titles.set(section.path, [...(titles.get(section.path) ?? []), section.title]);
  }
  return (path) => titles.get(path)?.join(', ') ?? path;
}

/**
 * The unpublished changes the signed-in account may see, who made each one, and what publishing
 * it does (0019). Drafts waiting for approval aren't among them: they're published only by
 * approving them.
 */
export class Review {
  public readonly changes: readonly IReviewChange[];
  /** Documents locked in a waiting request. */
  public readonly waiting: ReadonlySet<string>;

  /**
   * @param input What was read.
   * @param titleOf Names a document.
   */
  public constructor(
    private readonly input: IReviewInput,
    titleOf: (path: string) => string,
  ) {
    this.waiting = waitingPaths(input.requests);
    const { permissions } = input;
    this.changes = [...input.drafts.values()]
      .filter((draft) => permissions.canSeePath(draft.path) && !this.waiting.has(draft.path))
      .map((draft) => {
        const author = this.authorOf(draft);
        return {
          path: draft.path,
          title: titleOf(draft.path),
          savedAt: formatMoment(draft.savedAt),
          author,
          mine: author === YOU,
          action: permissions.draftAction(
            draft.path,
            draft.content,
            input.live.get(draft.path) ?? null,
          ),
        };
      });
  }

  public get permissions(): Permissions {
    return this.input.permissions;
  }

  /** The requests the account answers or follows, newest first. */
  public get requests(): readonly IApproval[] {
    return this.input.requests;
  }

  /** @returns The account's own changes: what it starts with ticked. */
  public mine(): ReadonlySet<string> {
    return new Set(this.changes.filter((change) => change.mine).map((change) => change.path));
  }

  /**
   * @param paths Documents.
   * @returns Their drafts, by path.
   */
  public draftsOf(paths: Iterable<string>): ReadonlyMap<string, IDraft> {
    return new Map(
      [...paths].flatMap((path) => {
        const draft = this.input.drafts.get(path);
        return draft ? [[path, draft] as const] : [];
      }),
    );
  }

  /**
   * @param selected The ticked documents.
   * @returns What publishing them does; anything not listed as a change is left out.
   */
  public planFor(selected: ReadonlySet<string>): IPublishPlan {
    const chosen = this.changes.filter((change) => selected.has(change.path));
    return {
      publish: chosen
        .filter((change) => change.action === DraftAction.Publish)
        .map((change) => change.path),
      send: chosen
        .filter((change) => change.action === DraftAction.Approval)
        .map((change) => change.path),
    };
  }

  private authorOf(draft: IDraft): string {
    // Drafts from before 2.0.0 aren't signed: only the owner could save them.
    const by = draft.savedBy ?? this.input.ownerUid;
    if (by === this.input.permissions.uid) {
      return YOU;
    }
    if (by === this.input.ownerUid) {
      return THE_OWNER;
    }
    return this.input.emails.get(by) ?? A_MANAGER;
  }
}

/**
 * @param count How many documents.
 * @returns e.g. "1 change", "3 changes".
 */
export function changesWord(count: number): string {
  return `${String(count)} ${count === 1 ? 'change' : 'changes'}`;
}

/**
 * @param plan What a click does.
 * @returns The button's label.
 */
export function planButtonText(plan: IPublishPlan): string {
  if (plan.send.length === 0) {
    return 'Publish changes';
  }
  return plan.publish.length === 0
    ? 'Send for approval'
    : `Publish ${changesWord(plan.publish.length)}, send ${changesWord(plan.send.length)} for approval`;
}

/**
 * @param plan What a click does.
 * @returns How the confirmation sums it up, saying which is which.
 */
export function planConfirmText(plan: IPublishPlan): string {
  const parts = [
    ...(plan.publish.length > 0
      ? [
          `Publish ${String(plan.publish.length)} changed ${plan.publish.length === 1 ? 'document' : 'documents'}? Visitors see the changes on their next visit.`,
        ]
      : []),
    ...(plan.send.length > 0
      ? [
          `Send ${changesWord(plan.send.length)} to the owner for approval? You can’t change them until they answer, unless you withdraw them.`,
        ]
      : []),
  ];
  return parts.join(' ');
}
