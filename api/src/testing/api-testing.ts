import { type InvocationContext } from '@azure/functions';
import { type CryptoKey, SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from 'jose';
import { type Mock, vi } from 'vitest';
import { ADMIN_UID, FIREBASE_PROJECT_ID, TOKEN_HEADER } from '../lib/api-constants.js';
import { AiLimiter } from '../lib/ai-limiter.js';
import { ChatLimiter } from '../lib/chat-limiter.js';
import { SiteContent } from '../lib/site-content.js';
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
    // No record unless a test gives one: a manager may not upload by default.
    read: vi.fn(() => Promise.resolve(new Response('{}', { status: 404 }))),
    // The provider answers "A suggestion." unless a test gives another answer.
    post: vi.fn(() =>
      Promise.resolve(Response.json({ choices: [{ message: { content: 'A suggestion.' } }] })),
    ),
    aiLimiter: new AiLimiter(),
    // No published site unless a test gives one.
    readPublic: vi.fn(() => Promise.resolve(new Response('{}', { status: 404 }))),
    chatLimiter: new ChatLimiter(),
    siteContent: new SiteContent(),
    ...overrides,
  };
}

/** @returns An invocation context, and the spy that records its errors. */
export function fakeContext(): { context: InvocationContext; error: Mock } {
  const error = vi.fn();
  return { context: { error } as unknown as InvocationContext, error };
}

/** The provider's settings, as the owner sets them in Azure (0025 D2). */
export const AI_ENV = {
  ...TEST_ENV,
  AI_API_URL: 'https://ai.example/v1/',
  AI_MODEL: 'text-model',
  AI_API_KEY: 'not-a-real-key',
};

/** @returns A Firestore REST role document with these fields, as the rules let its owner read it. */
export function roleDocument(fields: Record<string, unknown> = {}): Response {
  return Response.json({ fields: { email: { stringValue: 'm@b.c' }, ...fields } });
}

/** @returns A provider answer carrying `content`. */
export function aiAnswer(content: unknown): Response {
  return Response.json({ choices: [{ message: { content } }] });
}

/** @returns A Firestore REST string value. */
export function restText(text: string): unknown {
  return { stringValue: text };
}

/** @returns A Firestore REST list body with these documents, by id. */
export function restList(
  collection: string,
  documents: Record<string, Record<string, unknown>>,
): Response {
  return Response.json({
    documents: Object.entries(documents).map(([id, fields]) => ({
      name: `projects/x/databases/(default)/documents/${collection}/${id}`,
      fields,
    })),
  });
}
