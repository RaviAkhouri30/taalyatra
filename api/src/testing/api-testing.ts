import { type InvocationContext } from '@azure/functions';
import { type CryptoKey, SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from 'jose';
import { type Mock, vi } from 'vitest';
import { ADMIN_UID, FIREBASE_PROJECT_ID, TOKEN_HEADER } from '../lib/api-constants.js';
import { type IApiDependencies, type IApiRequest } from '../lib/api-handler.js';

/** A fixed moment: 2026-11-02T00:00:00Z. */
export const NOW_MS = 1_793_577_600_000;
export const NOW_SECONDS = NOW_MS / 1000;
export const TEST_KID = 'test-key';
export const TEST_ID = '11111111-2222-3333-4444-555555555555';

export const TEST_ENV = {
  CLOUDINARY_CLOUD_NAME: 'demo-cloud',
  CLOUDINARY_API_KEY: 'key-123',
  CLOUDINARY_API_SECRET: 'not-a-real-secret',
};

export interface ITestKeys {
  readonly privateKey: CryptoKey;
  readonly keys: IApiDependencies['keys'];
}

/** A key pair standing in for Google's, so tokens go through real verification. */
export async function createTestKeys(): Promise<ITestKeys> {
  const { publicKey, privateKey } = await generateKeyPair('RS256');
  const jwk = { ...(await exportJWK(publicKey)), kid: TEST_KID, alg: 'RS256', use: 'sig' };
  return { privateKey, keys: createLocalJWKSet({ keys: [jwk] }) };
}

export interface ITokenOptions {
  readonly sub?: string;
  readonly aud?: string;
  readonly iss?: string;
  readonly iat?: number;
  readonly exp?: number;
  readonly authTime?: number | null;
  readonly kid?: string;
}

/** @returns A signed token: the admin's and valid, apart from whatever `options` changes. */
export function signToken(privateKey: CryptoKey, options: ITokenOptions = {}): Promise<string> {
  const authTime = options.authTime === undefined ? NOW_SECONDS - 60 : options.authTime;
  return new SignJWT(authTime === null ? {} : { auth_time: authTime })
    .setProtectedHeader({ alg: 'RS256', kid: options.kid ?? TEST_KID })
    .setSubject(options.sub ?? ADMIN_UID)
    .setAudience(options.aud ?? FIREBASE_PROJECT_ID)
    .setIssuer(options.iss ?? `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`)
    .setIssuedAt(options.iat ?? NOW_SECONDS - 60)
    .setExpirationTime(options.exp ?? NOW_SECONDS + 3600)
    .sign(privateKey);
}

/** @returns A request carrying `token`, with `body` as its JSON. */
export function fakeRequest(token: string | null, body: unknown = {}): IApiRequest {
  return {
    headers: { get: (name) => (name === TOKEN_HEADER ? token : null) },
    json: () => Promise.resolve(body),
  };
}

/** @returns Dependencies with a fixed clock and id, and a stub network. */
export function fakeDependencies(
  keys: IApiDependencies['keys'],
  overrides: Partial<IApiDependencies> = {},
): IApiDependencies {
  return {
    env: TEST_ENV,
    keys,
    now: () => NOW_MS,
    randomId: () => TEST_ID,
    send: vi.fn(() => Promise.resolve(Response.json({ result: 'ok' }))),
    ...overrides,
  };
}

/** @returns An invocation context, and the spy that records its errors. */
export function fakeContext(): { context: InvocationContext; error: Mock } {
  const error = vi.fn();
  return { context: { error } as unknown as InvocationContext, error };
}
