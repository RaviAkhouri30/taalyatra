import { SignJWT } from 'jose';
import { firstValueFrom } from 'rxjs';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  type ITestKeys,
  type ITokenOptions,
  NOW_MS,
  NOW_SECONDS,
  TEST_KID,
  createTestKeys,
  signToken,
} from '../testing/api-testing.js';
import { firebaseKeys, verifyAdmin } from './admin-token.js';
import { ADMIN_UID, FIREBASE_PROJECT_ID, HttpStatus } from './api-constants.js';

describe('verifyAdmin', () => {
  let test: ITestKeys;

  beforeAll(async () => {
    test = await createTestKeys();
  });

  const verify = (token: string | null) => firstValueFrom(verifyAdmin(token, test.keys, NOW_MS));

  it('should accept the admin when the token is valid', async () => {
    const token = await signToken(test.privateKey);

    await expect(verify(token)).resolves.toBeUndefined();
  });

  it("should refuse as forbidden when the token is valid but another account's", async () => {
    const token = await signToken(test.privateKey, { sub: 'someone-else' });

    await expect(verify(token)).rejects.toMatchObject({ status: HttpStatus.Forbidden });
  });

  it.each<[string, ITokenOptions]>([
    ['is expired', { exp: NOW_SECONDS - 1 }],
    ['is for another project', { aud: 'another-project' }],
    ['was issued by someone else', { iss: 'https://securetoken.google.com/another-project' }],
    ['was issued in the future', { iat: NOW_SECONDS + 60 }],
    ['has a sign-in time in the future', { authTime: NOW_SECONDS + 60 }],
    ['has no sign-in time', { authTime: null }],
    ["names a key Google doesn't have", { kid: 'unknown-key' }],
  ])('should refuse when the token %s', async (_case, options) => {
    const token = await signToken(test.privateKey, options);

    await expect(verify(token)).rejects.toMatchObject({ status: HttpStatus.Unauthorized });
  });

  it('should refuse when the token is signed by a different key', async () => {
    const other = await createTestKeys();
    const token = await signToken(other.privateKey);

    await expect(verify(token)).rejects.toMatchObject({ status: HttpStatus.Unauthorized });
  });

  it('should refuse when the token uses another algorithm', async () => {
    const token = await new SignJWT({ auth_time: NOW_SECONDS - 60 })
      .setProtectedHeader({ alg: 'HS256', kid: TEST_KID })
      .setSubject(ADMIN_UID)
      .setAudience(FIREBASE_PROJECT_ID)
      .setIssuer(`https://securetoken.google.com/${FIREBASE_PROJECT_ID}`)
      .setIssuedAt(NOW_SECONDS - 60)
      .setExpirationTime(NOW_SECONDS + 3600)
      .sign(new TextEncoder().encode('x'.repeat(32)));

    await expect(verify(token)).rejects.toMatchObject({ status: HttpStatus.Unauthorized });
  });

  it.each([null, '', 'not-a-token'])('should refuse when the token is %j', async (token) => {
    await expect(verify(token)).rejects.toMatchObject({ status: HttpStatus.Unauthorized });
  });

  it('should not say why when it refuses a token', async () => {
    const token = await signToken(test.privateKey, { exp: NOW_SECONDS - 1 });

    await expect(verify(token)).rejects.toMatchObject({ message: 'Please sign in again.' });
  });

  it('should build a key lookup without calling the network when created', () => {
    expect(firebaseKeys()).toBeTypeOf('function');
  });
});
