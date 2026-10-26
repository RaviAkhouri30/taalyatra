import { type IImage } from '@shared/interfaces/i-image';

/** One experience as stored in the backend. */
export interface IExperienceDto {
  readonly name: string;
  /** Short label above the name, e.g. "Folk rhythm". */
  readonly tag: string;
  /** Filter category; must be one of the section's categories. */
  readonly category: string;
  readonly image: IImage;
  readonly description: string;
  readonly duration: string;
  readonly groupSize: string;
  readonly venue: string;
}

/** The signature experience, shown as a wide card with its own call to action. */
export interface IFeaturedExperienceDto extends IExperienceDto {
  readonly cta: string;
}

/** Experiences section as stored in the backend (`home/experiences`). */
export interface IExperiencesDto {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly filterLabel: string;
  /** Label of the chip that shows every category. */
  readonly allLabel: string;
  readonly categories: readonly string[];
  readonly featured: IFeaturedExperienceDto;
  readonly items: readonly IExperienceDto[];
  readonly emptyMessage: string;
}
