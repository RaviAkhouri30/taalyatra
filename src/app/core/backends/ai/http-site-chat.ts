import { type HttpClient } from '@angular/common/http';
import { type Observable, map, timeout } from 'rxjs';
import { type ISiteChat, type ISiteChatTurn } from '@core/interfaces/i-site-chat';
import { AI_CHAT_URL } from './ai.constants';

/** Past this, the visitor gets the scripted reply instead (0025 design, 2.7.0). */
export const SITE_CHAT_TIMEOUT_MS = 12_000;

/** What the function answers. */
interface ISiteChatDto {
  readonly text: string;
}

/** Asks the Azure Function, which alone holds the provider's key; no sign-in (0025 V7). */
export class HttpSiteChat implements ISiteChat {
  /** @param http The site's `HttpClient`, already on every page. */
  public constructor(private readonly http: HttpClient) {}

  public ask(question: string, history: readonly ISiteChatTurn[]): Observable<string> {
    return this.http.post<ISiteChatDto>(AI_CHAT_URL, { question, history }).pipe(
      timeout(SITE_CHAT_TIMEOUT_MS),
      map((answer) => answer.text),
    );
  }
}
