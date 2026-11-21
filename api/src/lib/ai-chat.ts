import { type HttpResponseInit } from '@azure/functions';
import { type Observable, map, switchMap, throwError } from 'rxjs';
import { AI_UNAVAILABLE, type IAiMessage, complete } from './ai-client.js';
import { fitAnswer } from './ai-prompts.js';
import { badRequest, bodyOf, entriesOf, textField } from './ai-request.js';
import { type IAiSettings, readAiSettings } from './ai-settings.js';
import { HttpStatus } from './api-constants.js';
import { ApiError } from './api-error.js';
import { type IApiDependencies, type IApiRequest, jsonResponse } from './api-handler.js';
import { visitorOf } from './chat-limiter.js';
import { ChatRole, type IChatInput, type IChatTurn, chatMessages } from './chat-prompts.js';

/** The longest question, earlier message and answer (0025 design, 2.7.0). */
const MAX_QUESTION = 300;
const MAX_TURN = 600;
const MAX_TURNS = 4;
export const MAX_CHAT_ANSWER = 600;
/** A short answer: a few sentences. */
const MAX_TOKENS = 300;
const ROLES = new Set<unknown>(Object.values(ChatRole));
/** A turn is exactly `{ role, text }`. */
const TURN_FIELDS = 2;

function turnOf(value: unknown): IChatTurn {
  const fields = entriesOf(value);
  const role = fields.get('role');
  if (!ROLES.has(role) || fields.size !== TURN_FIELDS) {
    throw badRequest();
  }
  return { role: role as ChatRole, text: textField(fields.get('text'), MAX_TURN) };
}

/**
 * @param body The request's JSON: `{ question, history? }`.
 * @returns The checked question and at most the last 4 messages.
 * @throws {ApiError} 400 for an empty or long question, a malformed history, or anything else.
 */
export function chatInputOf(body: unknown): IChatInput {
  const fields = entriesOf(body);
  const unknownKey = [...fields.keys()].some((key) => key !== 'question' && key !== 'history');
  const question = textField(fields.get('question'), MAX_QUESTION);
  const history = fields.get('history') ?? [];
  if (unknownKey || !question || !Array.isArray(history) || history.length > MAX_TURNS) {
    throw badRequest();
  }
  return { question, history: (history as unknown[]).map(turnOf) };
}

/**
 * @param env The function's settings.
 * @returns The provider's settings, when the owner turned the public chat on (`AI_CHAT=on`).
 */
export function chatSettings(env: NodeJS.ProcessEnv): IAiSettings | null {
  const on = new Map(Object.entries(env)).get('AI_CHAT')?.trim().toLowerCase() === 'on';
  return on ? readAiSettings(env) : null;
}

/** The answer to a checked question, from the site's text: counted first (D4). */
function answer(
  request: IApiRequest,
  input: IChatInput,
  settings: IAiSettings,
  deps: IApiDependencies,
): Observable<string> {
  // Counted only for a well-formed question the provider will see.
  deps.chatLimiter.take(visitorOf(request), deps.now());
  const messages = (content: string): IAiMessage[] => chatMessages(content, input);
  return deps.siteContent.text(deps).pipe(
    // switchMap: one provider request, once the site's text is ready.
    switchMap((content) =>
      complete(
        settings,
        { model: settings.model, messages: messages(content), maxTokens: MAX_TOKENS },
        deps,
      ),
    ),
  );
}

/**
 * Answers a visitor's typed question from the published site (0025 V7). No sign-in: the limits
 * per visitor and per day keep it within the free tier (D4); the browser answers from its script
 * whenever this can't.
 * @param request The incoming request.
 * @param deps Settings, clock, the network, the limits and the site's text.
 * @returns Emits `{ text }` once.
 */
export function siteChat(
  request: IApiRequest,
  deps: IApiDependencies,
): Observable<HttpResponseInit> {
  const settings = chatSettings(deps.env);
  if (!settings) {
    return throwError(() => new ApiError(HttpStatus.ServiceUnavailable, AI_UNAVAILABLE));
  }
  return bodyOf(request).pipe(
    // switchMap: the body is read once, then answered once.
    switchMap((body) => answer(request, chatInputOf(body), settings, deps)),
    map((text) => jsonResponse(HttpStatus.Ok, { text: fitAnswer(text, MAX_CHAT_ANSWER) })),
  );
}
