import { ManagerArea } from './manager-area.enum';
import { type Permissions } from './permissions.model';
import { ALL_SECTIONS } from '../schemas/editor-tabs';
import { formatMoment } from './editor-dates';
import { type IEditorSection } from './i-editor-section';
import { type IPublishRecord } from './i-publish-record';
import { PublishReport } from './publish-report.model';
import { type IReviewChange, type Review, documentTitles } from './review.model';

/** What Review & publish is for, in one line, as every admin page says (0020 V6). */
export const PUBLISH_INTRO = {
  owner:
    'Changes wait here until they’re on the website. Tick the ones to publish, answer the changes waiting for your approval, and keep a backup.',
  manager:
    'Changes wait here until they’re on the website. Tick yours, then publish them or send them to the owner for approval, with a note.',
} as const;

/** One past publish. */
export interface IHistoryEntry {
  readonly record: IPublishRecord;
  readonly when: string;
  readonly title: string;
  /** Who published it, and whose change it was when approved (0019). */
  readonly who: string;
  /** The latest publish: going back to before it replaces nothing published since (0016 V3). */
  readonly newest: boolean;
  /** Whether this account may go back to before it (0022 D4). */
  readonly canGoBack: boolean;
  /** A self-approval's title and note (0023), or `null` for any other publish. */
  readonly approval: { readonly title: string; readonly note: string } | null;
}

/**
 * Going back to before a publish also replaces every later one (0016 V3), so a manager may do it
 * only when every page those publishes changed is one they may publish (0022 D4); the owner always.
 * @param permissions The signed-in account.
 * @param history The publish history, newest first.
 * @param index The publish's place in it.
 * @returns Whether going back to before it is offered.
 */
export function canGoBackOver(
  permissions: Permissions,
  history: readonly IPublishRecord[],
  index: number,
): boolean {
  return (
    permissions.actsAsOwner ||
    (permissions.canUse(ManagerArea.GoingBack) &&
      history
        .slice(0, index + 1)
        .every((record) => record.changed.every((path) => permissions.canPublishPath(path))))
  );
}

/**
 * @param record A past publish.
 * @param viewerUid The signed-in account.
 * @returns e.g. "by you", "by m@b.co", "by you, approved from m@b.co", "self-approved by m@b.co",
 *   "approved by s@b.co for the owner, sent by m@b.co".
 */
function whoPublished(record: IPublishRecord, viewerUid: string): string {
  // Records from before 2.0.0 aren't signed: only the owner could publish then.
  const by =
    record.by === undefined || record.by === viewerUid ? 'you' : (record.byEmail ?? 'the owner');
  if (record.selfApproval !== undefined) {
    return `self-approved by ${by}`;
  }
  if (record.forOwner === true && record.approvedFrom !== undefined) {
    return `approved by ${by} for the owner, sent by ${record.approvedFrom}`;
  }
  return record.approvedFrom === undefined
    ? `by ${by}`
    : `by ${by}, approved from ${record.approvedFrom}`;
}

/** The title a self-approval shows: the manager's, or "Self-approved" when they gave none (0023 D2). */
export const SELF_APPROVED_TITLE = 'Self-approved';

/** The review & publish page: what will change, who changed it, and the history. */
export class PublishPageModel {
  public readonly changes: readonly IReviewChange[];
  public readonly history: readonly IHistoryEntry[];

  /**
   * @param review The changes and who made them.
   * @param history The publish history, newest first.
   * @param sections Every editor section, titled for the list.
   * @param libraryIds The photo library's ids, or `null` when they aren't known.
   */
  public constructor(
    public readonly review: Review,
    history: readonly IPublishRecord[],
    sections: readonly IEditorSection[],
    private readonly libraryIds: ReadonlySet<string> | null,
  ) {
    const titleOf = documentTitles(sections);
    this.changes = review.changes;
    this.history = history.map((record, index) => ({
      record,
      when: formatMoment(record.publishedAt),
      title: record.changed.map(titleOf).join('; '),
      who: whoPublished(record, review.permissions.uid),
      newest: index === 0,
      canGoBack: canGoBackOver(review.permissions, history, index),
      approval:
        record.selfApproval === undefined
          ? null
          : {
              title: record.selfApproval.title || SELF_APPROVED_TITLE,
              note: record.selfApproval.note,
            },
    }));
  }

  /**
   * @param selected The ticked documents.
   * @param now The current time.
   * @returns What the checks find in them.
   */
  public reportFor(selected: ReadonlySet<string>, now: Date): PublishReport {
    return PublishReport.check(this.review.draftsOf(selected), ALL_SECTIONS, now, this.libraryIds);
  }
}
