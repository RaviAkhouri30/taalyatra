import { MediaErrorKind } from '@core/enums/media-error-kind.enum';
import { MediaError } from './i-media-service';

describe('MediaError', () => {
  it('should report its own kind when it is a media error', () => {
    expect(MediaError.kindOf(new MediaError(MediaErrorKind.Rejected))).toBe(
      MediaErrorKind.Rejected,
    );
  });

  it('should report unavailable when it is anything else', () => {
    expect(MediaError.kindOf(new Error('boom'))).toBe(MediaErrorKind.Unavailable);
  });
});
