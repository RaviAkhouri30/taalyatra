import { ApprovalStatus, type IApproval } from './approval.model';
import { formatMoment } from './editor-dates';
import { type Permissions } from './permissions.model';

/** What an editor page says about a change on it that waits for approval (0019 decision 5). */
export interface IWaitingNotice {
  /** The account can't change the page until it's answered: a manager, as the rules enforce. */
  readonly locked: boolean;
  readonly text: string;
  /** The manager's note with it, or empty. */
  readonly note: string;
}

function newestWaiting(
  requests: readonly IApproval[],
  paths: readonly string[],
): IApproval | undefined {
  return requests
    .filter(
      (approval) =>
        approval.status === ApprovalStatus.Waiting &&
        approval.paths.some((path) => paths.includes(path)),
    )
    .sort((first, second) => second.sentAt.localeCompare(first.sentAt))
    .at(0);
}

/**
 * @param requests Every approval request.
 * @param paths The documents an editor page edits.
 * @param permissions The signed-in account.
 * @returns What to say about the newest waiting request covering the page, or `null` for none.
 */
export function waitingNotice(
  requests: readonly IApproval[],
  paths: readonly string[],
  permissions: Permissions,
): IWaitingNotice | null {
  const request = newestWaiting(requests, paths);
  if (request === undefined) {
    return null;
  }
  const sentAt = formatMoment(request.sentAt);
  if (permissions.isOwner) {
    return {
      locked: false,
      text: `${request.email} sent changes on this page for your approval, ${sentAt}. Anything you change here becomes part of what you approve.`,
      note: request.note,
    };
  }
  return {
    locked: true,
    text:
      request.by === permissions.uid
        ? `You sent changes on this page for approval, ${sentAt}. You can change it again once the owner answers, or withdraw them on Review & publish.`
        : 'Another change on this page is waiting for the owner’s approval. You can change it again once they answer.',
    note: request.by === permissions.uid ? request.note : '',
  };
}
