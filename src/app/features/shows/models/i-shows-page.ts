import { type IPageHeroDto } from '@shared/interfaces/i-page-hero';
import { type IStep } from '@shared/interfaces/i-step';

/** A venue type the group plays in. */
export interface IShowSetupDto {
  readonly title: string;
  readonly text: string;
}

/** Shows page copy as stored in `pages/shows` (the formats come from `showFormats`). */
export interface IShowsPageDto {
  readonly hero: IPageHeroDto;
  /** Hero button to the proposal form. */
  readonly heroPrimaryCta: string;
  /** Hero button to WhatsApp (the number comes from site config). */
  readonly heroWhatsAppCta: string;
  readonly formats: {
    readonly eyebrow: string;
    readonly title: string;
    readonly note: string;
    /** Labels of each format's specs. */
    readonly labels: {
      readonly ensemble: string;
      readonly setLength: string;
      readonly bestFor: string;
    };
  };
  readonly setups: {
    readonly eyebrow: string;
    readonly title: string;
    readonly items: readonly IShowSetupDto[];
    readonly note: string;
  };
  readonly process: {
    readonly eyebrow: string;
    readonly title: string;
    readonly steps: readonly IStep[];
    readonly primaryCta: string;
    readonly secondaryCta: string;
  };
}
