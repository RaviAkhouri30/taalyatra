/** The upload function's routes (`api/`). */
export const MEDIA_SIGN_URL = '/api/media/sign';
export const MEDIA_DELETE_URL = '/api/media/delete';

/** Carries the ID token. Not `Authorization`: users report the platform replacing it (D4). */
export const MEDIA_TOKEN_HEADER = 'x-firebase-token';

/** Cloudinary's incoming transformation limits the stored file to the same width (D7, D8). */
export const MAX_UPLOAD_WIDTH_PX = 2400;
export const JPEG_OUTPUT_QUALITY = 0.9;
export const JPEG_TYPE = 'image/jpeg';
export const PNG_TYPE = 'image/png';

/** Stored as PNG, because they may be transparent and JPEG would turn that black. */
export const TRANSPARENT_TYPES: readonly string[] = [PNG_TYPE, 'image/webp'];
