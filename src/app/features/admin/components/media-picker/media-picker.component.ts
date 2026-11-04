import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { type MediaAsset } from '../../models/media-asset.model';
import { MediaLibraryViewModel } from '../../view-models/media-library.view-model';
import { MediaUploadComponent } from '../media-upload/media-upload.component';

/** Choose a photo for a field: pick from the library, or upload a new one and pick that. */
@Component({
  selector: 'app-media-picker',
  imports: [MediaUploadComponent, NgOptimizedImage],
  templateUrl: './media-picker.component.html',
  styleUrl: './media-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MediaLibraryViewModel],
})
export class MediaPickerComponent extends BaseComponent<readonly MediaAsset[]> {
  /** Emits the chosen image. */
  public readonly picked = output<MediaAsset>();
  /** Emits when the owner backs out. */
  public readonly cancelled = output();

  protected override readonly model = inject(MediaLibraryViewModel);
}
