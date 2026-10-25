/** A reassurance card as stored in the backend (`home/trust`). */
export interface ITrustCardDto {
  /** Name of a registered icon; unknown names fall back to a default icon. */
  readonly icon: string;
  readonly title: string;
  readonly text: string;
}
