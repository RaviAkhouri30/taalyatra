import { firstValueFrom } from 'rxjs';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  type ITestKeys,
  NOW_SECONDS,
  TEST_ENV,
  TEST_ID,
  createTestKeys,
  fakeDependencies,
  fakeRequest,
  signToken,
} from '../testing/api-testing.js';
import { HttpStatus } from './api-constants.js';
import { signParams } from './cloudinary-signature.js';
import { deleteMedia } from './delete-media.js';

const PUBLIC_ID = `taal-yatra/media/${TEST_ID}`;

describe('deleteMedia', () => {
  let test: ITestKeys;

  beforeAll(async () => {
    test = await createTestKeys();
  });

  const run = async (
    body: unknown,
    send = vi.fn(() => Promise.resolve(Response.json({ result: 'ok' }))),
  ) => {
    const token = await signToken(test.privateKey);
    const deps = fakeDependencies(test.keys, { send });
    return { send, result: firstValueFrom(deleteMedia(fakeRequest(token, body), deps)) };
  };

  it('should sign and send the delete when the admin asks', async () => {
    const send = vi.fn((_url: string, _form: URLSearchParams) =>
      Promise.resolve(Response.json({ result: 'ok' })),
    );
    const token = await signToken(test.privateKey);

    const response = await firstValueFrom(
      deleteMedia(
        fakeRequest(token, { publicId: PUBLIC_ID }),
        fakeDependencies(test.keys, { send }),
      ),
    );

    expect(response).toMatchObject({ status: HttpStatus.Ok, jsonBody: { deleted: PUBLIC_ID } });
    const [url, form] = send.mock.calls[0] ?? [];
    expect(url).toBe('https://api.cloudinary.com/v1_1/demo-cloud/image/destroy');
    expect(form?.get('public_id')).toBe(PUBLIC_ID);
    expect(form?.get('signature')).toBe(
      signParams(
        { invalidate: 'true', public_id: PUBLIC_ID, timestamp: String(NOW_SECONDS) },
        TEST_ENV.CLOUDINARY_API_SECRET,
      ),
    );
  });

  it('should count it as done when Cloudinary no longer has the file', async () => {
    const { result } = await run(
      { publicId: PUBLIC_ID },
      vi.fn(() => Promise.resolve(Response.json({ result: 'not found' }))),
    );

    await expect(result).resolves.toMatchObject({ status: HttpStatus.Ok });
  });

  it('should report a failure when Cloudinary refuses', async () => {
    const { result } = await run(
      { publicId: PUBLIC_ID },
      vi.fn(() => Promise.resolve(Response.json({ error: { message: 'no' } }))),
    );

    await expect(result).rejects.toMatchObject({ status: HttpStatus.BadGateway });
  });

  it.each([
    ['another folder', { publicId: `other/${TEST_ID}` }],
    ['a path that climbs out', { publicId: `taal-yatra/media/../${TEST_ID}` }],
    ['the sample images', { publicId: 'sample' }],
    ['a number', { publicId: 42 }],
    ['nothing', {}],
    ['no object', null],
  ])('should refuse without calling Cloudinary when given %s', async (_case, body) => {
    const { result, send } = await run(body);

    await expect(result).rejects.toMatchObject({ status: HttpStatus.BadRequest });
    expect(send).not.toHaveBeenCalled();
  });

  it('should refuse without reading the body when the caller is another account', async () => {
    const token = await signToken(test.privateKey, { sub: 'someone-else' });
    const send = vi.fn(() => Promise.resolve(Response.json({ result: 'ok' })));

    await expect(
      firstValueFrom(
        deleteMedia(
          fakeRequest(token, { publicId: PUBLIC_ID }),
          fakeDependencies(test.keys, { send }),
        ),
      ),
    ).rejects.toMatchObject({ status: HttpStatus.Forbidden });
    expect(send).not.toHaveBeenCalled();
  });

  it('should fail clearly when uploads are not set up', async () => {
    const token = await signToken(test.privateKey);

    await expect(
      firstValueFrom(
        deleteMedia(
          fakeRequest(token, { publicId: PUBLIC_ID }),
          fakeDependencies(test.keys, { env: {} }),
        ),
      ),
    ).rejects.toMatchObject({ status: HttpStatus.ServerError });
  });
});
