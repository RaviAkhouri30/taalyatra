import { Service, inject } from '@angular/core';
import { type Observable, map } from 'rxjs';
import { DocumentWriteKind } from '@core/enums/document-write-kind.enum';
import { IDocumentStore } from '@core/interfaces/i-document-store';
import { type IUploadedMedia } from '@core/interfaces/i-media-service';
import { CLOCK } from '@core/tokens/clock.token';
import { CONTENT_MAX_LENGTH } from '@shared/constants/content-limits.constants';
import { type IMediaAssetDto, MEDIA_COLLECTION } from '../models/i-media-asset';
import { MediaAsset } from '../models/media-asset.model';

/**
 * The library of uploaded images (D11). Entries aren't drafted: visitors can't see a file until a
 * published document uses it, so an upload is safe to store straight away.
 */
@Service()
export class MediaLibraryService {
  private readonly store = inject(IDocumentStore);
  private readonly clock = inject(CLOCK);

  /** @returns Every uploaded image, newest first. */
  public assets(): Observable<readonly MediaAsset[]> {
    return this.store.readAll(MEDIA_COLLECTION).pipe(
      map((documents) =>
        [...documents.values()]
          .map((fields) => MediaAsset.fromFields(fields))
          .filter((asset) => asset !== null)
          .sort((first, second) => second.dto.uploadedAt.localeCompare(first.dto.uploadedAt)),
      ),
    );
  }

  /**
   * @param media The stored file.
   * @param name The name of the file the owner chose.
   * @returns The new library entry, once it's saved.
   */
  public register(media: IUploadedMedia, name: string): Observable<MediaAsset> {
    const dto: IMediaAssetDto = {
      ...media,
      name: name.slice(0, CONTENT_MAX_LENGTH.mediaName),
      description: '',
      uploadedAt: this.clock.now().toISOString(),
    };
    const asset = new MediaAsset(dto);
    return this.store
      .commit([
        {
          kind: DocumentWriteKind.Set,
          path: `${MEDIA_COLLECTION}/${asset.id}`,
          fields: { ...dto },
        },
      ])
      .pipe(map(() => asset));
  }
}
