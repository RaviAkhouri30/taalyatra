import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { type FormControl } from '@angular/forms';
import { BaseComponent } from '@shared/base/base-component';
import { CONTENT_MAX_LENGTH } from '@shared/constants/content-limits.constants';
import { type IImage } from '@shared/interfaces/i-image';
import { type CropFrame } from '../../models/crop-frame.model';
import { type IImageFieldSchema } from '../../models/i-field-schema';
import { parseImageSrc } from '../../models/image-src';
import { type MediaAsset } from '../../models/media-asset.model';
import { ImageFieldViewModel } from '../../view-models/image-field.view-model';
import { ImageCropComponent } from '../image-crop/image-crop.component';
import { MediaPickerComponent } from '../media-picker/media-picker.component';

/** Which tool is open below the field. */
enum ImageFieldPanel {
  None = 'none',
  Picker = 'picker',
  Crop = 'crop',
}

/**
 * An image on the site (D12): its thumbnail, description, and the tools to choose and crop it. The
 * crop belongs to this use, so the same file can be square here and 4:3 elsewhere (D14).
 */
@Component({
  selector: 'app-image-field',
  imports: [ImageCropComponent, MediaPickerComponent, NgOptimizedImage],
  templateUrl: './image-field.component.html',
  styleUrl: './image-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ImageFieldViewModel],
  host: { '[style.--if-aspect]': 'field().aspect' },
})
export class ImageFieldComponent extends BaseComponent<MediaAsset | null> {
  /** The field's schema. */
  public readonly field = input.required<IImageFieldSchema>();
  /** Its control, holding the stored image. */
  public readonly control = input.required<FormControl<IImage>>();
  /** A page-unique id. */
  public readonly fieldId = input.required<string>();
  /** The ids of the hint and error describing this field. */
  public readonly describedBy = input.required<string>();

  protected override readonly model = inject(ImageFieldViewModel);

  protected readonly panels = ImageFieldPanel;
  protected readonly panel = signal(ImageFieldPanel.None);
  protected readonly maxLength = CONTENT_MAX_LENGTH.imageAlt;
  // The control isn't a signal: this is its value for the view, kept in step by `update`.
  protected readonly image = linkedSignal(() => this.control().value);
  /** Only uploaded files can be cropped: Cloudinary doesn't have the local ones. */
  protected readonly canCrop = computed(() => parseImageSrc(this.image().src) !== null);

  /** @param panel The tool to open; choosing the open one closes it. */
  protected toggle(panel: ImageFieldPanel): void {
    this.panel.update((open) => (open === panel ? ImageFieldPanel.None : panel));
  }

  protected toggleCrop(): void {
    this.toggle(ImageFieldPanel.Crop);
    if (this.panel() === ImageFieldPanel.Crop) {
      this.model.requestCrop(this.image().src);
    }
  }

  protected close(): void {
    this.panel.set(ImageFieldPanel.None);
  }

  /** @param alt The description as typed. */
  protected describe(alt: string): void {
    this.update({ ...this.image(), alt });
  }

  /** @param asset The chosen file. A new photo starts uncropped, keeping a typed description. */
  protected choose(asset: MediaAsset): void {
    const { description, width, height } = asset.dto;
    this.update({ src: asset.src, alt: this.image().alt || description, width, height });
    this.close();
  }

  /**
   * @param asset The stored file.
   * @param frame The chosen frame. Its size becomes the image's, to stop layout shift.
   */
  protected crop(asset: MediaAsset, frame: CropFrame): void {
    const { width, height } = frame.rect;
    this.update({
      ...this.image(),
      src: `${frame.transformation}/${asset.src}`,
      width,
      height,
    });
    this.close();
  }

  private update(image: IImage): void {
    this.image.set(image);
    this.control().setValue(image);
    this.control().markAsDirty();
  }
}
