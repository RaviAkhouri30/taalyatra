import { type Observable } from 'rxjs';
import { type SiteChatRole } from '@core/enums/site-chat-role.enum';

/** One earlier message, sent so a follow-up question makes sense. */
export interface ISiteChatTurn {
  readonly role: SiteChatRole;
  readonly text: string;
}

/** How many earlier messages a question carries, as `api/` allows. */
export const SITE_CHAT_HISTORY = 4;

/**
 * The site's AI chat (0025 V7, ADR-0020): answers a visitor's typed question from the published
 * site. Loaded on the first typed question, so the site's first download doesn't carry it.
 */
export abstract class ISiteChat {
  /**
   * @param question What the visitor typed.
   * @param history The last few messages before it.
   * @returns The answer, once; fails whenever the AI can't answer, and the script answers instead.
   */
  public abstract ask(question: string, history: readonly ISiteChatTurn[]): Observable<string>;
}
