import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { fakeRequest } from '../testing/api-testing.js';
import { BAD_AI_REQUEST, bodyOf, entriesOf, textField } from './ai-request.js';

describe('AI request helpers', () => {
  it('should read the JSON body, and refuse one that isn’t JSON with 400', async () => {
    await expect(firstValueFrom(bodyOf(fakeRequest(null, { a: 1 })))).resolves.toEqual({ a: 1 });
    const broken = { ...fakeRequest(null), json: () => Promise.reject(new Error('bad')) };

    await expect(firstValueFrom(bodyOf(broken))).rejects.toMatchObject({
      status: 400,
      message: BAD_AI_REQUEST,
    });
  });

  it.each([null, 'text', [1], 3])('should find no entries in %o', (value) => {
    expect(entriesOf(value).size).toBe(0);
  });

  it('should trim text, treat a missing field as empty, and refuse anything else', () => {
    expect(textField(' Hi ', 5)).toBe('Hi');
    expect(textField(undefined, 5)).toBe('');
    expect(textField(null, 5)).toBe('');
    expect(() => textField('toolong', 5)).toThrow(BAD_AI_REQUEST);
    expect(() => textField(5, 5)).toThrow(BAD_AI_REQUEST);
  });
});
