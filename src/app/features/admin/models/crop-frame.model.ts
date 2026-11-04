import { type ICropRect } from './image-src';

/** The closest the crop can zoom in, so a frame stays big enough to look sharp. */
export const CROP_MAX_ZOOM = 5;
export const CROP_MIN_ZOOM = 1;

const PERCENT = 100;
const HALF = 0.5;

/**
 * A crop frame over a stored file (D14). Immutable: every change returns a new frame, always inside
 * the image and always in the slot's aspect ratio.
 */
export class CropFrame {
  private constructor(
    private readonly imageWidth: number,
    private readonly imageHeight: number,
    private readonly aspect: number,
    /** The frame, in the file's pixels. */
    public readonly rect: ICropRect,
  ) {}

  /** How far it's zoomed in: 1 is the largest frame that fits. */
  public get zoom(): number {
    return this.largestWidth / this.rect.width;
  }

  /** The Cloudinary crop step this frame stands for. */
  public get transformation(): string {
    const { x, y, width, height } = this.rect;
    return `c_crop,x_${String(x)},y_${String(y)},w_${String(width)},h_${String(height)}`;
  }

  /** Where to draw it over the image, as percentages of the image's size. */
  public get position(): {
    readonly left: number;
    readonly top: number;
    readonly width: number;
    readonly height: number;
  } {
    const { x, y, width, height } = this.rect;
    return {
      left: (x / this.imageWidth) * PERCENT,
      top: (y / this.imageHeight) * PERCENT,
      width: (width / this.imageWidth) * PERCENT,
      height: (height / this.imageHeight) * PERCENT,
    };
  }

  private get largestWidth(): number {
    return Math.min(this.imageWidth, this.imageHeight * this.aspect);
  }

  /**
   * @param imageWidth The file's width.
   * @param imageHeight The file's height.
   * @param aspect The slot's width divided by its height.
   * @param saved An earlier crop to start from; ignored if it no longer fits this file.
   * @returns The saved frame, or the largest centred frame.
   */
  public static create(
    imageWidth: number,
    imageHeight: number,
    aspect: number,
    saved: ICropRect | null = null,
  ): CropFrame {
    const fits =
      saved !== null &&
      saved.width > 0 &&
      saved.x + saved.width <= imageWidth &&
      saved.y + saved.height <= imageHeight;
    return fits
      ? new CropFrame(imageWidth, imageHeight, aspect, saved)
      : new CropFrame(imageWidth, imageHeight, aspect, {
          x: 0,
          y: 0,
          width: imageWidth,
          height: imageHeight,
        }).zoomTo(CROP_MIN_ZOOM);
  }

  /**
   * @param dx Pixels to move right; negative moves left.
   * @param dy Pixels to move down; negative moves up.
   * @returns The frame moved, stopping at the image's edges.
   */
  public moveBy(dx: number, dy: number): CropFrame {
    const { x, y, width, height } = this.rect;
    return this.at(x + dx, y + dy, width, height);
  }

  /**
   * @param zoom How far to zoom in; kept between the minimum and maximum.
   * @returns The frame at that zoom, around the same centre.
   */
  public zoomTo(zoom: number): CropFrame {
    const limited = Math.min(CROP_MAX_ZOOM, Math.max(CROP_MIN_ZOOM, zoom));
    const width = Math.round(this.largestWidth / limited);
    const height = Math.min(this.imageHeight, Math.round(width / this.aspect));
    const { x, y, width: oldWidth, height: oldHeight } = this.rect;
    return this.at(x + (oldWidth - width) * HALF, y + (oldHeight - height) * HALF, width, height);
  }

  private at(x: number, y: number, width: number, height: number): CropFrame {
    return new CropFrame(this.imageWidth, this.imageHeight, this.aspect, {
      x: Math.round(Math.min(this.imageWidth - width, Math.max(0, x))),
      y: Math.round(Math.min(this.imageHeight - height, Math.max(0, y))),
      width,
      height,
    });
  }
}
