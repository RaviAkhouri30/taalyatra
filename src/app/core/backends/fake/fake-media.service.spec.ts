import { TestBed } from '@angular/core/testing';
import { firstValueFrom, lastValueFrom, toArray } from 'rxjs';
import { MediaUploadEventKind } from '@core/enums/media-upload-event-kind.enum';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { environment } from '@env/environment';
import { FakeMediaService } from './fake-media.service';

describe('FakeMediaService', () => {
  const file = new File(['12345'], 'Photo.JPG', { type: 'image/jpeg' });

  function create(): FakeMediaService {
    TestBed.configureTestingModule({
      providers: [{ provide: APP_ENVIRONMENT, useValue: { ...environment, fakeLatencyMs: 0 } }],
    });
    return TestBed.runInInjectionContext(() => new FakeMediaService());
  }

  it('should report progress and then the stored file when a file is uploaded', async () => {
    const events = await lastValueFrom(create().upload(file).pipe(toArray()));

    expect(events.map((event) => event.kind)).toEqual([
      MediaUploadEventKind.Progress,
      MediaUploadEventKind.Uploaded,
    ]);
    expect(events[1]).toMatchObject({ media: { bytes: 5, format: 'jpg' } });
    expect(JSON.stringify(events[1])).toContain('"publicId":"taal-yatra/media/');
  });

  it('should give each upload its own id when the same file is sent twice', async () => {
    const service = create();

    const [first, second] = await Promise.all([
      lastValueFrom(service.upload(file)),
      lastValueFrom(service.upload(file)),
    ]);

    expect(first).not.toEqual(second);
  });

  it('should accept every deletion when asked', async () => {
    await expect(firstValueFrom(create().remove('any-id'))).resolves.toBeUndefined();
  });
});
