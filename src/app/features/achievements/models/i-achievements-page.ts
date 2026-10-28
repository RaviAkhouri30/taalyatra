import { type IPageCtaDto } from '@shared/interfaces/i-page-cta';
import { type IPageHeroDto } from '@shared/interfaces/i-page-hero';

/** A headline number, e.g. "[20]+ Years in music". */
export interface IAchievementStatDto {
  readonly value: string;
  readonly label: string;
}

/** A point on the milestones timeline. */
export interface IMilestoneDto {
  /** A year, or a word such as "Today". */
  readonly year: string;
  readonly title: string;
  readonly text: string;
}

/** An award, honour or certification. */
export interface IRecognitionDto {
  /** Name of a registered icon; unknown names fall back to a default icon. */
  readonly icon: string;
  readonly title: string;
  readonly text: string;
}

/** A press mention; `url` is empty until the article is linked. */
export interface IPressDto {
  readonly publication: string;
  readonly headline: string;
  readonly year: string;
  readonly url: string;
}

/** A notable performance. */
export interface IPerformanceDto {
  readonly event: string;
  readonly venue: string;
  readonly year: string;
}

/** A titled list section of the page. */
export interface IAchievementSectionDto<T> {
  readonly eyebrow: string;
  readonly title: string;
  readonly items: readonly T[];
}

/** Achievements page copy as stored in `pages/achievements`. */
export interface IAchievementsPageDto {
  readonly hero: IPageHeroDto;
  readonly stats: readonly IAchievementStatDto[];
  readonly milestones: IAchievementSectionDto<IMilestoneDto>;
  readonly recognition: IAchievementSectionDto<IRecognitionDto>;
  readonly press: IAchievementSectionDto<IPressDto>;
  readonly performances: IAchievementSectionDto<IPerformanceDto>;
  readonly cta: IPageCtaDto;
}
