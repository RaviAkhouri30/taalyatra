import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { BaseComponent } from '@shared/base/base-component';
import { type IMediaUploadItem } from '../../models/i-media-upload-item';
import { MediaUploadStatus } from '../../models/media-upload-status.enum';
import { MEDIA_ACCEPT } from '../../models/media-upload.constants';
import { MediaUploadViewModel } from '../../view-models/media-upload.view-model';

/**
 * Where photos come in (D13): drag and drop, or a real file input for the keyboard and phones.
 * Progress is announced to screen readers through the summary line.
 */
@Component({
  selector: 'app-media-upload',
  templateUrl: './media-upload.component.html',
  styleUrl: './media-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MediaUploadViewModel],
})
export class MediaUploadComponent extends BaseComponent<readonly IMediaUploadItem[]> {
  /** Emits each new library entry, once it's stored. */
  public readonly uploaded = outputFromObservable(inject(MediaUploadViewModel).uploaded$);

  protected override readonly model = inject(MediaUploadViewModel);
  protected readonly accept = MEDIA_ACCEPT;
  protected readonly status = MediaUploadStatus;
  protected readonly dragging = signal(false);

  /** @param input The file input, emptied so the same file can be chosen again. */
  protected choose(input: HTMLInputElement): void {
    this.model.add(Array.from(input.files ?? []));
    input.value = '';
  }

  /** @param event The drag, which must be cancelled for the zone to accept a drop. */
  protected dragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  /** @param event The drop; the browser would otherwise navigate to the file. */
  protected drop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    this.model.add(Array.from(event.dataTransfer?.files ?? []));
  }
}
