import { describe, expect, it } from 'vitest';
import { TEST_ENV } from '../testing/api-testing.js';
import { HttpStatus } from './api-constants.js';
import { readCloudinaryConfig } from './cloudinary-config.js';

describe('readCloudinaryConfig', () => {
  it('should return the details when every setting exists', () => {
    expect(readCloudinaryConfig(TEST_ENV)).toEqual({
      cloudName: 'demo-cloud',
      apiKey: 'key-123',
      apiSecret: 'not-a-real-secret',
    });
  });

  it.each(['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'])(
    'should refuse with a server error when %s is missing',
    (name) => {
      const env = { ...TEST_ENV, [name]: '' };

      expect(() => readCloudinaryConfig(env)).toThrow(
        expect.objectContaining({ status: HttpStatus.ServerError }),
      );
    },
  );
});
