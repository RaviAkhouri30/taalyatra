import { type IDraft } from '@core/interfaces/i-draft';
import { ALL_SECTIONS, SECTIONS_WITH_TABS } from '../schemas/editor-tabs';
import { ApprovalStatus, type IApproval } from './approval.model';
import { formatMoment } from './editor-dates';
import { type Permissions } from './permissions.model';
import { PublishReport } from './publish-report.model';
import { documentTitles } from './review.model';

const titleOf = documentTitles(SECTIONS_WITH_TABS);

/** One request, as the approvals panel shows it (0019). */
export interface IApprovalView {
  readonly approval: IApproval;
  /** The pages it changes, e.g. "Hero · Hero; Offer · Offer section". */
  readonly title: string;
  readonly sentAt: string;
  /** When the owner answered, or empty. */
  readonly answeredAt: string;
  /** For the owner: how many problems stop approving it. */
  readonly problems: number;
}

/** What the panel shows: the owner's queue, or a manager's own requests. */
export interface IApprovalsPanel {
  readonly owner: boolean;
  /** A manager who approves their own changes (0023 D4): their waiting request offers it. */
  readonly canApproveOwn: boolean;
  readonly requests: readonly IApprovalView[];
}

/** What the panel reads. */
export interface IApprovalsInput {
  readonly permissions: Permissions;
  readonly requests: readonly IApproval[];
  readonly drafts: ReadonlyMap<string, IDraft>;
  readonly libraryIds: ReadonlySet<string> | null;
  readonly now: Date;
}

function problemsIn(approval: IApproval, input: IApprovalsInput): number {
  const drafts = new Map(
    approval.paths.flatMap((path) => {
      const draft = input.drafts.get(path);
      return draft ? [[path, draft] as const] : [];
    }),
  );
  return PublishReport.check(drafts, ALL_SECTIONS, input.now, input.libraryIds).errors.length;
}

/**
 * @param input What was read.
 * @returns For the owner, the requests waiting for them; for a manager, their own requests.
 */
export function approvalsPanel(input: IApprovalsInput): IApprovalsPanel {
  const { permissions } = input;
  const shown = input.requests.filter((approval) =>
    permissions.isOwner
      ? approval.status === ApprovalStatus.Waiting
      : approval.by === permissions.uid,
  );
  return {
    owner: permissions.isOwner,
    canApproveOwn: permissions.canApproveOwn,
    requests: shown.map((approval) => ({
      approval,
      title: approval.paths.map(titleOf).join('; '),
      sentAt: formatMoment(approval.sentAt),
      answeredAt: approval.answeredAt ? formatMoment(approval.answeredAt) : '',
      problems: permissions.isOwner ? problemsIn(approval, input) : 0,
    })),
  };
}
