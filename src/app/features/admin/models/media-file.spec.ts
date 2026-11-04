import { mediaFileRefusal } from './media-file';
import {
  MEDIA_MAX_FILE_BYTES,
  MEDIA_TOO_LARGE_TEXT,
  MEDIA_WRONG_TYPE_TEXT,
} from './media-upload.constants';

describe('mediaFileRefusal', () => {
  it.each(['a.jpg', 'a.JPEG', 'a.png', 'a.webp', 'IMG_1.HEIC', 'a.heif'])(
    'should accept %s',
    (name) => {
      expect(mediaFileRefusal(new File(['x'], name))).toBe('');
    },
  );

  it.each(['notes.pdf', 'noending', 'a.jpg.exe'])('should refuse %s', (name) => {
    expect(mediaFileRefusal(new File(['x'], name))).toBe(MEDIA_WRONG_TYPE_TEXT);
  });

  it('should accept a file at the limit and refuse one over it', () => {
    const atLimit = new File([new ArrayBuffer(MEDIA_MAX_FILE_BYTES)], 'a.jpg');
    const over = new File([new ArrayBuffer(MEDIA_MAX_FILE_BYTES + 1)], 'a.jpg');

    expect(mediaFileRefusal(atLimit)).toBe('');
    expect(mediaFileRefusal(over)).toBe(MEDIA_TOO_LARGE_TEXT);
  });
});
