/** Hero content as stored in the backend (`home/hero`). Editable from the admin "Content" tab. */
export interface IHomeHeroDto {
  readonly eyebrow: string;
  readonly title: string;
  /** Accent-coloured words after the title. */
  readonly highlight: string;
  readonly lead: string;
  readonly primaryCta: string;
  readonly whatsAppCta: string;
  /** Prefix of the call button; the phone number is appended. */
  readonly callCtaPrefix: string;
  /** Audience tags shown as pills. */
  readonly audiences: readonly string[];
  readonly gameCta: string;
}
