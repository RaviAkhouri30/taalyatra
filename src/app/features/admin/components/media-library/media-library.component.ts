import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { type MediaAsset } from '../../models/media-asset.model';
import { MediaLibraryViewModel } from '../../view-models/media-library.view-model';
import { MediaCardComponent } from '../media-card/media-card.component';
import { MediaUploadComponent } from '../media-upload/media-upload.component';

/** The media library page (G5): upload photos, and see and describe every stored image. */
@Component({
  selector: 'app-media-library',
  imports: [MediaCardComponent, MediaUploadComponent],
  templateUrl: './media-library.component.html',
  styleUrl: './media-library.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MediaLibraryViewModel],
})
export default class MediaLibraryComponent extends BaseComponent<readonly MediaAsset[]> {
  protected override readonly model = inject(MediaLibraryViewModel);
}
