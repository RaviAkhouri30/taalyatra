import { type HttpResponseInit } from '@azure/functions';
import { type Observable, map, switchMap, throwError } from 'rxjs';
import { aiCaller } from './ai-caller.js';
import { AI_UNAVAILABLE, complete } from './ai-client.js';
import { leadsMessages } from './ai-prompts.js';
import { badRequest, bodyOf, entriesOf } from './ai-request.js';
import { readAiSettings } from './ai-settings.js';
import { HttpStatus, TOKEN_HEADER } from './api-constants.js';
import { ApiError } from './api-error.js';
import { type IApiDependencies, type IApiRequest, jsonResponse } from './api-handler.js';

/** The counts a summary may hold, and nothing else (0025 D3): no record can slip through. */
export const SUMMARY_GROUPS = [
  'byStatus',
  'byEventType',
  'byExperience',
  'byGroupSize',
  'byEventMonth',
  'byReceivedMonth',
] as const;

const MAX_LABELS = 40;
const MAX_LABEL_LENGTH = 60;
const MAX_COUNT = 100_000;
const MAX_TOKENS = 700;
const NOT_ALLOWED = 'Analysing leads needs the Leads area.';

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= MAX_COUNT;
}

function groupOf(value: unknown): Record<string, number> {
  const labels = entriesOf(value);
  if (labels.size === 0 && (typeof value !== 'object' || value === null || Array.isArray(value))) {
    throw badRequest();
  }
  if (labels.size > MAX_LABELS) {
    throw badRequest();
  }
  const counts = [...labels].map(([label, count]) => {
    if (label.length > MAX_LABEL_LENGTH || !isCount(count)) {
      throw badRequest();
    }
    return [label, count] as const;
  });
  return Object.fromEntries(counts);
}

/**
 * @param body The request's JSON: `{ summary }`.
 * @returns The summary, rebuilt from the expected counts only.
 * @throws {ApiError} 400 for any other key, label or value.
 */
export function summaryOf(body: unknown): Record<string, unknown> {
  const outer = entriesOf(body);
  const summary = entriesOf(outer.get('summary'));
  const expected = new Set<string>(['total', ...SUMMARY_GROUPS]);
  const unknownKey = [...summary.keys()].some((key) => !expected.has(key));
  const total = summary.get('total');
  if (outer.size !== 1 || unknownKey || summary.size !== expected.size || !isCount(total)) {
    throw badRequest();
  }
  return {
    total,
    ...Object.fromEntries(SUMMARY_GROUPS.map((group) => [group, groupOf(summary.get(group))])),
  };
}

/**
 * Analyses the anonymous lead counts (0025 V12), for the owner, a running super manager, or a
 * manager given Leads.
 * @param request The incoming request.
 * @param deps Settings, keys, clock, the network and the daily allowance.
 * @returns Emits `{ text }` once.
 */
export function leadsAnalysis(
  request: IApiRequest,
  deps: IApiDependencies,
): Observable<HttpResponseInit> {
  return aiCaller(request.headers.get(TOKEN_HEADER), deps).pipe(
    // switchMap: each step runs once, after the one before.
    switchMap((caller) => {
      const settings = readAiSettings(deps.env);
      if (!caller.leads) {
        return throwError(() => new ApiError(HttpStatus.Forbidden, NOT_ALLOWED));
      }
      if (!settings) {
        return throwError(() => new ApiError(HttpStatus.ServiceUnavailable, AI_UNAVAILABLE));
      }
      return bodyOf(request).pipe(
        map((body) => summaryOf(body)),
        switchMap((summary) => {
          deps.aiLimiter.take(caller.uid, deps.now());
          const completion = {
            model: settings.model,
            messages: leadsMessages(summary),
            maxTokens: MAX_TOKENS,
          };
          return complete(settings, completion, deps);
        }),
        map((text) => jsonResponse(HttpStatus.Ok, { text })),
      );
    }),
  );
}
