import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject } from '@angular/core';
import {
  type Observable,
  catchError,
  defer,
  map,
  of,
  shareReplay,
  switchMap,
  throwError,
  timeout,
} from 'rxjs';
import { MEDIA_TOKEN_HEADER } from '@core/backends/cloudinary/cloudinary.constants';
import { AiErrorKind } from '@core/enums/ai-error-kind.enum';
import {
  AiError,
  type IAiService,
  type IAiStatus,
  type IAiWriteRequest,
  type ILeadsSummary,
  NO_AI,
} from '@core/interfaces/i-ai-service';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { AI_LEADS_URL, AI_STATUS_URL, AI_WRITE_URL } from './ai.constants';

/** The provider gets 20 s in the function; this leaves room for the round trip. */
const AI_TIMEOUT_MS = 25_000;
const HTTP_UNAUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;
const HTTP_TOO_MANY = 429;

const ERROR_KINDS: ReadonlyMap<number, AiErrorKind> = new Map([
  [HTTP_UNAUTHORIZED, AiErrorKind.Refused],
  [HTTP_FORBIDDEN, AiErrorKind.Refused],
  [HTTP_TOO_MANY, AiErrorKind.Limit],
]);

function toAiError(error: unknown): AiError {
  const status = error instanceof HttpErrorResponse ? error.status : 0;
  return new AiError(ERROR_KINDS.get(status) ?? AiErrorKind.Unavailable, error);
}

/** What the function answers with a suggestion or an analysis. */
interface IAiTextDto {
  readonly text: string;
}

/**
 * Asks the Azure Function for AI help (0025), with the signed-in account's ID token, as uploads do.
 * The provider's key stays in the function's settings (D2).
 */
export class HttpAiService implements IAiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(IAuthService);
  private readonly requestTimeoutMs = inject(APP_ENVIRONMENT).requestTimeoutMs;
  /** Read once per session: settings change only with a deploy. */
  // defer: nothing is asked until the admin first wants the status.
  private readonly status$ = defer(() => this.authorised()).pipe(
    // switchMap: authorised() emits once.
    switchMap((headers) => this.http.get<IAiStatus>(AI_STATUS_URL, { headers })),
    timeout(this.requestTimeoutMs),
    map((status) => ({ text: status.text, vision: status.vision })),
    // Unknown is "not set up": no buttons, nothing broken.
    catchError(() => of(NO_AI)),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  public status(): Observable<IAiStatus> {
    return this.status$;
  }

  public write(request: IAiWriteRequest): Observable<string> {
    return this.ask(AI_WRITE_URL, request);
  }

  public analyseLeads(summary: ILeadsSummary): Observable<string> {
    return this.ask(AI_LEADS_URL, { summary });
  }

  private ask(url: string, body: unknown): Observable<string> {
    return this.authorised().pipe(
      // switchMap: authorised() emits once.
      switchMap((headers) => this.http.post<IAiTextDto>(url, body, { headers })),
      timeout(AI_TIMEOUT_MS),
      map((answer) => answer.text),
      catchError((error: unknown) =>
        throwError(() => (error instanceof AiError ? error : toAiError(error))),
      ),
    );
  }

  private authorised(): Observable<HttpHeaders> {
    return this.auth.idToken().pipe(
      map((token) => {
        if (!token) {
          throw new AiError(AiErrorKind.Refused);
        }
        return new HttpHeaders({ [MEDIA_TOKEN_HEADER]: token });
      }),
    );
  }
}
