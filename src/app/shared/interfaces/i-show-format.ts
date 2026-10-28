import { type IImage } from './i-image';

/** Extra copy for the featured format's spotlight. */
export interface IShowSpotlightDto {
  readonly eyebrow: string;
  readonly title: string;
  /** Button to the proposal form. */
  readonly primaryCta: string;
  /** Button to the Videos page. */
  readonly secondaryCta: string;
}

/**
 * A show format as stored in `showFormats` (ADR-0011): one source for the home teaser (icon,
 * title, text) and the Shows page (plus the specs).
 */
export interface IShowFormatDto {
  /** Name of a registered icon; unknown names fall back to a default icon. */
  readonly icon: string;
  readonly title: string;
  readonly text: string;
  /** Players in the ensemble, e.g. "6–8 players". */
  readonly ensemble: string;
  /** Length of the set, e.g. "60–90 min". */
  readonly setLength: string;
  /** Occasions it suits. */
  readonly bestFor: string;
  /** Card image; a path in storage, so a real photo can replace the illustration. */
  readonly image: IImage;
  /** Shown as the spotlight above the other formats (home teaser and Shows page). */
  readonly featured: boolean;
  /** Spotlight copy for a featured format; `null` otherwise. */
  readonly spotlight: IShowSpotlightDto | null;
}
