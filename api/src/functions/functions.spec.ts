import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeContext } from '../testing/api-testing.js';

const registered = vi.hoisted(() => new Map<string, Record<string, unknown>>());

vi.mock('@azure/functions', () => ({
  app: {
    http: (name: string, options: Record<string, unknown>) => registered.set(name, options),
  },
}));

type Handler = (
  request: unknown,
  context: unknown,
) => Promise<{ status: number; jsonBody: unknown }>;

describe('function registration', () => {
  beforeEach(async () => {
    await import('./media-sign.js');
    await import('./media-delete.js');
  });

  it.each([
    ['media-sign', 'media/sign'],
    ['media-delete', 'media/delete'],
  ])('should expose %s as POST /api/%s only', (name, route) => {
    expect(registered.get(name)).toMatchObject({
      methods: ['POST'],
      authLevel: 'anonymous',
      route,
    });
  });

  it.each(['media-sign', 'media-delete'])(
    'should refuse a request with no token when calling %s',
    async (name) => {
      const handler = registered.get(name)?.['handler'] as Handler;
      const request = { headers: { get: () => null }, json: () => Promise.resolve({}) };

      const response = await handler(request, fakeContext().context);

      expect(response.status).toBe(401);
    },
  );
});
