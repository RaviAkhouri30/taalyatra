import { type HttpResponseInit } from '@azure/functions';
import { type Observable, defer, map, switchMap } from 'rxjs';
import { verifyAdmin } from './admin-token.js';
import { CLOUDINARY_API_URL, HttpStatus, TOKEN_HEADER } from './api-constants.js';
import { ApiError } from './api-error.js';
import { type IApiDependencies, type IApiRequest, jsonResponse } from './api-handler.js';
import { readCloudinaryConfig } from './cloudinary-config.js';
import { signParams } from './cloudinary-signature.js';

const MS_PER_SECOND = 1000;

/** Exactly what `signUpload` creates in `MEDIA_FOLDER`, so nothing else in the account is reachable. */
const UPLOADED_ID = /^taal-yatra\/media\/[0-9a-f-]{36}$/u;

/** @returns The id to delete, from an untrusted body. */
function readPublicId(body: unknown): string {
  const publicId =
    typeof body === 'object' && body !== null && 'publicId' in body ? body.publicId : null;
  if (typeof publicId !== 'string' || !UPLOADED_ID.test(publicId)) {
    throw new ApiError(HttpStatus.BadRequest, 'That isn’t an uploaded image.');
  }
  return publicId;
}

/** Asks Cloudinary to delete the file and clear it from its CDN. */
function destroy(publicId: string, deps: IApiDependencies): Observable<HttpResponseInit> {
  const { cloudName, apiKey, apiSecret } = readCloudinaryConfig(deps.env);
  const params = {
    invalidate: 'true',
    public_id: publicId,
    timestamp: String(Math.floor(deps.now() / MS_PER_SECOND)),
  };
  const form = new URLSearchParams({
    ...params,
    api_key: apiKey,
    signature: signParams(params, apiSecret),
  });
  return defer(() => deps.send(`${CLOUDINARY_API_URL}/${cloudName}/image/destroy`, form)).pipe(
    switchMap((response) => response.json() as Promise<{ result?: string }>),
    map(({ result }) => {
      // "not found" counts as done, so retrying after a partial failure is safe (D18).
      if (result !== 'ok' && result !== 'not found') {
        throw new ApiError(HttpStatus.BadGateway, 'The image couldn’t be deleted. Try again.');
      }
      return jsonResponse(HttpStatus.Ok, { deleted: publicId });
    }),
  );
}

/**
 * Deletes one uploaded image at Cloudinary.
 *
 * @param request The incoming request, with `{ publicId }` as its body.
 * @param deps Settings, keys, clock and network.
 * @returns Emits the response once the caller is verified as the admin.
 */
export function deleteMedia(
  request: IApiRequest,
  deps: IApiDependencies,
): Observable<HttpResponseInit> {
  return verifyAdmin(request.headers.get(TOKEN_HEADER), deps.keys, deps.now()).pipe(
    // switchMap: each stage emits once, so nothing can be cancelled by mistake.
    switchMap(() => defer(() => request.json())),
    switchMap((body) => destroy(readPublicId(body), deps)),
  );
}
