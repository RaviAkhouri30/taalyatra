/** The only account allowed to sign or delete. A UID isn't a secret (ADR-0012). */
export const ADMIN_UID = '5zsz2DlUaja2Ss7wbFTrpiMMROk2';

/** The Firebase project whose sign-ins are accepted. */
export const FIREBASE_PROJECT_ID = 'taal-yatra';

/** Google's public keys for Firebase ID tokens. */
export const FIREBASE_KEYS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

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
  ServerError = 500,
  BadGateway = 502,
}
