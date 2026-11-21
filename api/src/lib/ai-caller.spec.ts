import { firstValueFrom } from 'rxjs';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  type ITestKeys,
  NOW_MS,
  createTestKeys,
  fakeDependencies,
  roleDocument,
  signToken,
} from '../testing/api-testing.js';
import { ADMIN_UID } from './api-constants.js';
import { AI_NOT_ALLOWED, aiCaller, roleAllowsLeads } from './ai-caller.js';

const mapOf = (fields: Record<string, unknown>) => ({ mapValue: { fields } });

describe('aiCaller', () => {
  let test: ITestKeys;

  beforeAll(async () => {
    test = await createTestKeys();
  });

  it('should know the owner without reading a role', async () => {
    const read = vi.fn();
    const token = await signToken(test.privateKey);

    await expect(
      firstValueFrom(aiCaller(token, fakeDependencies(test.keys, { read }))),
    ).resolves.toEqual({
      uid: ADMIN_UID,
      leads: true,
    });
    expect(read).not.toHaveBeenCalled();
  });

  it('should accept a manager on Team access, reading their role with their own token', async () => {
    const read = vi.fn(() => Promise.resolve(roleDocument()));
    const token = await signToken(test.privateKey, { sub: 'manager' });

    const caller = await firstValueFrom(aiCaller(token, fakeDependencies(test.keys, { read })));

    expect(caller).toEqual({ uid: 'manager', leads: false });
    expect(read).toHaveBeenCalledWith(expect.stringContaining('/roles/manager'), token);
  });

  it('should refuse an account not on Team access, and a missing token', async () => {
    const token = await signToken(test.privateKey, { sub: 'stranger' });

    await expect(
      firstValueFrom(aiCaller(token, fakeDependencies(test.keys))),
    ).rejects.toMatchObject({
      status: 403,
      message: AI_NOT_ALLOWED,
    });
    await expect(firstValueFrom(aiCaller(null, fakeDependencies(test.keys)))).rejects.toMatchObject(
      {
        status: 401,
      },
    );
  });

  it('should ask to try again when the role can’t be read', async () => {
    const read = vi.fn(() => Promise.reject(new Error('offline')));
    const token = await signToken(test.privateKey, { sub: 'manager' });

    await expect(
      firstValueFrom(aiCaller(token, fakeDependencies(test.keys, { read }))),
    ).rejects.toMatchObject({ status: 502 });
  });

  describe('the leads (0022, 0024)', () => {
    const document = (fields: Record<string, unknown>) => ({ fields });

    it.each([
      ['Leads on', { areas: mapOf({ leads: { booleanValue: true } }) }, true],
      ['Leads off', { areas: mapOf({ leads: { booleanValue: false } }) }, false],
      ['no areas', {}, false],
      ['a super manager for good', { superManager: mapOf({ untilMs: { nullValue: null } }) }, true],
      [
        'a super manager before their end',
        { superManager: mapOf({ untilMs: { integerValue: String(NOW_MS + 1) } }) },
        true,
      ],
      [
        'a super manager after their end',
        { superManager: mapOf({ untilMs: { integerValue: String(NOW_MS) } }) },
        false,
      ],
      ['a malformed end', { superManager: mapOf({ untilMs: { stringValue: 'soon' } }) }, false],
    ])('should judge a role with %s', (_case, fields, allowed) => {
      expect(roleAllowsLeads(document(fields), NOW_MS)).toBe(allowed);
    });
  });
});
