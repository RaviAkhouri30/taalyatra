import { type Observable } from 'rxjs';
import { AiErrorKind } from '@core/enums/ai-error-kind.enum';
import { type AiStyle } from '@core/enums/ai-style.enum';
import { type AiTask } from '@core/enums/ai-task.enum';

/** Which AI help is set up (0025). */
export interface IAiStatus {
  /** Rewrite, Suggest and Analyse. */
  readonly text: boolean;
  /** Suggest a description: a picture model is set (D5). */
  readonly vision: boolean;
}

/** No help: the provider isn't set up, or couldn't be asked. */
export const NO_AI: IAiStatus = { text: false, vision: false };

/** One editor field's request (V8). Only what D3 allows: the field, its card and its page. */
export interface IAiWriteRequest {
  readonly task: AiTask;
  readonly style?: AiStyle;
  readonly text?: string;
  readonly label: string;
  readonly hint?: string;
  readonly page: string;
  /** The same card's other text fields, at most `AI_CONTEXT_MAX` characters. */
  readonly context?: string;
  readonly maxLength?: number;
  /** A picture in the site's own media folder, for a description. */
  readonly imageUrl?: string;
}

/** Counts by label, e.g. `{ Corporate: 4, School: 2 }`. */
export type AiCounts = Readonly<Record<string, number>>;

/** The leads as counts only, never a record (V12, D3). The shape `api/` accepts, and nothing else. */
export interface ILeadsSummary {
  readonly total: number;
  readonly byStatus: AiCounts;
  readonly byEventType: AiCounts;
  readonly byExperience: AiCounts;
  readonly byGroupSize: AiCounts;
  readonly byEventMonth: AiCounts;
  readonly byReceivedMonth: AiCounts;
}

/** The most characters of a card's other text sent with a request, as `api/` allows. */
export const AI_CONTEXT_MAX = 3000;

/** What the owner is told for each kind of failure. */
export const AI_ERROR_MESSAGES: Readonly<Record<AiErrorKind, string>> = {
  [AiErrorKind.Unavailable]: 'AI help isn’t available right now. Your text is unchanged.',
  [AiErrorKind.Limit]: 'You’ve used today’s AI help. It’s back tomorrow.',
  [AiErrorKind.Refused]: 'Please sign in again to use AI help.',
};

/** A failed AI request, with a provider-independent reason. */
export class AiError extends Error {
  /**
   * @param kind Why it failed.
   * @param cause The original error, kept for the logs.
   */
  public constructor(
    public readonly kind: AiErrorKind,
    cause?: unknown,
  ) {
    super(`AI request failed: ${kind}`, { cause });
    this.name = 'AiError';
  }

  /**
   * @param error Anything an AI call failed with.
   * @returns What to tell the owner: its kind's message, or "unavailable" for anything else.
   */
  public static messageOf(error: unknown): string {
    return AI_ERROR_MESSAGES[error instanceof AiError ? error.kind : AiErrorKind.Unavailable];
  }
}

/**
 * The AI help port (0025, ADR-0020): an adapter asks the Azure Function, which alone holds the
 * provider's key; the Fake answers predictably for development, tests and e2e.
 */
export abstract class IAiService {
  /** @returns Which help is set up, once per session; `NO_AI` when unknown or unreachable. */
  public abstract status(): Observable<IAiStatus>;

  /**
   * @param request The field and what to do with it.
   * @returns The suggestion's text, once.
   * @throws {AiError} Through the stream, when it couldn't be written.
   */
  public abstract write(request: IAiWriteRequest): Observable<string>;

  /**
   * @param summary The leads, as counts only.
   * @returns A short analysis in plain text, once.
   * @throws {AiError} Through the stream, when it couldn't be written.
   */
  public abstract analyseLeads(summary: ILeadsSummary): Observable<string>;
}
