import { firstValueFrom } from 'rxjs';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  AI_ENV,
  type ITestKeys,
  aiAnswer,
  createTestKeys,
  fakeDependencies,
  fakeRequest,
  roleDocument,
  signToken,
} from '../testing/api-testing.js';
import { AiLimiter } from './ai-limiter.js';
import { BAD_AI_REQUEST } from './ai-request.js';
import { imageUrlOf, writeHelp, writeInputOf } from './ai-write.js';

const REWRITE = {
  task: 'rewrite',
  style: 'shorter',
  text: 'Drum with us today',
  label: 'Headline',
  page: 'Hero',
};
const PICTURE = 'https://res.cloudinary.com/demo-cloud/image/upload/v1/taal-yatra/media/abc.jpg';

describe('writeHelp', () => {
  let test: ITestKeys;

  beforeAll(async () => {
    test = await createTestKeys();
  });

  async function ask(body: unknown, overrides: Parameters<typeof fakeDependencies>[1] = {}) {
    const token = await signToken(test.privateKey);
    const deps = fakeDependencies(test.keys, { env: AI_ENV, ...overrides });
    return { deps, response: firstValueFrom(writeHelp(fakeRequest(token, body), deps)) };
  }

  it('should rewrite a field and fit the answer to its limit', async () => {
    const post = vi.fn(() => Promise.resolve(aiAnswer('Drum with us, every weekend')));
    const { response } = await ask({ ...REWRITE, maxLength: 12 }, { post });

    await expect(response).resolves.toMatchObject({ status: 200, jsonBody: { text: 'Drum with' } });
  });

  it('should describe a picture with the picture model', async () => {
    const post = vi.fn(() => Promise.resolve(aiAnswer('Children drumming.')));
    const env = { ...AI_ENV, AI_VISION_MODEL: 'vision-model' };
    const { response } = await ask(
      { task: 'describe', label: 'Photo', imageUrl: PICTURE },
      { post, env },
    );

    await expect(response).resolves.toMatchObject({ jsonBody: { text: 'Children drumming.' } });
    expect(post).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      expect.objectContaining({ model: 'vision-model' }),
    );
  });

  it('should say the help is unavailable without a picture model, or without settings', async () => {
    const describe = { task: 'describe', label: 'Photo', imageUrl: PICTURE };

    await expect((await ask(describe)).response).rejects.toMatchObject({ status: 503 });
    await expect((await ask(REWRITE, { env: {} })).response).rejects.toMatchObject({ status: 503 });
  });

  it('should refuse past the day’s allowance, without asking the provider', async () => {
    const limiter = new AiLimiter();
    const post = vi.fn(() => Promise.resolve(aiAnswer('x')));
    const take = vi.spyOn(limiter, 'take').mockImplementation(() => {
      throw new Error('limit');
    });

    await expect((await ask(REWRITE, { post, aiLimiter: limiter })).response).rejects.toThrow(
      'limit',
    );
    expect(take).toHaveBeenCalled();
    expect(post).not.toHaveBeenCalled();
  });

  it('should refuse an account not on Team access before reading the body', async () => {
    const token = await signToken(test.privateKey, { sub: 'stranger' });
    const deps = fakeDependencies(test.keys, { env: AI_ENV });

    await expect(
      firstValueFrom(writeHelp(fakeRequest(token, REWRITE), deps)),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('should help a manager on Team access', async () => {
    const token = await signToken(test.privateKey, { sub: 'manager' });
    const deps = fakeDependencies(test.keys, {
      env: AI_ENV,
      read: vi.fn(() => Promise.resolve(roleDocument())),
    });

    await expect(
      firstValueFrom(writeHelp(fakeRequest(token, REWRITE), deps)),
    ).resolves.toMatchObject({ status: 200 });
  });

  it('should refuse a body that isn’t JSON', async () => {
    const token = await signToken(test.privateKey);
    const request = { ...fakeRequest(token), json: () => Promise.reject(new Error('bad')) };

    await expect(
      firstValueFrom(writeHelp(request, fakeDependencies(test.keys, { env: AI_ENV }))),
    ).rejects.toMatchObject({ status: 400 });
  });
});

describe('writeInputOf', () => {
  it.each([
    ['an unknown task', { ...REWRITE, task: 'publish' }],
    ['an unknown style', { ...REWRITE, style: 'angry' }],
    ['a rewrite with no text', { ...REWRITE, text: '' }],
    ['a rewrite with no style', { ...REWRITE, style: undefined }],
    ['no label', { ...REWRITE, label: '' }],
    ['text that’s too long', { ...REWRITE, text: 'x'.repeat(2001) }],
    ['text that isn’t text', { ...REWRITE, text: 5 }],
    ['a limit that isn’t a whole number', { ...REWRITE, maxLength: 1.5 }],
    ['a limit too large', { ...REWRITE, maxLength: 5001 }],
    ['a picture with a rewrite', { ...REWRITE, imageUrl: PICTURE }],
    ['a description with no picture', { task: 'describe', label: 'Photo' }],
    ['a list instead of an object', [REWRITE]],
  ])('should refuse %s', (_case, body) => {
    expect(() => writeInputOf(body, AI_ENV)).toThrow(BAD_AI_REQUEST);
  });

  it('should accept a suggestion for an empty field', () => {
    expect(writeInputOf({ task: 'suggest', label: 'Intro', page: 'Offer' }, AI_ENV)).toMatchObject({
      task: 'suggest',
      style: null,
      text: '',
      maxLength: null,
    });
  });
});

describe('imageUrlOf', () => {
  it('should accept a picture in this site’s folder', () => {
    expect(imageUrlOf(PICTURE, AI_ENV)).toBe(PICTURE);
  });

  it.each([
    ['another site', 'https://evil.example/taal-yatra/media/a.jpg'],
    ['another Cloudinary account', PICTURE.replace('demo-cloud', 'other')],
    ['another folder', PICTURE.replace('taal-yatra/media', 'elsewhere')],
  ])('should refuse a picture from %s', (_case, url) => {
    expect(() => imageUrlOf(url, AI_ENV)).toThrow(BAD_AI_REQUEST);
  });

  it('should refuse any picture when the site’s Cloudinary account isn’t set', () => {
    expect(() => imageUrlOf(PICTURE, {})).toThrow(BAD_AI_REQUEST);
  });
});
