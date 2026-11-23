import { type IHideable } from '@shared/interfaces/i-hideable';
/** One package in a seasonal offer. */
export interface IOfferCardDto extends IHideable {
  readonly title: string;
  readonly text: string;
  /** Duration and price line (a visible placeholder until the business fills it in). */
  readonly note: string;
}

/** Seasonal offer as stored in the backend (`home/offer`). Editable from the admin "Offers" tab. */
export interface IOfferDto {
  /**
   * The animation as chosen before 2.16.0 ("sparks" or "none"), read only while the offer has no
   * festival (`site/config` `promotion.festival`).
   */
  readonly theme?: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly cards: readonly IOfferCardDto[];
  readonly primaryCta: string;
  readonly whatsAppCta: string;
  readonly footnote: string;
}
