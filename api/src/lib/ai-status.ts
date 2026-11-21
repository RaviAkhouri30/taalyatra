import { type HttpResponseInit } from '@azure/functions';
import { type Observable, map } from 'rxjs';
import { aiCaller } from './ai-caller.js';
import { readAiSettings } from './ai-settings.js';
import { HttpStatus, TOKEN_HEADER } from './api-constants.js';
import { type IApiDependencies, type IApiRequest, jsonResponse } from './api-handler.js';

/**
 * Which AI help is set up (0025 design), for a signed-in account on Team access, so the admin
 * shows the buttons only once the provider's settings are in place.
 * @param request The incoming request.
 * @param deps Settings, keys, clock and the network.
 * @returns Emits `{ text, vision }` once.
 */
export function aiStatus(
  request: IApiRequest,
  deps: IApiDependencies,
): Observable<HttpResponseInit> {
  return aiCaller(request.headers.get(TOKEN_HEADER), deps).pipe(
    map(() => {
      const settings = readAiSettings(deps.env);
      return jsonResponse(HttpStatus.Ok, {
        text: settings !== null,
        vision: settings !== null && settings.visionModel !== null,
      });
    }),
  );
}
