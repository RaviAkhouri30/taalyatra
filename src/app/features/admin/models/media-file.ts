import {
  MEDIA_FILE_ENDINGS,
  MEDIA_MAX_FILE_BYTES,
  MEDIA_TOO_LARGE_TEXT,
  MEDIA_WRONG_TYPE_TEXT,
} from './media-upload.constants';

/**
 * @param file A file the owner chose.
 * @returns Why it can't be sent, or an empty string when it can.
 */
export function mediaFileRefusal(file: File): string {
  const ending = file.name.split('.').at(-1)?.toLowerCase() ?? '';
  if (!MEDIA_FILE_ENDINGS.includes(ending)) {
    return MEDIA_WRONG_TYPE_TEXT;
  }
  return file.size > MEDIA_MAX_FILE_BYTES ? MEDIA_TOO_LARGE_TEXT : '';
}
