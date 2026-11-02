import { type HttpStatus } from './api-constants.js';

/** A failure with the status and the message the caller should see. */
export class ApiError extends Error {
  /**
   * @param status The HTTP status to answer with.
   * @param message Safe to show the caller: it never contains a token or a secret.
   */
  public constructor(
    public readonly status: HttpStatus,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
