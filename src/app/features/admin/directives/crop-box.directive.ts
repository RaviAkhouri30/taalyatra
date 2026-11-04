import { Directive, input } from '@angular/core';

/** Where a crop frame sits over its image, as percentages of the image's size. */
export interface ICropBox {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

/** Positions a crop frame over its image; the numbers change as the owner moves it. */
@Directive({
  selector: '[appCropBox]',
  host: {
    '[style.left.%]': 'appCropBox().left',
    '[style.top.%]': 'appCropBox().top',
    '[style.width.%]': 'appCropBox().width',
    '[style.height.%]': 'appCropBox().height',
  },
})
export class CropBoxDirective {
  /** The frame's position. */
  public readonly appCropBox = input.required<ICropBox>();
}
