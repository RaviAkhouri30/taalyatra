/** An image with its intrinsic size (needed by `NgOptimizedImage` to prevent layout shift). */
export interface IImage {
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}
