import { type HttpResponseInit } from '@azure/functions';
import { type Observable, map } from 'rxjs';
import { verifyAdmin } from './admin-token.js';
import {
  ALLOWED_FORMATS,
  HttpStatus,
  INCOMING_TRANSFORMATION,
  MEDIA_FOLDER,
  TOKEN_HEADER,
} from './api-constants.js';
import { type IApiDependencies, type IApiRequest, jsonResponse } from './api-handler.js';
import { readCloudinaryConfig } from './cloudinary-config.js';
import { signParams } from './cloudinary-signature.js';

const MS_PER_SECOND = 1000;

/** What the browser needs to send one file directly to Cloudinary. */
export interface ISignedUpload {
  readonly uploadUrl: string;
  readonly fields: Readonly<Record<string, string>>;
}

/**
 * Signs one upload. The request's body is ignored: this function alone decides the id, the
 * folder, the file types and the transformation, so a signature can't be used for anything else.
 *
 * @param request The incoming request.
 * @param deps Settings, keys, clock and id generator.
 * @returns Emits the response once the caller is verified as the admin.
 */
export function signUpload(
  request: IApiRequest,
  deps: IApiDependencies,
): Observable<HttpResponseInit> {
  return verifyAdmin(request.headers.get(TOKEN_HEADER), deps.keys, deps.now()).pipe(
    map(() => {
      const { cloudName, apiKey, apiSecret } = readCloudinaryConfig(deps.env);
      const params = {
        allowed_formats: ALLOWED_FORMATS,
        public_id: `${MEDIA_FOLDER}/${deps.randomId()}`,
        timestamp: String(Math.floor(deps.now() / MS_PER_SECOND)),
        transformation: INCOMING_TRANSFORMATION,
      };
      const signed: ISignedUpload = {
        uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        fields: {
          ...params,
          api_key: apiKey,
          signature: signParams(params, apiSecret),
        },
      };
      return jsonResponse(HttpStatus.Ok, signed);
    }),
  );
}
