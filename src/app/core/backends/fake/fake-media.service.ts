import { inject } from '@angular/core';
import { type Observable, concat, defer, delay, of } from 'rxjs';
import { MediaUploadEventKind } from '@core/enums/media-upload-event-kind.enum';
import { type IMediaService, type MediaUploadEvent } from '@core/interfaces/i-media-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';

const FAKE_FOLDER = 'taal-yatra/media';
const FAKE_PROGRESS_PERCENT = 50;
const FAKE_VERSION = 1;
const FAKE_WIDTH = 1200;
const FAKE_HEIGHT = 630;

/** "Stores" every file without sending it (development, e2e and the emulator). */
export class FakeMediaService implements IMediaService {
  private readonly latencyMs = inject(APP_ENVIRONMENT).fakeLatencyMs;

  public upload(file: File): Observable<MediaUploadEvent> {
    // defer: each subscription is a new upload with its own id, like the real one.
    return concat(
      of<MediaUploadEvent>({
        kind: MediaUploadEventKind.Progress,
        percent: FAKE_PROGRESS_PERCENT,
      }),
      defer(() =>
        of<MediaUploadEvent>({
          kind: MediaUploadEventKind.Uploaded,
          media: {
            publicId: `${FAKE_FOLDER}/${crypto.randomUUID()}`,
            version: FAKE_VERSION,
            width: FAKE_WIDTH,
            height: FAKE_HEIGHT,
            bytes: file.size,
            format: file.name.split('.').at(-1)?.toLowerCase() ?? '',
          },
        }),
      ).pipe(delay(this.latencyMs)),
    );
  }

  public remove(_publicId: string): Observable<void> {
    return of(undefined).pipe(delay(this.latencyMs));
  }
}
