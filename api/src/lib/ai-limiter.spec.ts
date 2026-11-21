import { describe, expect, it } from 'vitest';
import { NOW_MS } from '../testing/api-testing.js';
import { AI_LIMIT_REACHED, AiLimiter } from './ai-limiter.js';

const DAY_MS = 86_400_000;

describe('AiLimiter', () => {
  it('should allow the day’s allowance, then refuse with 429', () => {
    const limiter = new AiLimiter();
    limiter.take('a', NOW_MS, 2);
    limiter.take('a', NOW_MS, 2);

    expect(() => {
      limiter.take('a', NOW_MS, 2);
    }).toThrow(AI_LIMIT_REACHED);
  });

  it('should count each account on its own', () => {
    const limiter = new AiLimiter();
    limiter.take('a', NOW_MS, 1);

    expect(() => {
      limiter.take('b', NOW_MS, 1);
    }).not.toThrow();
  });

  it('should start afresh on the next India day', () => {
    const limiter = new AiLimiter();
    limiter.take('a', NOW_MS, 1);

    expect(() => {
      limiter.take('a', NOW_MS + DAY_MS, 1);
    }).not.toThrow();
  });
});
