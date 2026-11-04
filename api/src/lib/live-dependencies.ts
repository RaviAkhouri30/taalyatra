import { randomUUID } from 'node:crypto';
import { firebaseKeys } from './admin-token.js';
import { type IApiDependencies } from './api-handler.js';

/** The real settings, keys, clock and network, shared between requests so keys stay cached. */
export const LIVE_DEPENDENCIES: IApiDependencies = {
  env: process.env,
  keys: firebaseKeys(),
  now: () => Date.now(),
  randomId: () => randomUUID(),
  send: (url, form) => fetch(url, { method: 'POST', body: form }),
};
