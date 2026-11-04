import { HttpStatus } from './api-constants.js';
import { ApiError } from './api-error.js';

/** The Cloudinary account's details. */
export interface ICloudinaryConfig {
  readonly cloudName: string;
  readonly apiKey: string;
  /** Stays on the server: it's never logged or sent to the browser. */
  readonly apiSecret: string;
}

/**
 * @param env The function's settings.
 * @returns The Cloudinary details.
 * @throws {ApiError} When a setting is missing, e.g. on a pull request's preview site.
 */
export function readCloudinaryConfig(env: NodeJS.ProcessEnv): ICloudinaryConfig {
  const cloudName = env['CLOUDINARY_CLOUD_NAME'];
  const apiKey = env['CLOUDINARY_API_KEY'];
  const apiSecret = env['CLOUDINARY_API_SECRET'];
  if (!cloudName || !apiKey || !apiSecret) {
    throw new ApiError(HttpStatus.ServerError, 'Uploads aren’t set up on this site.');
  }
  return { cloudName, apiKey, apiSecret };
}
