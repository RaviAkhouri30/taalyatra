import { of, throwError } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { fakeContext } from '../testing/api-testing.js';
import { HttpStatus } from './api-constants.js';
import { ApiError } from './api-error.js';
import { jsonResponse, toAzureResponse } from './api-handler.js';

describe('toAzureResponse', () => {
  it('should resolve with the response when the stream succeeds', async () => {
    const response = jsonResponse(HttpStatus.Ok, { done: true });

    await expect(toAzureResponse(of(response), fakeContext().context)).resolves.toEqual(response);
  });

  it('should never let a response be cached', () => {
    expect(jsonResponse(HttpStatus.Ok, {}).headers).toEqual({ 'cache-control': 'no-store' });
  });

  it('should answer with its status and message when the failure is an ApiError', async () => {
    const { context, error } = fakeContext();
    const failure = new ApiError(HttpStatus.Forbidden, 'Not you.');

    const response = await toAzureResponse(
      throwError(() => failure),
      context,
    );

    expect(response).toMatchObject({
      status: HttpStatus.Forbidden,
      jsonBody: { error: 'Not you.' },
    });
    expect(error).not.toHaveBeenCalled();
  });

  it('should log it and hide the details when the failure is unexpected', async () => {
    const { context, error } = fakeContext();

    const response = await toAzureResponse(
      throwError(() => new Error('secret detail')),
      context,
    );

    expect(response).toMatchObject({
      status: HttpStatus.ServerError,
      jsonBody: { error: 'Something went wrong.' },
    });
    expect(error).toHaveBeenCalledWith('secret detail');
  });

  it('should log a generic message when the failure is not an Error', async () => {
    const { context, error } = fakeContext();

    await toAzureResponse(
      throwError(() => 'odd'),
      context,
    );

    expect(error).toHaveBeenCalledWith('Unknown failure');
  });
});
