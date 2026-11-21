import { randomUUID } from 'node:crypto';
import { firebaseKeys } from './admin-token.js';
import { AI_TIMEOUT_MS } from './ai-client.js';
import { AiLimiter } from './ai-limiter.js';
import { ChatLimiter } from './chat-limiter.js';
import { SiteContent } from './site-content.js';
import { type IApiDependencies } from './api-handler.js';

/** The real settings, keys, clock and network, shared between requests so keys stay cached. */
export const LIVE_DEPENDENCIES: IApiDependencies = {
  env: process.env,
  keys: firebaseKeys(),
  now: () => Date.now(),
  randomId: () => randomUUID(),
  send: (url, form) => fetch(url, { method: 'POST', body: form }),
  read: (url, token) => fetch(url, { headers: { authorization: `Bearer ${token}` } }),
  readPublic: (url) => fetch(url),
  // The provider gets AI_TIMEOUT_MS; past it the request is abandoned and the caller told it's unavailable.
  post: (url, headers, body) =>
    fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    }),
  aiLimiter: new AiLimiter(),
  chatLimiter: new ChatLimiter(),
  siteContent: new SiteContent(),
};
