import { type IPublishRecord } from './i-publish-record';

/**
 * Where this device keeps the newest self-approval the owner has seen on Review & publish (0023
 * D3), so the dashboard counts only the ones since.
 */
export const SELF_APPROVALS_SEEN_KEY = 'taal-yatra.self-approvals.seen';

/**
 * @param history The publish history, newest first.
 * @param seen The id of the newest self-approval the owner has seen, or `null` for none.
 * @returns How many self-approved publishes are newer (ids sort by time).
 */
export function unseenSelfApprovals(
  history: readonly IPublishRecord[],
  seen: string | null,
): number {
  return history.filter(
    (record) => record.selfApproval !== undefined && (seen === null || record.id > seen),
  ).length;
}

/**
 * @param history The publish history, newest first.
 * @returns The newest self-approved publish's id, or `null` when there's none.
 */
export function newestSelfApproval(history: readonly IPublishRecord[]): string | null {
  return history.find((record) => record.selfApproval !== undefined)?.id ?? null;
}
