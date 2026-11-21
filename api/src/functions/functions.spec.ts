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
    await import('./ai-status.js');
    await import('./ai-write.js');
    await import('./ai-leads.js');
    await import('./ai-chat.js');
  });

  it.each([
    ['media-sign', 'media/sign', 'POST'],
    ['media-delete', 'media/delete', 'POST'],
    ['ai-write', 'ai/write', 'POST'],
    ['ai-leads', 'ai/leads', 'POST'],
    ['ai-status', 'ai/status', 'GET'],
    ['ai-chat', 'ai/chat', 'POST'],
  ])('should expose %s as /api/%s, %s only', (name, route, method) => {
    expect(registered.get(name)).toMatchObject({
      methods: [method],
      authLevel: 'anonymous',
      route,
    });
  });

  it.each(['media-sign', 'media-delete', 'ai-write', 'ai-leads', 'ai-status'])(
    'should refuse a request with no token when calling %s',
    async (name) => {
      const handler = registered.get(name)?.['handler'] as Handler;
      const request = { headers: { get: () => null }, json: () => Promise.resolve({}) };

      const response = await handler(request, fakeContext().context);

      expect(response.status).toBe(401);
    },
  );
});

describe('the public chat', () => {
  it('should answer without a token, saying it isn’t available until it’s turned on', async () => {
    await import('./ai-chat.js');
    const handler = registered.get('ai-chat')?.['handler'] as Handler;
    const request = {
      headers: { get: () => null },
      json: () => Promise.resolve({ question: 'Hi' }),
    };

    const response = await handler(request, fakeContext().context);

    expect(response.status).toBe(503);
  });
});
