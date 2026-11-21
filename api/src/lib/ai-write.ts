import { type HttpResponseInit } from '@azure/functions';
import { type Observable, map, of, switchMap, throwError } from 'rxjs';
import { aiCaller } from './ai-caller.js';
import { AI_UNAVAILABLE, complete } from './ai-client.js';
import { AiStyle, AiTask, type IAiWriteInput, fitAnswer, writeMessages } from './ai-prompts.js';
import { badRequest, bodyOf, entriesOf, textField } from './ai-request.js';
import { type IAiSettings, readAiSettings } from './ai-settings.js';
import { HttpStatus, MEDIA_FOLDER, TOKEN_HEADER } from './api-constants.js';
import { ApiError } from './api-error.js';
import { type IApiDependencies, type IApiRequest, jsonResponse } from './api-handler.js';

/** The longest field text, card context and limit accepted (0025 design). */
const MAX_TEXT = 2000;
const MAX_CONTEXT = 3000;
const MAX_LABEL = 120;
const MAX_HINT = 300;
const MAX_PAGE = 80;
const MAX_LIMIT = 5000;
const MAX_URL = 500;
/** Enough for the longest field; a description is one sentence. */
const MAX_TOKENS = 600;

const TASKS = new Set<unknown>(Object.values(AiTask));
const STYLES = new Set<unknown>(Object.values(AiStyle));

function limitOf(value: unknown): number | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > MAX_LIMIT) {
    throw badRequest();
  }
  return value;
}

/**
 * @param value The picture's address.
 * @param env The settings, for the site's Cloudinary account.
 * @returns It, when it's a picture in this site's own folder (0025 design), else `null` if missing.
 * @throws {ApiError} 400 for any other address, so the picture model can't be pointed elsewhere.
 */
export function imageUrlOf(value: unknown, env: NodeJS.ProcessEnv): string | null {
  const url = textField(value, MAX_URL);
  if (!url) {
    return null;
  }
  const cloud = env['CLOUDINARY_CLOUD_NAME'] ?? '';
  const prefix = `https://res.cloudinary.com/${cloud}/image/upload/`;
  if (!cloud || !url.startsWith(prefix) || !url.includes(`/${MEDIA_FOLDER}/`)) {
    throw badRequest();
  }
  return url;
}

/**
 * @param body The request's JSON.
 * @param env The settings.
 * @returns The checked request.
 * @throws {ApiError} 400 for anything missing, too long, or not what the task needs.
 */
export function writeInputOf(body: unknown, env: NodeJS.ProcessEnv): IAiWriteInput {
  const fields = entriesOf(body);
  const task = fields.get('task');
  const style = fields.get('style') ?? null;
  if (!TASKS.has(task) || (style !== null && !STYLES.has(style))) {
    throw badRequest();
  }
  const input: IAiWriteInput = {
    task: task as AiTask,
    style: style as AiStyle | null,
    text: textField(fields.get('text'), MAX_TEXT),
    label: textField(fields.get('label'), MAX_LABEL),
    hint: textField(fields.get('hint'), MAX_HINT),
    page: textField(fields.get('page'), MAX_PAGE),
    context: textField(fields.get('context'), MAX_CONTEXT),
    maxLength: limitOf(fields.get('maxLength')),
    imageUrl: imageUrlOf(fields.get('imageUrl'), env),
  };
  return checkTask(input);
}

/** Each task's own needs: a rewrite has text and a style; a description has a picture. */
function checkTask(input: IAiWriteInput): IAiWriteInput {
  const rewriteOk = input.task !== AiTask.Rewrite || (input.text !== '' && input.style !== null);
  const describeOk = (input.task === AiTask.Describe) === (input.imageUrl !== null);
  if (!input.label || !rewriteOk || !describeOk) {
    throw badRequest();
  }
  return input;
}

function modelFor(input: IAiWriteInput, settings: IAiSettings): string {
  if (input.task !== AiTask.Describe) {
    return settings.model;
  }
  if (settings.visionModel === null) {
    throw new ApiError(HttpStatus.ServiceUnavailable, AI_UNAVAILABLE);
  }
  return settings.visionModel;
}

function settingsOf(env: NodeJS.ProcessEnv): Observable<IAiSettings> {
  const settings = readAiSettings(env);
  return settings
    ? of(settings)
    : throwError(() => new ApiError(HttpStatus.ServiceUnavailable, AI_UNAVAILABLE));
}

/**
 * Rewrites, suggests or describes for one editor field (0025 V8).
 * @param request The incoming request.
 * @param deps Settings, keys, clock, the network and the daily allowance.
 * @returns Emits `{ text }` once.
 */
export function writeHelp(
  request: IApiRequest,
  deps: IApiDependencies,
): Observable<HttpResponseInit> {
  return aiCaller(request.headers.get(TOKEN_HEADER), deps).pipe(
    // switchMap: each step runs once, after the one before.
    switchMap((caller) => settingsOf(deps.env).pipe(map((settings) => ({ caller, settings })))),
    switchMap(({ caller, settings }) =>
      bodyOf(request).pipe(
        map((body) => writeInputOf(body, deps.env)),
        switchMap((input) => {
          const model = modelFor(input, settings);
          // Counted only for a well-formed request the provider will see.
          deps.aiLimiter.take(caller.uid, deps.now());
          return complete(
            settings,
            { model, messages: writeMessages(input), maxTokens: MAX_TOKENS },
            deps,
          ).pipe(
            map((text) => jsonResponse(HttpStatus.Ok, { text: fitAnswer(text, input.maxLength) })),
          );
        }),
      ),
    ),
  );
}
