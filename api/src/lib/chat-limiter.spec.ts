import { describe, expect, it } from 'vitest';
import { NOW_MS } from '../testing/api-testing.js';
import {
  CHAT_LIMIT_REACHED,
  CHAT_PER_DAY,
  CHAT_PER_VISITOR_HOUR,
  ChatLimiter,
  visitorOf,
} from './chat-limiter.js';

const HOUR_MS = 3_600_000;
const request = (headers: Record<string, string>) => ({
  headers: { get: (name: string) => headers[name] ?? null },
  json: () => Promise.resolve({}),
});

describe('ChatLimiter', () => {
  it('should allow 10 questions an hour per visitor, then refuse with 429', () => {
    const limiter = new ChatLimiter();
    for (let index = 0; index < CHAT_PER_VISITOR_HOUR; index += 1) {
      limiter.take('a', NOW_MS);
    }

    expect(() => {
      limiter.take('a', NOW_MS);
    }).toThrow(CHAT_LIMIT_REACHED);
    expect(() => {
      limiter.take('b', NOW_MS);
    }).not.toThrow();
    expect(() => {
      limiter.take('a', NOW_MS + HOUR_MS);
    }).not.toThrow();
  });

  it('should stop the whole chat at 500 a day', () => {
    const limiter = new ChatLimiter();
    for (let index = 0; index < CHAT_PER_DAY; index += 1) {
      limiter.take(`visitor-${String(index)}`, NOW_MS);
    }

    expect(() => {
      limiter.take('new', NOW_MS);
    }).toThrow(CHAT_LIMIT_REACHED);
  });

  it('should forget earlier hours’ visitors once there are many', () => {
    const limiter = new ChatLimiter();
    for (let index = 0; index < 5000; index += 1) {
      limiter.take(`v${String(index)}`, NOW_MS + Math.floor(index / 400) * 86_400_000);
    }

    expect(() => {
      limiter.take('later', NOW_MS + 20 * 86_400_000);
    }).not.toThrow();
  });
});

describe('visitorOf', () => {
  it('should hash Azure’s client address, never keeping it', () => {
    const visitor = visitorOf(request({ 'x-azure-clientip': '203.0.113.7' }));

    expect(visitor).toMatch(/^[0-9a-f]{64}$/);
    expect(visitor).not.toContain('203');
  });

  it('should fall back to the first forwarded address, the same visitor either way', () => {
    expect(visitorOf(request({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }))).toBe(
      visitorOf(request({ 'x-azure-clientip': '203.0.113.7' })),
    );
  });

  it('should count visitors with no address together', () => {
    expect(visitorOf(request({}))).toBe(visitorOf(request({ 'x-forwarded-for': ' ' })));
  });
});
