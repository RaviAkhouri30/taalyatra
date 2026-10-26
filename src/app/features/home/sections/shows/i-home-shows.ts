/** One show format in the home teaser. */
export interface IShowTeaserDto {
  /** Name of a registered icon; unknown names fall back to a default icon. */
  readonly icon: string;
  readonly title: string;
  readonly text: string;
}

/** Shows teaser as stored in the backend (`home/shows`). */
export interface IHomeShowsDto {
  readonly eyebrow: string;
  readonly title: string;
  /** Label of the link to the Shows page. */
  readonly cta: string;
  readonly lead: string;
  readonly formats: readonly IShowTeaserDto[];
}
