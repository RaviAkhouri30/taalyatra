import { afterEach, describe, expect, it, vi } from 'vitest';
import { LIVE_DEPENDENCIES } from './live-dependencies.js';

describe('LIVE_DEPENDENCIES', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should read the real clock', () => {
    const before = Date.now();

    expect(LIVE_DEPENDENCIES.now()).toBeGreaterThanOrEqual(before);
  });

  it('should create a different id each time, in the form delete accepts', () => {
    const first = LIVE_DEPENDENCIES.randomId();

    expect(first).toMatch(/^[0-9a-f-]{36}$/u);
    expect(LIVE_DEPENDENCIES.randomId()).not.toBe(first);
  });

  it('should post the form when sending', async () => {
    const fetchStub = vi.fn(() => Promise.resolve(new Response('{}')));
    vi.stubGlobal('fetch', fetchStub);
    const form = new URLSearchParams({ a: '1' });

    await LIVE_DEPENDENCIES.send('https://example.test', form);

    expect(fetchStub).toHaveBeenCalledWith('https://example.test', { method: 'POST', body: form });
  });
});
