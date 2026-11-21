import { firstValueFrom } from 'rxjs';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  type ITestKeys,
  AI_ENV,
  aiAnswer,
  createTestKeys,
  fakeDependencies,
} from '../testing/api-testing.js';
import { AI_UNAVAILABLE, answerOf, complete } from './ai-client.js';
import { readAiSettings } from './ai-settings.js';

const SETTINGS = readAiSettings(AI_ENV)!;
const COMPLETION = {
  model: 'text-model',
  messages: [{ role: 'user' as const, content: 'Hi' }],
  maxTokens: 10,
};

describe('complete', () => {
  let test: ITestKeys;

  beforeAll(async () => {
    test = await createTestKeys();
  });

  it('should post the OpenAI-compatible request with the key, and return the answer', async () => {
    const post = vi.fn(() => Promise.resolve(aiAnswer('  Hello.  ')));

    const text = await firstValueFrom(
      complete(SETTINGS, COMPLETION, fakeDependencies(test.keys, { post })),
    );

    expect(text).toBe('Hello.');
    expect(post).toHaveBeenCalledWith(
      'https://ai.example/v1/chat/completions',
      { authorization: 'Bearer not-a-real-key', 'content-type': 'application/json' },
      { model: 'text-model', messages: COMPLETION.messages, max_tokens: 10, temperature: 0.4 },
    );
  });

  it.each([
    ['a limit', () => Promise.resolve(new Response('slow down', { status: 429 }))],
    ['an empty answer', () => Promise.resolve(aiAnswer('  '))],
    ['no answer at all', () => Promise.resolve(Response.json({}))],
    ['a network failure', () => Promise.reject(new Error('reset, key=secret'))],
  ])(
    'should say the help is unavailable after %s, never the provider’s message',
    async (_case, post) => {
      await expect(
        firstValueFrom(complete(SETTINGS, COMPLETION, fakeDependencies(test.keys, { post }))),
      ).rejects.toMatchObject({ status: 503, message: AI_UNAVAILABLE });
    },
  );

  it.each([null, 'text', [], [{}], [{ message: 'x' }], [{ message: { content: 1 } }]])(
    'should find no answer in %o',
    (choices) => {
      expect(answerOf(choices === null ? null : { choices })).toBe('');
    },
  );
});
