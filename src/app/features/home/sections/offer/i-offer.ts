/** One package in a seasonal offer. */
export interface IOfferCardDto {
  readonly title: string;
  readonly text: string;
  /** Duration and price line (a visible placeholder until the business fills it in). */
  readonly note: string;
}

/** Seasonal offer as stored in the backend (`home/offer`). Editable from the admin "Offers" tab. */
export interface IOfferDto {
  /** Festive particle theme name, e.g. "sparks". */
  readonly theme: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly cards: readonly IOfferCardDto[];
  readonly primaryCta: string;
  readonly whatsAppCta: string;
  readonly footnote: string;
}
