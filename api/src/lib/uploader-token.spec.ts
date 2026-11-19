import { firstValueFrom } from 'rxjs';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  type ITestKeys,
  createTestKeys,
  fakeDependencies,
  signToken,
} from '../testing/api-testing.js';
import { HttpStatus } from './api-constants.js';
import { uploadsAllowed, verifyUploader } from './uploader-token.js';

const ROLE_URL =
  'https://firestore.googleapis.com/v1/projects/taal-yatra/databases/(default)/documents/roles/manager-uid';

const role = (uploads: unknown) => ({ name: 'roles/manager-uid', fields: { uploads } });

describe('verifyUploader', () => {
  let test: ITestKeys;

  beforeAll(async () => {
    test = await createTestKeys();
  });

  function check(token: string | null, read: (url: string, token: string) => Promise<Response>) {
    const spy = vi.fn(read);
    const deps = fakeDependencies(test.keys, { read: spy });
    return { result: firstValueFrom(verifyUploader(token, deps)), read: spy };
  }

  it('should accept the owner without reading anything', async () => {
    const token = await signToken(test.privateKey);
    const { result, read } = check(token, () => Promise.reject(new Error('unused')));

    await expect(result).resolves.toBeUndefined();
    expect(read).not.toHaveBeenCalled();
  });

  it('should accept a manager with uploads on, reading their record with their own sign-in', async () => {
    const token = await signToken(test.privateKey, { sub: 'manager-uid' });
    const { result, read } = check(token, () =>
      Promise.resolve(Response.json(role({ booleanValue: true }))),
    );

    await expect(result).resolves.toBeUndefined();
    expect(read).toHaveBeenCalledExactlyOnceWith(ROLE_URL, token);
  });

  it.each([
    ['uploads off', () => Promise.resolve(Response.json(role({ booleanValue: false })))],
    ['no record', () => Promise.resolve(new Response('{}', { status: 404 }))],
    ['a record the rules refuse', () => Promise.resolve(new Response('{}', { status: 403 }))],
  ])('should refuse a manager with %s', async (_case, read) => {
    const token = await signToken(test.privateKey, { sub: 'manager-uid' });

    await expect(check(token, read).result).rejects.toMatchObject({
      status: HttpStatus.Forbidden,
      message: 'This account can’t upload photos.',
    });
  });

  it('should say to try again when the database can’t be reached', async () => {
    const token = await signToken(test.privateKey, { sub: 'manager-uid' });

    await expect(
      check(token, () => Promise.reject(new Error('offline'))).result,
    ).rejects.toMatchObject({ status: HttpStatus.BadGateway });
  });

  it('should refuse without reading when there is no token', async () => {
    const { result, read } = check(null, () => Promise.reject(new Error('unused')));

    await expect(result).rejects.toMatchObject({ status: HttpStatus.Unauthorized });
    expect(read).not.toHaveBeenCalled();
  });

  it('should refuse a token that isn’t genuine before reading anything', async () => {
    const { result, read } = check('not-a-token', () => Promise.reject(new Error('unused')));

    await expect(result).rejects.toMatchObject({ status: HttpStatus.Unauthorized });
    expect(read).not.toHaveBeenCalled();
  });
});

describe('uploadsAllowed', () => {
  it.each([
    [role({ booleanValue: true }), true],
    [role({ booleanValue: 'true' }), false],
    [role({ stringValue: 'true' }), false],
    [{ fields: {} }, false],
    [null, false],
  ])('should read %j as %s', (document, allowed) => {
    expect(uploadsAllowed(document)).toBe(allowed);
  });
});
