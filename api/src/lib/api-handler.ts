import { type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { type JWTVerifyGetKey } from 'jose';
import { type Observable, catchError, firstValueFrom, of } from 'rxjs';
import { HttpStatus } from './api-constants.js';
import { ApiError } from './api-error.js';

/** The parts of a request the functions read; Azure's `HttpRequest` has them. */
export interface IApiRequest {
  readonly headers: { get(name: string): string | null };
  json(): Promise<unknown>;
}

/** What the functions need from outside, so tests can supply their own. */
export interface IApiDependencies {
  readonly env: NodeJS.ProcessEnv;
  readonly keys: JWTVerifyGetKey;
  now(): number;
  randomId(): string;
  send(url: string, form: URLSearchParams): Promise<Response>;
}

const NO_STORE = { 'cache-control': 'no-store' };

/** @returns A JSON response that's never cached. */
export function jsonResponse(status: HttpStatus, body: unknown): HttpResponseInit {
  return { status, jsonBody: body, headers: NO_STORE };
}

/**
 * Turns a stream into what Azure's runtime requires: a Promise (CLAUDE.md §7 exception,
 * ADR-0017). This is the only place in `api/` that leaves RxJS.
 *
 * @param response$ The function's result.
 * @param context Logs unexpected failures. Only the message: never a request's token.
 * @returns The response; a failure becomes its status and a message safe to show.
 */
export function toAzureResponse(
  response$: Observable<HttpResponseInit>,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  return firstValueFrom(
    response$.pipe(
      catchError((error: unknown) => {
        if (error instanceof ApiError) {
          return of(jsonResponse(error.status, { error: error.message }));
        }
        context.error(error instanceof Error ? error.message : 'Unknown failure');
        return of(jsonResponse(HttpStatus.ServerError, { error: 'Something went wrong.' }));
      }),
    ),
  );
}
