import { Injectable, inject, signal } from '@angular/core';
import {
  type Observable,
  EMPTY,
  Subject,
  catchError,
  concatMap,
  filter,
  finalize,
  merge,
  switchMap,
  tap,
} from 'rxjs';
import { MediaUploadEventKind } from '@core/enums/media-upload-event-kind.enum';
import { IMediaService, MediaError, type MediaUploadEvent } from '@core/interfaces/i-media-service';
import { mediaFileRefusal } from '../models/media-file';
import { type MediaAsset } from '../models/media-asset.model';
import { MEDIA_ERROR_TEXT } from '../models/media-upload.constants';
import { MediaUsageService } from '../services/media-usage.service';
import { EditorLayoutViewModel } from './editor-layout.view-model';
import { MediaLibraryViewModel } from './media-library.view-model';

/** What a card's message says. */
export const MEDIA_MANAGE_TEXT = {
  inUse: 'This photo is in use, so it can’t be deleted. Remove or replace it first.',
  deleteFailed: 'This photo couldn’t be deleted. Try again.',
  checkFailed: 'Couldn’t check where this photo is used, so it wasn’t deleted. Try again.',
  replaceFailed: 'The new photo was uploaded, but couldn’t be put in place. Try again.',
  replacedUnused: 'Replaced. It wasn’t used anywhere, so there’s nothing to review.',
  replaced: (documents: number) =>
    `Replaced in ${String(documents)} ${documents === 1 ? 'place' : 'places'} as a draft. Check any crops, then publish.`,
} as const;

/** A message on one card. */
export interface IMediaNotice {
  readonly id: string;
  readonly text: string;
}

/** One replace request from a card. */
interface IMediaReplacement {
  readonly asset: MediaAsset;
  readonly file: File;
}

const NO_USES: readonly string[] = [];

/**
 * The library page's actions, on top of listing and describing: where each image is used (G5),
 * replace (G6), and delete, which is refused while an image is in use (G7).
 */
@Injectable()
export class MediaManageViewModel extends MediaLibraryViewModel {
  /** The card asking the owner to confirm a delete. */
  public readonly confirmingDelete = signal<string | null>(null);
  /** The card with an action running. */
  public readonly busyId = signal<string | null>(null);
  /** The latest message. */
  public readonly notice = signal<IMediaNotice | null>(null);

  private readonly media = inject(IMediaService);
  private readonly usage = inject(MediaUsageService);
  private readonly layout = inject(EditorLayoutViewModel);
  private readonly uses = signal<ReadonlyMap<string, readonly string[]>>(new Map());
  private readonly deleteChecks = new Subject<MediaAsset>();
  private readonly deletions = new Subject<MediaAsset>();
  private readonly replacements = new Subject<IMediaReplacement>();

  /**
   * @param id A library entry's id.
   * @returns Where it's used.
   */
  public usesOf(id: string): readonly string[] {
    return this.uses().get(id) ?? NO_USES;
  }

  /** @param asset The image the owner wants to delete; checked afresh, as drafts may have changed. */
  public askToDelete(asset: MediaAsset): void {
    this.notice.set(null);
    this.deleteChecks.next(asset);
  }

  /** @param asset The image to delete, once the owner has confirmed. */
  public confirmDelete(asset: MediaAsset): void {
    this.deletions.next(asset);
  }

  public cancelDelete(): void {
    this.confirmingDelete.set(null);
  }

  /**
   * @param asset The image to replace.
   * @param file The new photo.
   */
  public replace(asset: MediaAsset, file: File): void {
    const refusal = mediaFileRefusal(file);
    if (refusal !== '') {
      this.notice.set({ id: asset.id, text: refusal });
      return;
    }
    this.notice.set(null);
    this.replacements.next({ asset, file });
  }

  protected override attachViewHandler(): Observable<unknown> {
    return merge(super.attachViewHandler(), this.loadUses());
  }

  protected override attachCommandHandler(): Observable<unknown> {
    return merge(
      super.attachCommandHandler(),
      // switchMap: only the latest delete request matters.
      this.deleteChecks.pipe(switchMap((asset) => this.checkDelete(asset))),
      // concatMap: actions run one at a time, so they can't overwrite each other's results.
      this.deletions.pipe(concatMap((asset) => this.deleteAsset(asset))),
      this.replacements.pipe(concatMap((request) => this.replaceAsset(request))),
    );
  }

  private loadUses(): Observable<unknown> {
    return this.usage.usages().pipe(
      tap((uses) => {
        this.uses.set(uses);
      }),
      // The list still works without it; delete checks again for itself.
      catchError((error: unknown) => {
        this.logger.error('Image usage failed to load', error);
        return EMPTY;
      }),
    );
  }

  private checkDelete(asset: MediaAsset): Observable<unknown> {
    return this.usage.usages().pipe(
      tap((uses) => {
        this.uses.set(uses);
        const used = uses.has(asset.id);
        this.confirmingDelete.set(used ? null : asset.id);
        if (used) {
          this.notice.set({
            id: asset.id,
            text: MEDIA_MANAGE_TEXT.inUse,
          });
        }
      }),
      catchError(() => this.fail(asset, MEDIA_MANAGE_TEXT.checkFailed)),
    );
  }

  private deleteAsset(asset: MediaAsset): Observable<unknown> {
    this.busyId.set(asset.id);
    // The file first: if the entry's removal then fails, a retry finds the file gone, which counts
    // as done, so nothing is left that the library can't see (D18).
    return this.media.remove(asset.dto.publicId).pipe(
      concatMap(() => this.library.remove(asset)),
      tap(() => {
        this.confirmingDelete.set(null);
        this.setData((this.data() ?? []).filter((item) => item.id !== asset.id));
      }),
      catchError(() => this.fail(asset, MEDIA_MANAGE_TEXT.deleteFailed)),
      finalize(() => {
        this.busyId.set(null);
      }),
    );
  }

  private replaceAsset({ asset, file }: IMediaReplacement): Observable<unknown> {
    this.busyId.set(asset.id);
    return this.media.upload(file).pipe(
      filter(
        (event): event is MediaUploadEvent & { kind: MediaUploadEventKind.Uploaded } =>
          event.kind === MediaUploadEventKind.Uploaded,
      ),
      // concatMap: one stored file, then its entry, then its uses.
      concatMap(({ media }) => this.library.register(media, file.name, asset.dto.description)),
      concatMap((next) => this.putInPlace(asset, next)),
      catchError((error: unknown) => this.fail(asset, MEDIA_ERROR_TEXT[MediaError.kindOf(error)])),
      finalize(() => {
        this.busyId.set(null);
      }),
    );
  }

  private putInPlace(old: MediaAsset, next: MediaAsset): Observable<unknown> {
    this.added(next);
    return this.usage.replace(old, next).pipe(
      tap((documents) => {
        const text =
          documents === 0
            ? MEDIA_MANAGE_TEXT.replacedUnused
            : MEDIA_MANAGE_TEXT.replaced(documents);
        this.notice.set({ id: next.id, text });
        this.layout.refreshChanges();
      }),
      concatMap(() => this.loadUses()),
      // The new file is safely in the library, so the owner can retry from its card.
      catchError(() => this.fail(next, MEDIA_MANAGE_TEXT.replaceFailed)),
    );
  }

  /** Reports a failure on one card; returning nothing keeps the long-lived stream alive. */
  private fail(asset: MediaAsset, text: string): Observable<never> {
    this.notice.set({ id: asset.id, text });
    this.confirmingDelete.set(null);
    return EMPTY;
  }
}
