/** The crop step at the start of an uploaded image's `src` (D14). */
const CROP_STEP = /^c_crop,x_(\d+),y_(\d+),w_(\d+),h_(\d+)\//u;

/** The stored file's version and id. Local paths and full URLs don't match. */
const STORED_FILE = /^v\d+\/[^,:]+$/u;

/** The part of a stored file a use of it shows, in the file's pixels. */
export interface ICropRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** An uploaded image's `src`, taken apart. */
export interface IParsedImageSrc {
  /** The stored file's version and id, with no crop. */
  readonly source: string;
  /** The library entry's id: the file id's last part. */
  readonly id: string;
  /** This use's crop, or `null` when it shows the whole file. */
  readonly crop: ICropRect | null;
}

/**
 * @param src An image's `src`.
 * @returns Its parts, or `null` when it isn't an uploaded image.
 */
export function parseImageSrc(src: string): IParsedImageSrc | null {
  const step = CROP_STEP.exec(src);
  const source = step === null ? src : src.slice(step[0].length);
  if (!STORED_FILE.test(source)) {
    return null;
  }
  const [x, y, width, height] = (step?.slice(1) ?? []).map(Number);
  return {
    source,
    id: source.split('/').at(-1) ?? '',
    crop:
      x === undefined || y === undefined || width === undefined || height === undefined
        ? null
        : { x, y, width, height },
  };
}
