/** One audience card as stored in the backend. */
export interface IAudienceCardDto {
  /** Name of a registered icon; unknown names fall back to a default icon. */
  readonly icon: string;
  readonly title: string;
  readonly text: string;
  readonly tags: readonly string[];
}

/** "Who it's for" section as stored in the backend (`home/audiences`). */
export interface IAudiencesDto {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly cards: readonly IAudienceCardDto[];
}
