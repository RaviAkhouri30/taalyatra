/** A place the team plays; `active` marks cities served today. */
export interface ICityDto {
  readonly name: string;
  readonly active: boolean;
}

/** "Where we play" section as stored in the backend (`home/cities`). */
export interface ICitiesDto {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly cities: readonly ICityDto[];
}
