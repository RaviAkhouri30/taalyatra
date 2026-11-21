import { firstValueFrom } from 'rxjs';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  AI_ENV,
  type ITestKeys,
  aiAnswer,
  createTestKeys,
  fakeDependencies,
  fakeRequest,
  restList,
  restText,
} from '../testing/api-testing.js';
import { BAD_AI_REQUEST } from './ai-request.js';
import { ChatLimiter } from './chat-limiter.js';
import { MAX_CHAT_ANSWER, chatInputOf, chatSettings, siteChat } from './ai-chat.js';

const CHAT_ENV = { ...AI_ENV, AI_CHAT: 'on' };
const readPublic = vi.fn((url: string) =>
  Promise.resolve(
    url.includes('/home')
      ? restList('home', { faq: { a: restText('Two hours.') } })
      : new Response('{}', { status: 404 }),
  ),
);

describe('siteChat', () => {
  let test: ITestKeys;

  beforeAll(async () => {
    test = await createTestKeys();
  });

  function ask(body: unknown, overrides: Parameters<typeof fakeDependencies>[1] = {}) {
    const deps = fakeDependencies(test.keys, { env: CHAT_ENV, readPublic, ...overrides });
    return firstValueFrom(siteChat(fakeRequest(null, body), deps));
  }

  it('should answer from the site, with no sign-in, sending the site’s text', async () => {
    const post = vi.fn(() => Promise.resolve(aiAnswer('It lasts two hours.')));

    await expect(ask({ question: 'How long?' }, { post })).resolves.toMatchObject({
      status: 200,
      jsonBody: { text: 'It lasts two hours.' },
    });
    expect(JSON.stringify(post.mock.calls)).toContain('Two hours.');
  });

  it('should keep the answer short', async () => {
    const post = vi.fn(() => Promise.resolve(aiAnswer('word '.repeat(200))));

    const response = await ask({ question: 'Tell me everything' }, { post });

    expect((response.jsonBody as { text: string }).text.length).toBeLessThanOrEqual(
      MAX_CHAT_ANSWER,
    );
  });

  it('should say it’s unavailable until the owner turns the chat on', async () => {
    await expect(ask({ question: 'Hi' }, { env: AI_ENV })).rejects.toMatchObject({ status: 503 });
  });

  it('should refuse past the visitor’s limit, without asking the provider', async () => {
    const limiter = new ChatLimiter();
    vi.spyOn(limiter, 'take').mockImplementation(() => {
      throw new Error('limit');
    });
    const post = vi.fn();

    await expect(ask({ question: 'Hi' }, { chatLimiter: limiter, post })).rejects.toThrow('limit');
    expect(post).not.toHaveBeenCalled();
  });

  it('should refuse a malformed question before counting it', async () => {
    const limiter = new ChatLimiter();
    const take = vi.spyOn(limiter, 'take');

    await expect(ask({ question: '' }, { chatLimiter: limiter })).rejects.toMatchObject({
      status: 400,
    });
    expect(take).not.toHaveBeenCalled();
  });
});

describe('chatInputOf', () => {
  it('should accept a question with up to 4 earlier messages', () => {
    const history = [
      { role: 'visitor', text: 'Hi' },
      { role: 'bot', text: 'Hello' },
    ];

    expect(chatInputOf({ question: ' How long? ', history })).toEqual({
      question: 'How long?',
      history,
    });
  });

  it.each([
    ['no question', {}],
    ['a long question', { question: 'x'.repeat(301) }],
    ['another field', { question: 'Hi', name: 'Asha' }],
    [
      'too many earlier messages',
      { question: 'Hi', history: Array.from({ length: 5 }, () => ({ role: 'bot', text: 'x' })) },
    ],
    ['an unknown role', { question: 'Hi', history: [{ role: 'system', text: 'x' }] }],
    [
      'an extra field in a message',
      { question: 'Hi', history: [{ role: 'bot', text: 'x', name: 'y' }] },
    ],
    ['a history that isn’t a list', { question: 'Hi', history: 'x' }],
  ])('should refuse %s', (_case, body) => {
    expect(() => chatInputOf(body)).toThrow(BAD_AI_REQUEST);
  });
});

describe('chatSettings', () => {
  it.each([
    ['on', 'on', true],
    ['ON with spaces', ' ON ', true],
    ['off', 'off', false],
    ['missing', undefined, false],
  ])('should answer only when AI_CHAT is %s', (_case, value, on) => {
    const env = value === undefined ? AI_ENV : { ...AI_ENV, AI_CHAT: value };

    expect(chatSettings(env) !== null).toBe(on);
  });
});
