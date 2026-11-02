import { firstValueFrom } from 'rxjs';
import { beforeAll, describe, expect, it } from 'vitest';
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
import { type ISignedUpload, signUpload } from './sign-upload.js';

describe('signUpload', () => {
  let test: ITestKeys;

  beforeAll(async () => {
    test = await createTestKeys();
  });

  const signedFields = async (body: unknown = {}) => {
    const token = await signToken(test.privateKey);
    const response = await firstValueFrom(
      signUpload(fakeRequest(token, body), fakeDependencies(test.keys)),
    );
    expect(response.status).toBe(HttpStatus.Ok);
    return response.jsonBody as ISignedUpload;
  };

  it('should fix the id, file types and transformation when the admin asks', async () => {
    const { fields, uploadUrl } = await signedFields();

    expect(uploadUrl).toBe('https://api.cloudinary.com/v1_1/demo-cloud/image/upload');
    expect(fields).toMatchObject({
      allowed_formats: 'jpg,png,webp,heic',
      public_id: `taal-yatra/media/${TEST_ID}`,
      timestamp: String(NOW_SECONDS),
      transformation: 'a_exif/c_limit,w_2400',
      api_key: 'key-123',
    });
  });

  it('should sign exactly the settings it returns, leaving out the API key', async () => {
    const { fields } = await signedFields();
    const signedParams = Object.fromEntries(
      Object.entries(fields).filter(([name]) => name !== 'signature' && name !== 'api_key'),
    );

    expect(fields['signature']).toBe(signParams(signedParams, TEST_ENV.CLOUDINARY_API_SECRET));
  });

  it('should ignore settings in the request when the browser sends its own', async () => {
    const { fields } = await signedFields({ public_id: 'evil', transformation: 'x', folder: 'y' });

    expect(fields['public_id']).toBe(`taal-yatra/media/${TEST_ID}`);
    expect(fields['transformation']).toBe('a_exif/c_limit,w_2400');
    expect(fields).not.toHaveProperty('folder');
  });

  it('should never return the secret', async () => {
    const { fields } = await signedFields();

    expect(JSON.stringify(fields)).not.toContain(TEST_ENV.CLOUDINARY_API_SECRET);
  });

  it('should refuse before signing when the caller is another account', async () => {
    const token = await signToken(test.privateKey, { sub: 'someone-else' });

    await expect(
      firstValueFrom(signUpload(fakeRequest(token), fakeDependencies(test.keys))),
    ).rejects.toMatchObject({ status: HttpStatus.Forbidden });
  });

  it('should refuse when there is no token', async () => {
    await expect(
      firstValueFrom(signUpload(fakeRequest(null), fakeDependencies(test.keys))),
    ).rejects.toMatchObject({ status: HttpStatus.Unauthorized });
  });

  it('should fail clearly when uploads are not set up', async () => {
    const token = await signToken(test.privateKey);

    await expect(
      firstValueFrom(signUpload(fakeRequest(token), fakeDependencies(test.keys, { env: {} }))),
    ).rejects.toMatchObject({ status: HttpStatus.ServerError });
  });
});
