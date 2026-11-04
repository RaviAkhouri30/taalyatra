import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { signParams } from './cloudinary-signature.js';

describe('signParams', () => {
  it("should match the example in Cloudinary's documentation when using SHA-1", () => {
    const params = {
      timestamp: '1315060510',
      public_id: 'sample_image',
      eager: 'w_400,h_300,c_pad|w_260,h_200,c_crop',
    };

    expect(signParams(params, 'abcd', 'sha1')).toBe('bfd09f95f331f558cbd1320e67aa8d488770583e');
  });

  it('should sort by name and append the secret when using SHA-256 by default', () => {
    const expected = createHash('sha256').update('a=1&b=2secret').digest('hex');

    expect(signParams({ b: '2', a: '1' }, 'secret')).toBe(expected);
  });
});
