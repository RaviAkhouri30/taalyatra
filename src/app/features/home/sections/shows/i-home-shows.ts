/** Shows teaser heading as stored in the backend (`home/shows`); formats come from `showFormats`. */
export interface IHomeShowsDto {
  readonly eyebrow: string;
  readonly title: string;
  /** Label of the link to the Shows page. */
  readonly cta: string;
  readonly lead: string;
}
