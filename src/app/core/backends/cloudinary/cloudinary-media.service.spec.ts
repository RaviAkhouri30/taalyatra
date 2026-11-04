import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpEventType } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { type Observable, lastValueFrom, of, toArray } from 'rxjs';
import { MediaErrorKind } from '@core/enums/media-error-kind.enum';
import { MediaUploadEventKind } from '@core/enums/media-upload-event-kind.enum';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { MediaError } from '@core/interfaces/i-media-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { environment } from '@env/environment';
import { CloudinaryMediaService } from './cloudinary-media.service';
import { ImagePreparer } from './image-preparer';

describe('CloudinaryMediaService', () => {
  const uploadUrl = 'https://api.cloudinary.com/v1_1/demo/image/upload';
  const signed = { uploadUrl, fields: { api_key: 'key', signature: 'sig', public_id: 'id' } };
  const stored = {
    public_id: 'taal-yatra/media/abc',
    version: 123,
    width: 2400,
    height: 1800,
    bytes: 5000,
    format: 'jpg',
    secure_url: 'ignored',
  };
  const file = new File(['bytes'], 'photo.jpg', { type: 'image/jpeg' });
  const prepared = new Blob(['drawn']);
  let http: HttpTestingController;
  let prepare: ReturnType<typeof vi.spyOn>;

  function create(token: string | null = 'id-token'): CloudinaryMediaService {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_ENVIRONMENT, useValue: environment },
        { provide: IAuthService, useValue: { idToken: () => of(token) } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    return TestBed.runInInjectionContext(() => new CloudinaryMediaService());
  }

  /** Subscribes and resolves to every event, or to the failure's kind. */
  function collect<T>(source: Observable<T>): Promise<T[] | MediaErrorKind> {
    return lastValueFrom(source.pipe(toArray())).catch((error: unknown) =>
      MediaError.kindOf(error),
    );
  }

  /** Lets the prepared file's step finish, so the next request is on its way. */
  function settle(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve);
    });
  }

  beforeEach(() => {
    prepare = vi.spyOn(ImagePreparer.prototype, 'prepare').mockReturnValue(of(prepared));
  });

  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
  });

  describe('upload', () => {
    it('should ask for a signature with the ID token and no settings of its own', async () => {
      const result = collect(create().upload(file));
      await settle();

      const sign = http.expectOne('/api/media/sign');
      expect(sign.request.method).toBe('POST');
      expect(sign.request.body).toBeNull();
      expect(sign.request.headers.get('x-firebase-token')).toBe('id-token');
      sign.flush(signed);
      http.expectOne(uploadUrl).flush(stored);
      await result;
    });

    it('should send the prepared file with exactly the signed settings', async () => {
      const result = collect(create().upload(file));
      await settle();
      http.expectOne('/api/media/sign').flush(signed);

      const send = http.expectOne(uploadUrl);
      const form = send.request.body as FormData;
      expect(Object.fromEntries(form.entries())).toMatchObject(signed.fields);
      expect(form.get('file')).toBeInstanceOf(Blob);
      expect(form.has('transformation')).toBe(false);
      expect(send.request.headers.has('x-firebase-token')).toBe(false);
      send.flush(stored);
      await result;
    });

    it('should report progress and then the stored file when it uploads', async () => {
      const result = collect(create().upload(file));
      await settle();
      http.expectOne('/api/media/sign').flush(signed);
      const send = http.expectOne(uploadUrl);

      send.event({ type: HttpEventType.Sent });
      send.event({ type: HttpEventType.UploadProgress, loaded: 1, total: 4 });
      send.event({ type: HttpEventType.UploadProgress, loaded: 1 });
      send.flush(stored);

      await expect(result).resolves.toEqual([
        { kind: MediaUploadEventKind.Progress, percent: 25 },
        { kind: MediaUploadEventKind.Progress, percent: 0 },
        {
          kind: MediaUploadEventKind.Uploaded,
          media: {
            publicId: 'taal-yatra/media/abc',
            version: 123,
            width: 2400,
            height: 1800,
            bytes: 5000,
            format: 'jpg',
          },
        },
      ]);
    });

    it('should do nothing until someone subscribes', async () => {
      create().upload(file);
      await settle();

      http.expectNone('/api/media/sign');
      expect(prepare).toHaveBeenCalledTimes(1);
    });

    it('should refuse without calling the function when nobody is signed in', async () => {
      await expect(collect(create(null).upload(file))).resolves.toBe(MediaErrorKind.Refused);
    });

    it.each([
      [401, MediaErrorKind.Refused],
      [403, MediaErrorKind.Refused],
      [500, MediaErrorKind.Unavailable],
    ])('should report a %i from the function as %s', async (status, kind) => {
      const result = collect(create().upload(file));
      await settle();

      http.expectOne('/api/media/sign').flush({}, { status, statusText: 'No' });

      await expect(result).resolves.toBe(kind);
    });

    it.each([
      [400, MediaErrorKind.Rejected],
      [0, MediaErrorKind.Unavailable],
    ])('should report a %i from Cloudinary as %s', async (status, kind) => {
      const result = collect(create().upload(file));
      await settle();
      http.expectOne('/api/media/sign').flush(signed);

      http.expectOne(uploadUrl).flush({}, { status, statusText: 'No' });

      await expect(result).resolves.toBe(kind);
    });
  });

  describe('remove', () => {
    it('should ask the function to delete it with the ID token', async () => {
      const result = collect(create().remove('taal-yatra/media/abc'));

      const remove = http.expectOne('/api/media/delete');
      expect(remove.request.body).toEqual({ publicId: 'taal-yatra/media/abc' });
      expect(remove.request.headers.get('x-firebase-token')).toBe('id-token');
      remove.flush({ deleted: 'taal-yatra/media/abc' });

      await expect(result).resolves.toEqual([undefined]);
    });

    it('should report a refusal when the function refuses', async () => {
      const result = collect(create().remove('taal-yatra/media/abc'));

      http.expectOne('/api/media/delete').flush({}, { status: 403, statusText: 'No' });

      await expect(result).resolves.toBe(MediaErrorKind.Refused);
    });
  });

  it('should keep the original error when a failure is reported', async () => {
    const result = lastValueFrom(create().remove('taal-yatra/media/abc')).catch(
      (error: unknown) => error,
    );

    http.expectOne('/api/media/delete').flush({}, { status: 500, statusText: 'Broken' });

    expect(await result).toMatchObject({ cause: { status: 500 } });
  });

  it('should report unavailable when the request takes too long', async () => {
    vi.useFakeTimers();
    const result = collect(create().remove('taal-yatra/media/abc'));
    http.expectOne('/api/media/delete');

    await vi.advanceTimersByTimeAsync(environment.requestTimeoutMs + 1);

    await expect(result).resolves.toBe(MediaErrorKind.Unavailable);
    vi.useRealTimers();
  });
});
