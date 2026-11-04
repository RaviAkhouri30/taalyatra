import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { Observable, catchError, defer, of, switchMap } from 'rxjs';
import {
  JPEG_OUTPUT_QUALITY,
  JPEG_TYPE,
  MAX_UPLOAD_WIDTH_PX,
  PNG_TYPE,
  TRANSPARENT_TYPES,
} from './cloudinary.constants';

/**
 * Redraws a photo before upload (D7, D8): it comes out no wider than Cloudinary would store it, so
 * a large phone photo fits the plan's limits and uploads faster, and with no metadata, so its
 * location never leaves the phone.
 */
export class ImagePreparer {
  private readonly document = inject(DOCUMENT);

  /**
   * @param file The photo the owner chose.
   * @returns The file to upload. A file the browser can't decode, like HEIC in Chrome, goes as it
   *   is: Cloudinary's incoming transformation removes its metadata and its limits still apply.
   */
  public prepare(file: File): Observable<Blob> {
    return defer(() => createImageBitmap(file)).pipe(
      // switchMap: createImageBitmap emits once, so this only sequences "decoded, then encode".
      switchMap((bitmap) => this.encode(bitmap, file.type)),
      catchError(() => of(file)),
    );
  }

  private encode(bitmap: ImageBitmap, type: string): Observable<Blob> {
    const scale = Math.min(1, MAX_UPLOAD_WIDTH_PX / bitmap.width);
    const canvas = this.document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const output = TRANSPARENT_TYPES.includes(type) ? PNG_TYPE : JPEG_TYPE;
    return new Observable<Blob>((subscriber) => {
      canvas.toBlob(
        (blob) => {
          if (blob === null) {
            subscriber.error(new Error('The image could not be encoded'));
            return;
          }
          subscriber.next(blob);
          subscriber.complete();
        },
        output,
        JPEG_OUTPUT_QUALITY,
      );
    });
  }
}
