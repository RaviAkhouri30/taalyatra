import { type ILightboxLabels } from '@shared/interfaces/i-lightbox-labels';

/** Gallery heading and copy as stored in the backend (`home/gallery`). */
export interface IHomeGalleryDto {
  readonly eyebrow: string;
  readonly title: string;
  readonly cta: string;
  /** Accessible name of each tile, with `{alt}`. */
  readonly openLabel: string;
  readonly moreLabel: string;
  readonly moreUrl: string;
  readonly note: string;
  readonly viewer: ILightboxLabels;
}
