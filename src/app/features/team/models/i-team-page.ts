import { type IPageCtaDto } from '@shared/interfaces/i-page-cta';
import { type IPageHeroDto } from '@shared/interfaces/i-page-hero';

/** One habit in "How we show up". */
export interface ITeamValueDto {
  readonly title: string;
  readonly text: string;
}

/** Team page copy as stored in `pages/team` (the members come from `team`). */
export interface ITeamPageDto {
  readonly hero: IPageHeroDto;
  /** Label before each member's fun fact, e.g. "Fun fact:". */
  readonly funFactLabel: string;
  readonly values: {
    readonly eyebrow: string;
    readonly title: string;
    readonly items: readonly ITeamValueDto[];
  };
  readonly cta: IPageCtaDto;
}
