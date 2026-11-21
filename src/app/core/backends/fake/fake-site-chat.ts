import { type Observable, delay, of, throwError } from 'rxjs';
import { type ISiteChat, type ISiteChatTurn } from '@core/interfaces/i-site-chat';
import { FAKE_CHAT_FAIL, FAKE_CHAT_PREFIX } from './fake-ai.constants';

/** Answers predictably, without a network (development, unit tests and e2e). */
export class FakeSiteChat implements ISiteChat {
  /** @param latencyMs How long it seems to think. */
  public constructor(private readonly latencyMs: number) {}

  public ask(question: string, _history: readonly ISiteChatTurn[]): Observable<string> {
    if (question.includes(FAKE_CHAT_FAIL)) {
      return throwError(() => new Error('The fake chat was asked to fail.'));
    }
    return of(`${FAKE_CHAT_PREFIX} ${question}`).pipe(delay(this.latencyMs));
  }
}
