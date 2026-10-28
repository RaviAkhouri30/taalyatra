import { type IPageHeroDto } from '@shared/interfaces/i-page-hero';

/** Videos page copy as stored in `pages/videos` (the videos themselves come from `videos`). */
export interface IVideosPageDto {
  readonly hero: IPageHeroDto;
  /** Accessible name of the category chips. */
  readonly filterLabel: string;
  /** Chip that shows every video. */
  readonly allLabel: string;
  /** Result count, with `{count}`. */
  readonly showingLabel: string;
  /** Line above the featured video, with `{category}`. */
  readonly featuredLabel: string;
  /** Button to the YouTube channel (its address comes from the site's social links). */
  readonly channelCta: string;
  /** Button to the proposal form. */
  readonly planCta: string;
}
