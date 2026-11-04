import { MediaErrorKind } from '@core/enums/media-error-kind.enum';

/** The largest photo accepted; the browser shrinks it below Cloudinary's 10 MB limit (D8). */
export const MEDIA_MAX_FILE_BYTES = 15_728_640;

/** How many uploads run at once, so a slow phone isn't swamped (D13). */
export const MEDIA_UPLOAD_CONCURRENCY = 3;

/** File endings accepted, which also covers phones that report no type for HEIC. */
export const MEDIA_FILE_ENDINGS: readonly string[] = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];

/** For the file input, so the phone offers photos. */
export const MEDIA_ACCEPT = ['image/*', ...MEDIA_FILE_ENDINGS.map((ending) => `.${ending}`)].join(
  ',',
);

/** What the owner is told when a file isn't accepted, before anything is sent. */
export const MEDIA_WRONG_TYPE_TEXT =
  'This isn’t a photo the site can use. Send a JPG, PNG, WebP or HEIC.';
export const MEDIA_TOO_LARGE_TEXT = 'This photo is over 15 MB. Send a smaller copy.';

/** What the owner is told when an upload fails. */
export const MEDIA_ERROR_TEXT: Readonly<Record<MediaErrorKind, string>> = {
  [MediaErrorKind.Refused]: 'Your sign-in has expired. Sign out and back in, then try again.',
  [MediaErrorKind.Rejected]:
    'Cloudinary refused this file. It may be too large, so try sending it as a JPEG.',
  [MediaErrorKind.Unavailable]: 'The upload didn’t finish. Check your connection and try again.',
};
