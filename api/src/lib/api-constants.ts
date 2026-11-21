/** The owner: uploads and deletes; managers only upload, when allowed (0019). A UID isn't a secret (ADR-0012). */
export const ADMIN_UID = '5zsz2DlUaja2Ss7wbFTrpiMMROk2';

/** The Firebase project whose sign-ins are accepted. */
export const FIREBASE_PROJECT_ID = 'taal-yatra';

/** Google's public keys for Firebase ID tokens. */
export const FIREBASE_KEYS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

/**
 * Firestore's documents, read with the caller's own sign-in (0019 decision 8): the rules let each
 * account read only its own Team access record, so this server holds no database credential.
 */
export const FIRESTORE_DOCUMENTS_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

/** Where Team access keeps each manager's permissions, by account id. */
export const ROLES_COLLECTION = 'roles';

/** The header carrying the token. Not `Authorization`: users report the platform replacing it. */
export const TOKEN_HEADER = 'x-firebase-token';

/** Every upload goes here, and delete refuses anything else. */
export const MEDIA_FOLDER = 'taal-yatra/media';

/** The file types Cloudinary will accept, whatever the browser sends. */
export const ALLOWED_FORMATS = 'jpg,png,webp,heic';

/**
 * Applied by Cloudinary before storing: upright, at most 2400 px wide, no metadata (D7).
 * `fl_force_strip` is what guarantees the last part: without it, a photo Cloudinary has no need to
 * resize or rotate is stored with its GPS location, as the proof on the real account showed.
 */
export const INCOMING_TRANSFORMATION = 'a_exif/c_limit,fl_force_strip,w_2400';

/** Cloudinary's API, for server-side calls. */
export const CLOUDINARY_API_URL = 'https://api.cloudinary.com/v1_1';

/** HTTP statuses this API answers with. */
export enum HttpStatus {
  Ok = 200,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  TooManyRequests = 429,
  ServerError = 500,
  BadGateway = 502,
  ServiceUnavailable = 503,
}
