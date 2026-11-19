import { type Observable, catchError, defer, map, of, switchMap, throwError } from 'rxjs';
import { INVALID_TOKEN, verifyToken } from './admin-token.js';
import {
  ADMIN_UID,
  FIRESTORE_DOCUMENTS_URL,
  HttpStatus,
  ROLES_COLLECTION,
} from './api-constants.js';
import { ApiError } from './api-error.js';
import { type IApiDependencies } from './api-handler.js';

const NOT_ALLOWED = 'This account can’t upload photos.';

function entries(value: unknown): ReadonlyMap<string, unknown> {
  return new Map(typeof value === 'object' && value !== null ? Object.entries(value) : []);
}

/**
 * @param document A Firestore REST document, e.g. `{ fields: { uploads: { booleanValue: true } } }`.
 * @returns Whether it says uploads are on. Only an explicit yes counts, as in the rules.
 */
export function uploadsAllowed(document: unknown): boolean {
  const uploads = entries(entries(entries(document).get('fields')).get('uploads'));
  return uploads.get('booleanValue') === true;
}

/** A manager may upload when their Team access record says so; no record means no access. */
function managerMayUpload(uid: string, token: string, deps: IApiDependencies): Observable<void> {
  const url = `${FIRESTORE_DOCUMENTS_URL}/${ROLES_COLLECTION}/${encodeURIComponent(uid)}`;
  // defer: the request is made when the stream is subscribed, not when it's built.
  return defer(() => deps.read(url, token)).pipe(
    // The database couldn't be reached: not the caller's fault, and nothing is signed.
    catchError(() => throwError(() => new ApiError(HttpStatus.BadGateway, 'Please try again.'))),
    // switchMap: the body is read only for a record the rules let them see.
    switchMap((response) =>
      response.ok
        ? defer(() => response.json() as Promise<unknown>)
        : throwError(() => new ApiError(HttpStatus.Forbidden, NOT_ALLOWED)),
    ),
    map((document) => {
      if (!uploadsAllowed(document)) {
        throw new ApiError(HttpStatus.Forbidden, NOT_ALLOWED);
      }
    }),
  );
}

/**
 * Checks the caller may upload photos (0019): the owner, or a manager whose permissions have
 * uploads on. Deleting stays with `verifyAdmin`.
 *
 * @param token The token from the request, if any.
 * @param deps Keys, clock and the network.
 * @returns Emits once when the caller may upload.
 * @throws {ApiError} Through the stream: 401 for a missing or invalid token, 403 for an account
 *   that may not upload, 502 when its permissions couldn't be read.
 */
export function verifyUploader(token: string | null, deps: IApiDependencies): Observable<void> {
  if (!token) {
    return throwError(() => new ApiError(HttpStatus.Unauthorized, INVALID_TOKEN));
  }
  return verifyToken(token, deps.keys, deps.now()).pipe(
    // switchMap: the owner needs no read; a manager's permissions are read once per request.
    switchMap((uid) => (uid === ADMIN_UID ? of(undefined) : managerMayUpload(uid, token, deps))),
  );
}
