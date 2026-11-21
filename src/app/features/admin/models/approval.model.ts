import { type DocumentFields } from '@core/interfaces/i-document-store';

/** Where changes sent for approval are kept (0019). */
export const APPROVALS_COLLECTION = 'approvals';

/** One per draft waiting for approval; `firestore.rules` stop the manager changing it. */
export const LOCKS_COLLECTION = 'locks';

/** The longest note or reason, as `firestore.rules` allow. */
export const APPROVAL_NOTE_MAX = 500;

/** Where a request stands. The values are what `firestore.rules` accept. */
export enum ApprovalStatus {
  Waiting = 'waiting',
  Approved = 'approved',
  SentBack = 'sent-back',
}

const STATUS_BY_VALUE: ReadonlyMap<unknown, ApprovalStatus> = new Map(
  Object.values(ApprovalStatus).map((status) => [status, status]),
);

/** A change a manager sent for the owner's approval. */
export interface IApproval {
  readonly id: string;
  /** The manager's account id. */
  readonly by: string;
  readonly email: string;
  /** The documents whose drafts it covers. */
  readonly paths: readonly string[];
  /** What the manager wrote with it, or empty. */
  readonly note: string;
  /** ISO 8601. */
  readonly sentAt: string;
  readonly status: ApprovalStatus;
  /** The owner's reason when sending it back, or empty. */
  readonly answer: string;
  /** When the owner answered (ISO 8601), or empty. */
  readonly answeredAt: string;
  /**
   * The email of whoever answered: the owner, or a super manager for them (0024 D6). Missing on
   * answers from before 2.5.0, which were the owner's.
   */
  readonly answeredBy?: string;
}

function text(entries: ReadonlyMap<string, unknown>, key: string): string {
  const value = entries.get(key);
  return typeof value === 'string' ? value : '';
}

/**
 * @param id The stored id.
 * @param fields The stored request.
 * @returns The request, or `null` when the stored data isn't one.
 */
export function toApproval(id: string, fields: DocumentFields): IApproval | null {
  const entries = new Map(Object.entries(fields));
  const paths = entries.get('paths');
  const status = STATUS_BY_VALUE.get(entries.get('status'));
  const by = text(entries, 'by');
  if (!Array.isArray(paths) || status === undefined || by === '') {
    return null;
  }
  return {
    id,
    by,
    email: text(entries, 'email'),
    paths: paths.filter((path): path is string => typeof path === 'string'),
    note: text(entries, 'note'),
    sentAt: text(entries, 'sentAt'),
    status,
    answer: text(entries, 'answer'),
    answeredAt: text(entries, 'answeredAt'),
    ...(text(entries, 'answeredBy') ? { answeredBy: text(entries, 'answeredBy') } : {}),
  };
}

/**
 * @param approval A request.
 * @returns What a manager stores when sending it: the fields `firestore.rules` accept then.
 */
export function sentFields(approval: IApproval): DocumentFields {
  return {
    by: approval.by,
    email: approval.email,
    paths: approval.paths,
    note: approval.note,
    sentAt: approval.sentAt,
    status: approval.status,
  };
}

/**
 * @param approval A request.
 * @returns The document with the owner's answer; only the answer differs from what was sent.
 */
export function answeredFields(approval: IApproval): DocumentFields {
  return {
    ...sentFields(approval),
    answer: approval.answer,
    answeredAt: approval.answeredAt,
    // Signed: the rules require the answerer's own email (0024 D6).
    ...(approval.answeredBy === undefined ? {} : { answeredBy: approval.answeredBy }),
  };
}

/**
 * @param approvals Requests.
 * @returns The documents waiting for approval, which a manager can't change until it's answered.
 */
export function waitingPaths(approvals: readonly IApproval[]): ReadonlySet<string> {
  return new Set(
    approvals
      .filter((approval) => approval.status === ApprovalStatus.Waiting)
      .flatMap((approval) => approval.paths),
  );
}
