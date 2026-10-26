import { type Observable } from 'rxjs';

/** An email to the business (e.g. a proposal request). */
export interface IEmailMessage {
  readonly subject: string;
  readonly body: string;
  readonly fromName: string;
  readonly phone: string;
  /** Visitor's email for replies; empty when not given. */
  readonly replyTo: string;
}

/**
 * Port for sending email (CLAUDE.md §3). Also the DI token; an adapter (EmailJS, or a fake in
 * development and tests) is chosen by `emailServiceFactory`.
 */
export abstract class IEmailService {
  /** Sends `message`; emits once and completes on success, errors on failure. */
  public abstract send(message: IEmailMessage): Observable<void>;
}
