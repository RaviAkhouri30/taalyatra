/** "Latest videos" heading as stored in the backend (`home/videos`). */
export interface IHomeVideosDto {
  readonly eyebrow: string;
  readonly title: string;
  /** Label of the link to the Videos page. */
  readonly cta: string;
  /** How many of the newest videos to show. */
  readonly count: number;
  /** Accessible name of each card, with `{title}`. */
  readonly watchLabel: string;
}
