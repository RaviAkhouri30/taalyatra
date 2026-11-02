import {
  HttpClient,
  type HttpEvent,
  HttpErrorResponse,
  HttpEventType,
  HttpHeaders,
  HttpStatusCode,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { type Observable, catchError, map, mergeMap, switchMap, throwError, timeout } from 'rxjs';
import { MediaErrorKind } from '@core/enums/media-error-kind.enum';
import { MediaUploadEventKind } from '@core/enums/media-upload-event-kind.enum';
import { IAuthService } from '@core/interfaces/i-auth-service';
import {
  MediaError,
  type IMediaService,
  type IUploadedMedia,
  type MediaUploadEvent,
} from '@core/interfaces/i-media-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { MEDIA_DELETE_URL, MEDIA_SIGN_URL, MEDIA_TOKEN_HEADER } from './cloudinary.constants';
import { type ICloudinaryUploadDto, type ISignedUploadDto } from './i-cloudinary';
import { ImagePreparer } from './image-preparer';

const FULL_PERCENT = 100;

/** What the function's or Cloudinary's refusals mean; anything else may work on a retry. */
const ERROR_KINDS: ReadonlyMap<number, MediaErrorKind> = new Map([
  [HttpStatusCode.Unauthorized, MediaErrorKind.Refused],
  [HttpStatusCode.Forbidden, MediaErrorKind.Refused],
  [HttpStatusCode.BadRequest, MediaErrorKind.Rejected],
]);

/** @returns The kind of failure, from what the function or Cloudinary answered. */
function toMediaError(error: unknown): MediaError {
  if (error instanceof MediaError) {
    return error;
  }
  const status = error instanceof HttpErrorResponse ? error.status : 0;
  return new MediaError(ERROR_KINDS.get(status) ?? MediaErrorKind.Unavailable);
}

/** @returns The app's view of Cloudinary's answer. */
function toUploadedMedia(dto: ICloudinaryUploadDto): IUploadedMedia {
  return {
    publicId: dto.public_id,
    version: dto.version,
    width: dto.width,
    height: dto.height,
    bytes: dto.bytes,
    format: dto.format,
  };
}

/**
 * Cloudinary adapter (D1, D9). The browser sends each file straight to Cloudinary; the upload
 * function only signs the request, so the API secret never reaches the browser (CLAUDE.md §10).
 */
export class CloudinaryMediaService implements IMediaService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(IAuthService);
  private readonly timeoutMs = inject(APP_ENVIRONMENT).requestTimeoutMs;
  private readonly preparer = new ImagePreparer();

  public upload(file: File): Observable<MediaUploadEvent> {
    return this.preparer.prepare(file).pipe(
      // switchMap: each step emits once, so this only sequences "prepared, signed, then sent".
      switchMap((prepared) => this.sign().pipe(switchMap((signed) => this.send(prepared, signed)))),
      catchError((error: unknown) => throwError(() => toMediaError(error))),
    );
  }

  public remove(publicId: string): Observable<void> {
    return this.authorised().pipe(
      // switchMap: authorised() emits once.
      switchMap((headers) => this.http.post<unknown>(MEDIA_DELETE_URL, { publicId }, { headers })),
      timeout(this.timeoutMs),
      map(() => undefined),
      catchError((error: unknown) => throwError(() => toMediaError(error))),
    );
  }

  private sign(): Observable<ISignedUploadDto> {
    return this.authorised().pipe(
      // switchMap: authorised() emits once.
      switchMap((headers) => this.http.post<ISignedUploadDto>(MEDIA_SIGN_URL, null, { headers })),
      timeout(this.timeoutMs),
    );
  }

  private authorised(): Observable<HttpHeaders> {
    return this.auth.idToken().pipe(
      map((token) => {
        if (!token) {
          throw new MediaError(MediaErrorKind.Refused);
        }
        return new HttpHeaders({ [MEDIA_TOKEN_HEADER]: token });
      }),
    );
  }

  private send(file: Blob, signed: ISignedUploadDto): Observable<MediaUploadEvent> {
    const form = new FormData();
    Object.entries(signed.fields).forEach(([name, value]) => {
      form.set(name, value);
    });
    form.set('file', file);
    return this.http
      .post<ICloudinaryUploadDto>(signed.uploadUrl, form, {
        observe: 'events',
        reportUploadProgress: true,
      })
      .pipe(
        // Per event, not in total: a slow phone keeps going for as long as it keeps sending.
        timeout(this.timeoutMs),
        // mergeMap: one event in, at most one out, in order, so nothing can be dropped or reordered.
        mergeMap((event) => this.toUploadEvents(event)),
      );
  }

  private toUploadEvents(event: HttpEvent<ICloudinaryUploadDto>): MediaUploadEvent[] {
    if (event.type === HttpEventType.UploadProgress) {
      const percent = event.total ? Math.round((event.loaded / event.total) * FULL_PERCENT) : 0;
      return [{ kind: MediaUploadEventKind.Progress, percent }];
    }
    if (event.type === HttpEventType.Response && event.body !== null) {
      return [{ kind: MediaUploadEventKind.Uploaded, media: toUploadedMedia(event.body) }];
    }
    return [];
  }
}
