import { type Observable, catchError, defer, map, switchMap, throwError } from 'rxjs';
import { HttpStatus } from './api-constants.js';
import { ApiError } from './api-error.js';
import { type IApiDependencies } from './api-handler.js';
import { type IAiSettings } from './ai-settings.js';

/** What a caller is told whenever the provider can't help: never the provider's own message. */
export const AI_UNAVAILABLE = 'AI help isn’t available right now.';

/** How long the provider gets before the live request is abandoned. */
export const AI_TIMEOUT_MS = 20_000;

/** Low: suggestions should stay close to what was asked. */
const TEMPERATURE = 0.4;

/**
 * One part of a message: `{ type: 'text', text }`, or `{ type: 'image_url', image_url: { url } }`
 * for a model that reads pictures. Loosely typed: the provider's field names are snake_case.
 */
export type AiContentPart = Readonly<Record<string, unknown>>;

/** One message of the conversation, in the OpenAI-compatible format every provider accepts. */
export interface IAiMessage {
  readonly role: 'system' | 'user';
  readonly content: string | readonly AiContentPart[];
}

/** What one request asks for. */
export interface IAiCompletion {
  readonly model: string;
  readonly messages: readonly IAiMessage[];
  readonly maxTokens: number;
}

function unavailable(): ApiError {
  return new ApiError(HttpStatus.ServiceUnavailable, AI_UNAVAILABLE);
}

/** @returns `value[key]`, or `undefined` when `value` isn't an object. */
function fieldOf(value: unknown, key: string): unknown {
  return typeof value === 'object' && value !== null
    ? new Map(Object.entries(value as Record<string, unknown>)).get(key)
    : undefined;
}

/** @returns The answer's text, from `choices[0].message.content`; empty when there's none. */
export function answerOf(body: unknown): string {
  const choices = fieldOf(body, 'choices');
  const first: unknown = Array.isArray(choices) ? (choices as unknown[])[0] : undefined;
  const content = fieldOf(fieldOf(first, 'message'), 'content');
  return typeof content === 'string' ? content.trim() : '';
}

/**
 * Asks the provider once (0025, ADR-0020).
 * @param settings The provider's address and key.
 * @param completion The model, messages and answer length.
 * @param deps The network.
 * @returns Emits the answer's text once.
 * @throws {ApiError} Through the stream: 503 for any failure, a limit, or an empty answer.
 */
export function complete(
  settings: IAiSettings,
  completion: IAiCompletion,
  deps: IApiDependencies,
): Observable<string> {
  const body = {
    model: completion.model,
    messages: completion.messages,
    max_tokens: completion.maxTokens,
    temperature: TEMPERATURE,
  };
  const headers = { authorization: `Bearer ${settings.key}`, 'content-type': 'application/json' };
  // defer: nothing is sent until someone subscribes.
  return defer(() => deps.post(`${settings.url}/chat/completions`, headers, body)).pipe(
    // switchMap: the body is read only from a successful answer; a limit (429) or an outage
    // reads the same to the caller.
    switchMap((response) =>
      response.ok ? defer(() => response.json() as Promise<unknown>) : throwError(unavailable),
    ),
    map((answer) => {
      const text = answerOf(answer);
      if (!text) {
        throw unavailable();
      }
      return text;
    }),
    // The provider's own message can quote the request: the caller only learns it's unavailable.
    catchError(() => throwError(unavailable)),
  );
}
