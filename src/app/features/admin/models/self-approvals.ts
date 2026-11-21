import { type IPublishRecord } from './i-publish-record';

/**
 * Where this device keeps the newest managers' approval the owner has seen on Review & publish
 * (0023 D3, 0024 D6), so the dashboard counts only the ones since. The key keeps its 2.4.0 name,
 * so what the owner has already seen stays seen.
 */
export const SELF_APPROVALS_SEEN_KEY = 'taal-yatra.self-approvals.seen';

/** Publishes the owner didn't approve themselves, since they last looked. */
export interface IUnseenApprovals {
  /** Managers' approvals of their own changes (0023). */
  readonly self: number;
  /** Other managers' changes a super manager approved for the owner (0024). */
  readonly forOwner: number;
}

/** @returns Whether a manager, not the owner, approved this publish. */
function isManagersApproval(record: IPublishRecord): boolean {
  return record.selfApproval !== undefined || record.forOwner === true;
}

/**
 * @param history The publish history, newest first.
 * @param seen The id of the newest managers' approval the owner has seen, or `null` for none.
 * @returns How many of each kind are newer (ids sort by time).
 */
export function unseenApprovals(
  history: readonly IPublishRecord[],
  seen: string | null,
): IUnseenApprovals {
  const unseen = history.filter(
    (record) => isManagersApproval(record) && (seen === null || record.id > seen),
  );
  return {
    self: unseen.filter((record) => record.selfApproval !== undefined).length,
    forOwner: unseen.filter((record) => record.forOwner === true).length,
  };
}

/**
 * @param history The publish history, newest first.
 * @returns The newest publish a manager approved, or `null` when there's none.
 */
export function newestManagersApproval(history: readonly IPublishRecord[]): string | null {
  return history.find(isManagersApproval)?.id ?? null;
}

function changes(count: number): string {
  return `${String(count)} ${count === 1 ? 'change' : 'changes'}`;
}

/**
 * @param unseen What the owner hasn't seen.
 * @returns The dashboard's line, e.g. "2 changes self-approved and 1 approved for you since you
 *   last looked.", or empty when there's nothing new.
 */
export function unseenApprovalsText(unseen: IUnseenApprovals): string {
  const since = 'since you last looked.';
  if (unseen.self > 0 && unseen.forOwner > 0) {
    return `${changes(unseen.self)} self-approved and ${String(unseen.forOwner)} approved for you ${since}`;
  }
  if (unseen.self > 0) {
    return `${changes(unseen.self)} self-approved by managers ${since}`;
  }
  return unseen.forOwner > 0
    ? `${changes(unseen.forOwner)} approved for you by a super manager ${since}`
    : '';
}
